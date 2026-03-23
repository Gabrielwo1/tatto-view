import { useState } from 'react';
import { useStore } from '../../store';
import type { FichaSubmission } from '../../store';

export default function AdminFichaSubmissions() {
  const submissions = useStore((s) => s.fichaSubmissions);
  const deleteFichaSubmission = useStore((s) => s.deleteFichaSubmission);
  const [selected, setSelected] = useState<FichaSubmission | null>(null);
  const [search, setSearch] = useState('');

  const filtered = submissions.filter((s) =>
    s.nome.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.tatuadoresSelecionados.join(' ').toLowerCase().includes(search.toLowerCase())
  );

  function handleDelete(id: string) {
    if (confirm('Excluir esta ficha permanentemente?')) {
      deleteFichaSubmission(id);
      if (selected?.id === id) setSelected(null);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function formatBirthDate(iso: string) {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  function exportCSV() {
    const headers = [
      'Data', 'Nome', 'Email', 'CPF', 'Nascimento', 'Telefone',
      'Cidade', 'CEP', 'Endereço', 'Tatuador', 'Local do Corpo',
      'Valor', 'Data Sessão', 'Condições', 'Detalhes', 'Tel. Emergência'
    ];
    const rows = filtered.map((s) => [
      formatDate(s.submittedAt),
      s.nome, s.email, s.cpf,
      formatBirthDate(s.dataNascimento),
      s.telefone, s.cidade, s.cep, s.endereco,
      [...s.tatuadoresSelecionados, s.outroTatuador ? `Outro: ${s.outroTatuador}` : ''].filter(Boolean).join(' / '),
      s.localCorpo, s.valorAcordado, formatBirthDate(s.dataAssinatura),
      Object.entries(s.conditions).filter(([, v]) => v === 'sim').map(([k]) => k).join('; '),
      s.detalhesCondicoes, s.telefoneEmergencia,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fichas-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-full min-h-screen">

      {/* ── List panel ── */}
      <div className={`flex flex-col ${selected ? 'hidden md:flex md:w-80 lg:w-96' : 'flex-1'} border-r border-white/10`}>

        {/* Header */}
        <div className="px-6 pt-8 pb-4 border-b border-white/10">
          <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">Admin</p>
          <div className="flex items-end justify-between gap-4">
            <h1 className="font-display text-4xl text-white uppercase tracking-wide leading-none">
              Fichas
            </h1>
            <div className="flex items-center gap-2 pb-0.5">
              <span className="font-body text-xs text-gray-600">{submissions.length} ficha(s)</span>
              {submissions.length > 0 && (
                <button
                  onClick={exportCSV}
                  title="Exportar CSV"
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 text-gray-500 hover:text-white hover:border-white/30 transition-colors font-body text-[10px] font-semibold tracking-widest uppercase"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  CSV
                </button>
              )}
            </div>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, email ou tatuador..."
            className="mt-4 w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-white/30 placeholder:text-gray-700"
          />
        </div>

        {/* Submissions list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 py-20 text-center">
              <svg className="w-12 h-12 text-gray-800 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="font-body text-sm text-gray-600">
                {search ? 'Nenhuma ficha encontrada.' : 'Nenhuma ficha preenchida ainda.'}
              </p>
              <p className="font-body text-xs text-gray-700 mt-1">
                As fichas enviadas pelos clientes aparecerão aqui.
              </p>
            </div>
          ) : (
            filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className={`w-full text-left px-6 py-4 border-b border-white/5 transition-colors hover:bg-white/5 ${
                  selected?.id === s.id ? 'bg-white/8 border-l-2 border-l-white' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-body text-sm font-semibold text-white truncate">{s.nome}</p>
                    <p className="font-body text-xs text-gray-500 truncate">{s.email}</p>
                    <p className="font-body text-xs text-gray-700 mt-1">
                      {[...s.tatuadoresSelecionados, s.outroTatuador ? `Outro: ${s.outroTatuador}` : '']
                        .filter(Boolean).join(', ') || '—'}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-gray-700 shrink-0 mt-0.5">
                    {formatDate(s.submittedAt).replace(',', '')}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Detail panel ── */}
      {selected ? (
        <div className="flex-1 overflow-y-auto">
          {/* Detail header */}
          <div className="sticky top-0 bg-zinc-950 border-b border-white/10 px-6 py-4 flex items-center justify-between gap-4 z-10">
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors font-body text-xs font-semibold tracking-widest uppercase"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar
            </button>
            <span className="font-mono text-xs text-gray-600">{formatDate(selected.submittedAt)}</span>
            <button
              onClick={() => handleDelete(selected.id)}
              className="flex items-center gap-1.5 text-gray-600 hover:text-red-400 transition-colors font-body text-xs font-semibold tracking-widest uppercase"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Excluir
            </button>
          </div>

          <div className="px-6 py-8 max-w-2xl space-y-8">

            {/* 01 Identificação */}
            <Section label="01" title="Identificação">
              <Grid>
                <Field label="Nome">{selected.nome || '—'}</Field>
                <Field label="Email">{selected.email || '—'}</Field>
                <Field label="CPF">{selected.cpf || '—'}</Field>
                <Field label="Nascimento">{formatBirthDate(selected.dataNascimento)}</Field>
                <Field label="Telefone">{selected.telefone || '—'}</Field>
                <Field label="Tel. Emergência">{selected.telefoneEmergencia || '—'}</Field>
                <Field label="Cidade">{selected.cidade || '—'}</Field>
                <Field label="CEP">{selected.cep || '—'}</Field>
                <Field label="Endereço" wide>{selected.endereco || '—'}</Field>
              </Grid>
            </Section>

            {/* 02 Procedimento */}
            <Section label="02" title="Procedimento">
              <Grid>
                <Field label="Tatuador(es)" wide>
                  {[
                    ...selected.tatuadoresSelecionados,
                    selected.outroTatuador ? `Outro: ${selected.outroTatuador}` : '',
                  ].filter(Boolean).join(', ') || '—'}
                </Field>
                <Field label="Local do Corpo">{selected.localCorpo || '—'}</Field>
                <Field label="Valor Acordado">{selected.valorAcordado || '—'}</Field>
                <Field label="Data da Sessão">{formatBirthDate(selected.dataAssinatura)}</Field>
              </Grid>
            </Section>

            {/* 03 Histórico Clínico */}
            <Section label="03" title="Histórico Clínico">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mb-4">
                {Object.entries(selected.conditions).map(([label, answer]) => (
                  <div key={label} className="flex items-center justify-between px-3 py-2 bg-white/3 border border-white/5">
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className={`font-body text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 ${
                      answer === 'sim'
                        ? 'bg-red-500/20 text-red-400'
                        : answer === 'nao'
                        ? 'bg-white/5 text-gray-600'
                        : 'text-gray-700'
                    }`}>
                      {answer ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
              {selected.detalhesCondicoes && (
                <div className="px-3 py-3 bg-white/3 border border-white/5">
                  <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-1">Detalhes</p>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{selected.detalhesCondicoes}</p>
                </div>
              )}
            </Section>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-gray-800">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="font-body text-sm tracking-widest uppercase">Selecione uma ficha</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="font-display text-lg text-red-500">{label}.</span>
        <h2 className="font-body text-xs font-semibold tracking-widest uppercase text-gray-400">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? 'col-span-2' : ''}>
      <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-0.5">{label}</p>
      <p className="text-sm text-white">{children}</p>
    </div>
  );
}
