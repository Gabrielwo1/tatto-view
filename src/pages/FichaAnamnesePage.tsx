import { useState } from 'react';

const TATUADORES = [
  'Bruna Lopes',
  'Dionatan Lacerda',
  'Kodai Muniz',
  'Lucas Vasconcellos',
  'Luiza Vasconcellos',
  'Marília Garcia',
  'Rafaella Golio',
  'Outro',
];

const CONDITIONS: { label: string }[] = [
  { label: 'Alteração na pressão' },
  { label: 'Epilepsia / Convulsão / Desmaio constante' },
  { label: 'Diabetes / Hipoglicemia' },
  { label: 'Hemofilia' },
  { label: 'Soropositivo' },
  { label: 'Hepatite A B C' },
  { label: 'Dificuldade de cicatrização' },
  { label: 'Alergias' },
  { label: 'Faz uso de medicamentos' },
  { label: 'Tem alguma doença crônica' },
  { label: 'Gestante' },
  { label: 'Alimentou-se bem hoje' },
];

type ConditionAnswer = 'sim' | 'nao' | null;

export default function FichaAnamnesePage() {
  const [form, setForm] = useState({
    email: '',
    nome: '',
    dataNascimento: '',
    cpf: '',
    endereco: '',
    cidade: '',
    cep: '',
    telefone: '',
    localCorpo: '',
    valorAcordado: '',
    detalhesCondicoes: '',
    telefoneEmergencia: '',
    dataAssinatura: '',
    concordo1: false,
    concordo2: false,
    concordo3: false,
  });

  const [tatuadores, setTatuadores] = useState<Record<string, boolean>>(
    Object.fromEntries(TATUADORES.map((t) => [t, false]))
  );

  const [conditions, setConditions] = useState<Record<string, ConditionAnswer>>(
    Object.fromEntries(CONDITIONS.map((c) => [c.label, null]))
  );

  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function toggleTatuador(name: string) {
    setTatuadores((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  function setCondition(label: string, answer: 'sim' | 'nao') {
    setConditions((prev) => ({
      ...prev,
      [label]: prev[label] === answer ? null : answer,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  const allTermsAccepted = form.concordo1 && form.concordo2 && form.concordo3;

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black px-6 text-center">
        <svg className="w-16 h-16 mb-6" viewBox="0 0 24 24" fill="none" stroke="#e63737" strokeWidth="1.5">
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="10" />
        </svg>
        <h2 className="text-white font-black text-3xl uppercase tracking-wide mb-3">Registro Enviado!</h2>
        <p className="text-white/60 text-sm max-w-xs">
          Sua ficha foi registrada com sucesso. Aguarde o contato do estúdio.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* ── Header ── */}
      <div className="px-6 pt-10 pb-8">
        <p className="text-xs font-bold tracking-[0.35em] uppercase mb-3" style={{ color: '#e63737' }}>
          Clinical Record
        </p>
        <h1 className="text-5xl font-black uppercase leading-none tracking-tight mb-6">
          FICHA DE<br />ANAMNESE
        </h1>
        <p className="text-sm text-white/60 leading-relaxed">
          A precisão desta ficha garante a segurança da sua saúde e a integridade do seu procedimento.
          Todos os dados são confidenciais ao El Dude Tattoo.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ── 01. Identificação ── */}
        <div className="px-6 pb-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-black" style={{ color: '#e63737' }}>01.</span>
            <span className="text-base font-black uppercase tracking-widest">IDENTIFICAÇÃO</span>
          </div>
          <p className="text-xs text-white/50 mb-6">
            Dados fundamentais para registro civil e contato pós-procedimento.
          </p>

          <div className="flex flex-col gap-5">
            <Field label="E-MAIL *">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
                className="input-field"
              />
            </Field>

            <Field label="NOME COMPLETO *">
              <input
                type="text"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="DIGITE SEU NOME"
                required
                className="input-field"
              />
            </Field>

            <Field label="DATA DE NASCIMENTO *">
              <input
                type="date"
                name="dataNascimento"
                value={form.dataNascimento}
                onChange={handleChange}
                required
                className="input-field"
              />
            </Field>

            <Field label="CPF *">
              <input
                type="text"
                name="cpf"
                value={form.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                required
                className="input-field"
              />
            </Field>

            <Field label="ENDEREÇO">
              <input
                type="text"
                name="endereco"
                value={form.endereco}
                onChange={handleChange}
                placeholder="Rua, número, bairro"
                className="input-field"
              />
            </Field>

            <Field label="CIDADE *">
              <input
                type="text"
                name="cidade"
                value={form.cidade}
                onChange={handleChange}
                placeholder="Sua cidade"
                required
                className="input-field"
              />
            </Field>

            <Field label="CEP">
              <input
                type="text"
                name="cep"
                value={form.cep}
                onChange={handleChange}
                placeholder="00000-000"
                className="input-field"
              />
            </Field>

            <Field label="TELEFONE *">
              <input
                type="tel"
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                required
                className="input-field"
              />
            </Field>
          </div>
        </div>

        <div className="h-px bg-white/10 mx-6" />

        {/* ── 02. Procedimento ── */}
        <div className="px-6 py-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-black" style={{ color: '#e63737' }}>02.</span>
            <span className="text-base font-black uppercase tracking-widest">PROCEDIMENTO</span>
          </div>
          <p className="text-xs text-white/50 mb-6">
            Informações sobre o tatuador e o procedimento a ser realizado.
          </p>

          <div className="flex flex-col gap-5">
            <Field label="TATUADOR *">
              <div className="flex flex-col gap-3 mt-2">
                {TATUADORES.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => toggleTatuador(t)}
                    className="flex items-center gap-4 text-left"
                  >
                    <span
                      className="w-5 h-5 flex-shrink-0 border flex items-center justify-center transition-colors"
                      style={{
                        borderColor: tatuadores[t] ? '#e63737' : 'rgba(255,255,255,0.3)',
                        backgroundColor: tatuadores[t] ? '#e63737' : 'transparent',
                      }}
                    >
                      {tatuadores[t] && (
                        <svg viewBox="0 0 10 10" className="w-3 h-3" fill="none" stroke="white" strokeWidth="1.5">
                          <path d="M2 5l2.5 2.5L8 3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="text-sm font-semibold tracking-wide text-white/80">{t}</span>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="LOCAL DO CORPO">
              <input
                type="text"
                name="localCorpo"
                value={form.localCorpo}
                onChange={handleChange}
                placeholder="Ex: antebraço direito"
                className="input-field"
              />
            </Field>

            <Field label="VALOR ACORDADO *">
              <input
                type="text"
                name="valorAcordado"
                value={form.valorAcordado}
                onChange={handleChange}
                placeholder="R$ 0,00"
                required
                className="input-field"
              />
            </Field>
          </div>
        </div>

        <div className="h-px bg-white/10 mx-6" />

        {/* ── 03. Histórico Clínico ── */}
        <div className="px-6 py-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-black" style={{ color: '#e63737' }}>03.</span>
            <span className="text-base font-black uppercase tracking-widest">HISTÓRICO CLÍNICO</span>
          </div>
          <p className="text-xs text-white/50 mb-6">
            Apresenta algum dos problemas relacionados abaixo? *
          </p>

          {/* Table header */}
          <div className="flex items-center mb-3">
            <div className="flex-1" />
            <div className="w-12 text-center text-[10px] font-bold tracking-widest text-white/40 uppercase">SIM</div>
            <div className="w-12 text-center text-[10px] font-bold tracking-widest text-white/40 uppercase">NÃO</div>
          </div>

          <div className="flex flex-col gap-0 mb-8">
            {CONDITIONS.map(({ label }) => (
              <div key={label} className="flex items-center border-b border-white/5 py-3">
                <span className="flex-1 text-sm text-white/80 pr-2">{label}</span>
                {/* SIM */}
                <button
                  type="button"
                  onClick={() => setCondition(label, 'sim')}
                  className="w-12 flex justify-center"
                >
                  <span
                    className="w-5 h-5 border flex items-center justify-center transition-colors"
                    style={{
                      borderColor: conditions[label] === 'sim' ? '#e63737' : 'rgba(255,255,255,0.3)',
                      backgroundColor: conditions[label] === 'sim' ? '#e63737' : 'transparent',
                    }}
                  >
                    {conditions[label] === 'sim' && (
                      <svg viewBox="0 0 10 10" className="w-3 h-3" fill="none" stroke="white" strokeWidth="1.5">
                        <path d="M2 5l2.5 2.5L8 3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                </button>
                {/* NÃO */}
                <button
                  type="button"
                  onClick={() => setCondition(label, 'nao')}
                  className="w-12 flex justify-center"
                >
                  <span
                    className="w-5 h-5 border flex items-center justify-center transition-colors"
                    style={{
                      borderColor: conditions[label] === 'nao' ? '#e63737' : 'rgba(255,255,255,0.3)',
                      backgroundColor: conditions[label] === 'nao' ? '#e63737' : 'transparent',
                    }}
                  >
                    {conditions[label] === 'nao' && (
                      <svg viewBox="0 0 10 10" className="w-3 h-3" fill="none" stroke="white" strokeWidth="1.5">
                        <path d="M2 5l2.5 2.5L8 3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-5">
            <Field label="EM CASO DE ALERGIAS, MEDICAMENTOS OU DOENÇAS CRÔNICAS DIGA QUAIS">
              <textarea
                name="detalhesCondicoes"
                value={form.detalhesCondicoes}
                onChange={handleChange}
                placeholder="Descreva aqui..."
                rows={4}
                className="input-field resize-none"
              />
            </Field>

            <Field label="TELEFONE PARA EMERGÊNCIA">
              <input
                type="tel"
                name="telefoneEmergencia"
                value={form.telefoneEmergencia}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                className="input-field"
              />
            </Field>
          </div>
        </div>

        <div className="h-px bg-white/10 mx-6" />

        {/* ── Informamos que ── */}
        <div className="px-6 py-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-black" style={{ color: '#e63737' }}>!</span>
            <span className="text-base font-black uppercase tracking-widest">INFORMAMOS QUE:</span>
          </div>
          <ul className="flex flex-col gap-3">
            {[
              'Não tatuamos menores de 18 (dezoito) anos completos, nem mesmo mediante autorização dos responsáveis legais.',
              'É permitida a presença de apenas 1 (um) acompanhante durante o procedimento (consultar tatuador).',
              'Não é permitido o uso de entorpecentes no estúdio.',
            ].map((item) => (
              <li key={item} className="flex gap-3 text-xs text-white/60 leading-relaxed">
                <span className="mt-0.5 flex-shrink-0" style={{ color: '#e63737' }}>•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="h-px bg-white/10 mx-6" />

        {/* ── Termo de Responsabilidade ── */}
        <div className="px-6 py-10">
          <div className="flex justify-center mb-6">
            <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
              <path
                d="M10 38 C14 28 20 24 24 12 C28 24 34 28 38 38"
                stroke="#e63737"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 32 C18 28 22 26 24 20 C26 26 30 28 32 32"
                stroke="#e63737"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-black uppercase text-center leading-tight mb-8">
            TERMO DE<br />RESPONSABILIDADE
          </h2>

          <div className="flex flex-col gap-4 mb-8">
            {/* Checkbox 1 */}
            <TermCheckbox
              checked={form.concordo1}
              onToggle={() => setForm((p) => ({ ...p, concordo1: !p.concordo1 }))}
              text="Declaro serem verdadeiras as informações acima prestadas e de minha inteira responsabilidade se houver omissão dessas."
            />

            {/* Checkbox 2 */}
            <TermCheckbox
              checked={form.concordo2}
              onToggle={() => setForm((p) => ({ ...p, concordo2: !p.concordo2 }))}
              text="Responsabilizo-me pelos cuidados que deverei ter no período posterior ao procedimento, estando ciente de que o sucesso da operação depende diretamente destes. Declaro também estar ciente de que a tatuagem é definitiva e de que o desenho/escrita está de acordo com o combinado com o artista. Assim sendo, isento neste ato o profissional responsável e o El Dude Tattoo por eventuais problemas posteriores."
            />

            {/* Checkbox 3 */}
            <TermCheckbox
              checked={form.concordo3}
              onToggle={() => setForm((p) => ({ ...p, concordo3: !p.concordo3 }))}
              text="Autorizo também o uso de minha imagem para portfólio e redes sociais do artista/estúdio."
            />
          </div>

          <Field label="SÃO PAULO, DATA *">
            <input
              type="date"
              name="dataAssinatura"
              value={form.dataAssinatura}
              onChange={handleChange}
              required
              className="input-field"
            />
          </Field>

          {/* Submit */}
          <button
            type="submit"
            disabled={!allTermsAccepted}
            className="w-full mt-8 py-5 text-sm font-black tracking-[0.25em] uppercase transition-opacity disabled:opacity-40"
            style={{ backgroundColor: 'white', color: 'black' }}
          >
            FINALIZAR<br />REGISTRO
          </button>
        </div>
      </form>

      {/* ── Bottom Nav ── */}
      <nav className="sticky bottom-0 border-t border-white/10 bg-black flex">
        {[
          { label: 'HOME', href: '/', icon: HomeIcon },
          { label: 'CLIENTS', href: '/guests', icon: ClientsIcon },
          { label: 'FORMS', href: '/ficha-anamnese', icon: FormsIcon, active: true },
          { label: 'HISTORY', href: '/arquivadas', icon: HistoryIcon },
        ].map(({ label, href, icon: Icon, active }) => (
          <a
            key={label}
            href={href}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-1"
            style={{ color: active ? '#e63737' : 'rgba(255,255,255,0.4)' }}
          >
            <Icon />
            <span className="text-[9px] font-bold tracking-widest">{label}</span>
          </a>
        ))}
      </nav>

      <style>{`
        .input-field {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.15);
          color: white;
          font-size: 0.875rem;
          padding: 10px 0;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field::placeholder {
          color: rgba(255,255,255,0.3);
          font-size: 0.8rem;
        }
        .input-field:focus {
          border-bottom-color: #e63737;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.4);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold tracking-[0.25em] text-white/40 mb-1 uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

function TermCheckbox({ checked, onToggle, text }: { checked: boolean; onToggle: () => void; text: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-start gap-4 text-left w-full"
    >
      <span
        className="w-5 h-5 flex-shrink-0 border mt-0.5 flex items-center justify-center transition-colors"
        style={{
          borderColor: checked ? '#e63737' : 'rgba(255,255,255,0.3)',
          backgroundColor: checked ? '#e63737' : 'transparent',
        }}
      >
        {checked && (
          <svg viewBox="0 0 10 10" className="w-3 h-3" fill="none" stroke="white" strokeWidth="1.5">
            <path d="M2 5l2.5 2.5L8 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-xs text-white/70 leading-relaxed">{text}</span>
    </button>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 12l9-9 9 9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClientsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="7" r="3" />
      <path d="M3 20a6 6 0 0112 0" strokeLinecap="round" />
      <path d="M16 11a3 3 0 010 6M19 20a6 6 0 00-3-5.2" strokeLinecap="round" />
    </svg>
  );
}

function FormsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M9 7h6M9 11h6M9 15h4" strokeLinecap="round" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
