import { useState, useMemo, useRef } from 'react';
import { useStore } from '../../store';
import type { Expense, ExpenseCategory } from '../../types';
import { EXPENSE_CATEGORIES } from '../../types';
import type { FichaSubmission } from '../../store';
import { uploadImage } from '../../lib/uploadImage';

// ── Helpers ──────────────────────────────────────────────────────────────────
function centsToBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function parseAmountInput(raw: string): number {
  const normalized = raw.replace(',', '.');
  return Math.round(parseFloat(normalized) * 100) || 0;
}

function parseFichaValue(raw: string): number {
  // "R$ 500,00" or "500,00" or "500.00" → cents
  const cleaned = raw.replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.').trim();
  return Math.round(parseFloat(cleaned) * 100) || 0;
}

function formatDateGroup(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// Compute income per artist from ficha submissions
function computeIncome(
  fichas: FichaSubmission[],
  artists: { id: string; name: string }[],
): Record<string, number> {
  const income: Record<string, number> = {};
  for (const a of artists) income[a.id] = 0;

  for (const ficha of fichas) {
    const total = parseFichaValue(ficha.valorAcordado);
    if (!total) continue;
    const matched = ficha.tatuadoresSelecionados
      .map((name) => artists.find((a) => a.name === name))
      .filter(Boolean) as { id: string; name: string }[];
    if (matched.length === 0) continue;
    const share = Math.round(total / matched.length);
    for (const artist of matched) {
      income[artist.id] = (income[artist.id] ?? 0) + share;
    }
  }
  return income;
}

// Compute net expense balances and simplified debts
function computeBalances(expenses: Expense[], artistIds: string[]) {
  const net: Record<string, number> = {};
  for (const id of artistIds) net[id] = 0;

  for (const exp of expenses) {
    const share = exp.participants.length > 0 ? exp.amount / exp.participants.length : 0;
    for (const pid of exp.participants) {
      if (!(pid in net)) net[pid] = 0;
      net[pid] -= share;
    }
    if (!(exp.paidBy in net)) net[exp.paidBy] = 0;
    net[exp.paidBy] += exp.amount;
  }

  const debts: { from: string; to: string; amount: number }[] = [];
  const debtors   = Object.entries(net).filter(([, v]) => v < -0.5).map(([k, v]) => ({ id: k, bal: v }));
  const creditors = Object.entries(net).filter(([, v]) => v > 0.5).map(([k, v]) => ({ id: k, bal: v }));

  let di = 0; let ci = 0;
  while (di < debtors.length && ci < creditors.length) {
    const d = debtors[di]; const c = creditors[ci];
    const amt = Math.min(-d.bal, c.bal);
    if (amt > 0.5) debts.push({ from: d.id, to: c.id, amount: Math.round(amt) });
    d.bal += amt; c.bal -= amt;
    if (Math.abs(d.bal) < 0.5) di++;
    if (Math.abs(c.bal) < 0.5) ci++;
  }

  return { net, debts };
}

// ── Expense Form ─────────────────────────────────────────────────────────────
const inputCls = 'w-full bg-transparent border border-white/15 px-3 py-2 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors';
const labelCls = 'block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5';

interface FormState {
  description: string;
  amountRaw: string;
  paidBy: string;
  date: string;
  category: ExpenseCategory;
  participants: string[];
  receiptUrl: string;
}

function defaultForm(artistIds: string[], currentArtistId?: string | null): FormState {
  return {
    description: '',
    amountRaw: '',
    paidBy: currentArtistId ?? artistIds[0] ?? '',
    date: todayISO(),
    category: 'Studio',
    participants: [...artistIds],
    receiptUrl: '',
  };
}

function ExpenseModal({
  initial,
  artists,
  onSave,
  onDelete,
  onClose,
}: {
  initial?: Expense;
  artists: { id: string; name: string }[];
  onSave: (data: Omit<Expense, 'id' | 'createdAt'>) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const artistIds = artists.map((a) => a.id);
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          description: initial.description,
          amountRaw: (initial.amount / 100).toFixed(2).replace('.', ','),
          paidBy: initial.paidBy,
          date: initial.date,
          category: initial.category,
          participants: initial.participants,
          receiptUrl: initial.receiptUrl ?? '',
        }
      : defaultForm(artistIds)
  );
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function toggleParticipant(id: string) {
    setForm((f) => ({
      ...f,
      participants: f.participants.includes(id)
        ? f.participants.filter((p) => p !== id)
        : [...f.participants, id],
    }));
  }

  async function handleReceiptUpload(file: File) {
    setUploading(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((res) => {
        reader.onload = (e) => res(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      const url = await uploadImage(dataUrl);
      setForm((f) => ({ ...f, receiptUrl: url }));
    } catch (err) {
      console.error('[ExpenseModal] receipt upload failed:', err);
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseAmountInput(form.amountRaw);
    if (!amount || !form.description || !form.paidBy || form.participants.length === 0) return;
    onSave({
      description: form.description,
      amount,
      paidBy: form.paidBy,
      date: form.date,
      category: form.category,
      participants: form.participants,
      ...(form.receiptUrl ? { receiptUrl: form.receiptUrl } : {}),
    });
    onClose();
  }

  const perPerson = form.participants.length > 0
    ? centsToBRL(Math.round(parseAmountInput(form.amountRaw) / form.participants.length))
    : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-950 border border-white/15 w-full max-w-md p-6 flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500">
            {initial ? 'Editar Despesa' : 'Nova Despesa'}
          </p>
          <button type="button" onClick={onClose} className="text-gray-600 hover:text-white transition-colors p-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div>
          <label className={labelCls}>Descrição</label>
          <input className={inputCls} value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Ex: Gastos do studio" required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Valor (R$)</label>
            <input className={inputCls} value={form.amountRaw}
              onChange={(e) => setForm((f) => ({ ...f, amountRaw: e.target.value }))}
              placeholder="0,00" inputMode="decimal" required />
          </div>
          <div>
            <label className={labelCls}>Data</label>
            <input type="date" className={inputCls} value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Pago por</label>
            <select className={inputCls} value={form.paidBy}
              onChange={(e) => setForm((f) => ({ ...f, paidBy: e.target.value }))}>
              {artists.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Categoria</label>
            <select className={inputCls} value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))}>
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelCls.replace('mb-1.5', '')}>Dividir entre</label>
            <button type="button" onClick={() => setForm((f) => ({
              ...f, participants: f.participants.length === artists.length ? [] : artistIds,
            }))}
              className="font-body text-[9px] tracking-widest uppercase text-gray-600 hover:text-white transition-colors">
              {form.participants.length === artists.length ? 'Desmarcar todos' : 'Selecionar todos'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {artists.map((a) => (
              <button key={a.id} type="button"
                onClick={() => toggleParticipant(a.id)}
                className={`flex items-center gap-2 px-3 py-2 border text-left transition-colors font-body text-xs ${
                  form.participants.includes(a.id)
                    ? 'border-ink-500 bg-ink-500/10 text-white'
                    : 'border-white/10 text-gray-600 hover:border-white/30'
                }`}>
                <span className={`w-3.5 h-3.5 border flex-shrink-0 flex items-center justify-center ${
                  form.participants.includes(a.id) ? 'border-ink-500 bg-ink-500' : 'border-gray-600'
                }`}>
                  {form.participants.includes(a.id) && (
                    <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                <span className="truncate">{a.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
          {form.participants.length > 0 && parseAmountInput(form.amountRaw) > 0 && (
            <p className="mt-2 font-body text-[10px] text-gray-600 tracking-wide">
              {perPerson} por pessoa ({form.participants.length} participantes)
            </p>
          )}
        </div>

        {/* Receipt upload */}
        <div>
          <label className={labelCls}>Comprovante (opcional)</label>
          <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleReceiptUpload(f); e.target.value = ''; }} />
          {form.receiptUrl ? (
            <div className="flex items-center gap-3">
              <a href={form.receiptUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 truncate font-body text-xs text-ink-400 hover:underline">
                Ver comprovante ↗
              </a>
              <img src={form.receiptUrl} alt="comprovante" className="w-14 h-14 object-cover border border-white/10 flex-shrink-0" />
              <button type="button" onClick={() => setForm((f) => ({ ...f, receiptUrl: '' }))}
                className="text-gray-600 hover:text-red-400 text-xs transition-colors">✕</button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="w-full border border-white/15 border-dashed py-3 font-body text-xs text-gray-600 hover:text-white hover:border-white/40 transition-colors disabled:opacity-40">
              {uploading ? 'Enviando...' : '↑ Anexar foto / PDF'}
            </button>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <button type="submit"
            className="flex-1 py-2.5 bg-white text-black font-body font-bold text-xs tracking-widest uppercase hover:bg-gray-200 transition-colors">
            Salvar
          </button>
          {onDelete && (
            <button type="button" onClick={() => { onDelete(); onClose(); }}
              className="px-4 py-2.5 border border-red-500/40 text-red-400 hover:bg-red-500/10 font-body text-xs tracking-widest uppercase transition-colors">
              Excluir
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// ── Tab: Despesas ─────────────────────────────────────────────────────────────
function TabDespesas({ artists }: { artists: { id: string; name: string }[] }) {
  const expenses      = useStore((s) => s.expenses);
  const addExpense    = useStore((s) => s.addExpense);
  const updateExpense = useStore((s) => s.updateExpense);
  const deleteExpense = useStore((s) => s.deleteExpense);
  const currentArtistId = useStore((s) => s.currentArtistId);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const artistMap = useMemo(() => new Map(artists.map((a) => [a.id, a.name])), [artists]);

  const myExpenses  = expenses.reduce((sum, e) => sum + (e.paidBy === currentArtistId ? e.amount : 0), 0);
  const allExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const grouped = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const e of expenses) {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    }
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [expenses]);

  const catIcon: Record<string, string> = {
    Studio: '🏢', Material: '🎨', Alimentação: '🍔', Marketing: '📣',
    Equipamento: '🔧', Aluguel: '🏠', Salário: '💰', Outros: '📦',
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {currentArtistId && (
          <div className="bg-zinc-900 border border-white/10 p-4">
            <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-1">
              Minhas Despesas
            </p>
            <p className="font-display text-2xl text-white">{centsToBRL(myExpenses)}</p>
          </div>
        )}
        <div className={`bg-zinc-900 border border-white/10 p-4 flex items-center justify-between ${!currentArtistId ? 'col-span-2' : ''}`}>
          <div>
            <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-1">
              Total Despesas
            </p>
            <p className="font-display text-2xl text-white">{centsToBRL(allExpenses)}</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="w-10 h-10 bg-ink-500 hover:bg-ink-400 text-black flex items-center justify-center transition-colors flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="font-display text-3xl tracking-widest uppercase">Nenhuma despesa</p>
          <p className="font-body text-sm mt-2">Clique em + para adicionar</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, items]) => (
            <div key={date}>
              <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">
                {formatDateGroup(date)}
              </p>
              <div className="space-y-1.5">
                {items.map((exp) => (
                  <button key={exp.id} onClick={() => setEditing(exp)}
                    className="w-full flex items-center gap-3 bg-zinc-900 border border-white/[0.07] hover:border-white/20 px-4 py-3 transition-colors text-left group">
                    <span className="text-lg w-7 text-center flex-shrink-0">{catIcon[exp.category] ?? '📦'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-white truncate">{exp.description}</p>
                      <p className="font-body text-[10px] text-gray-600 mt-0.5">
                        Pago por <span className="font-semibold">{artistMap.get(exp.paidBy) ?? '—'}</span>
                        {exp.participants.length > 1 && ` · dividido entre ${exp.participants.length}`}
                      </p>
                    </div>
                    {exp.receiptUrl && (
                      <img src={exp.receiptUrl} alt="comprovante"
                        className="w-9 h-9 object-cover border border-white/10 flex-shrink-0" />
                    )}
                    <div className="text-right flex-shrink-0">
                      <p className="font-body text-sm font-semibold text-white">{centsToBRL(exp.amount)}</p>
                      <p className="font-body text-[9px] text-gray-700 group-hover:text-gray-500 mt-0.5 transition-colors">Editar</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ExpenseModal
          artists={artists}
          onSave={(data) => addExpense(data)}
          onClose={() => setShowModal(false)}
        />
      )}
      {editing && (
        <ExpenseModal
          initial={editing}
          artists={artists}
          onSave={(data) => updateExpense(editing.id, data)}
          onDelete={() => deleteExpense(editing.id)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

// ── Tab: Receitas ─────────────────────────────────────────────────────────────
function TabReceitas({ artists }: { artists: { id: string; name: string }[] }) {
  const fichas = useStore((s) => s.fichaSubmissions);

  const income = useMemo(() => computeIncome(fichas, artists), [fichas, artists]);

  const totalIncome = Object.values(income).reduce((s, v) => s + v, 0);

  // Fichas sorted by date desc, only those with a parsed value
  const fichasWithValue = useMemo(() =>
    [...fichas]
      .filter((f) => parseFichaValue(f.valorAcordado) > 0)
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    [fichas]
  );

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-white/10 p-4">
          <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-1">
            Total Receitas
          </p>
          <p className="font-display text-2xl text-green-400">{centsToBRL(totalIncome)}</p>
        </div>
        <div className="bg-zinc-900 border border-white/10 p-4">
          <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-1">
            Fichas com Valor
          </p>
          <p className="font-display text-2xl text-white">{fichasWithValue.length}</p>
        </div>
      </div>

      {/* Per-artist income */}
      {artists.length > 0 && (
        <div>
          <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-3">
            Receita por artista
          </p>
          <div className="space-y-2">
            {artists
              .map((a) => ({ ...a, total: income[a.id] ?? 0 }))
              .sort((a, b) => b.total - a.total)
              .map((a) => {
                const pct = totalIncome > 0 ? (a.total / totalIncome) * 100 : 0;
                return (
                  <div key={a.id} className="bg-zinc-900 border border-white/[0.07] px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-body text-sm text-white">{a.name}</span>
                      <span className="font-body text-sm font-semibold text-green-400">{centsToBRL(a.total)}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 overflow-hidden">
                      <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Ficha list */}
      {fichasWithValue.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <p className="font-display text-2xl tracking-widest uppercase">Sem receitas</p>
          <p className="font-body text-sm mt-2">As fichas com valor acordado aparecerão aqui</p>
        </div>
      ) : (
        <div>
          <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-3">
            Histórico de fichas
          </p>
          <div className="space-y-1.5">
            {fichasWithValue.map((f) => {
              const val = parseFichaValue(f.valorAcordado);
              const date = f.submittedAt.slice(0, 10);
              return (
                <div key={f.id} className="flex items-center gap-3 bg-zinc-900 border border-white/[0.07] px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-white truncate">{f.nome}</p>
                    <p className="font-body text-[10px] text-gray-600 mt-0.5">
                      {f.tatuadoresSelecionados.join(', ') || '—'}
                      {' · '}
                      {formatDateGroup(date)}
                    </p>
                  </div>
                  <p className="font-body text-sm font-semibold text-green-400 flex-shrink-0">{centsToBRL(val)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Saldos ───────────────────────────────────────────────────────────────
function TabSaldos({ artists }: { artists: { id: string; name: string }[] }) {
  const expenses = useStore((s) => s.expenses);
  const fichas   = useStore((s) => s.fichaSubmissions);
  const artistMap = useMemo(() => new Map(artists.map((a) => [a.id, a.name])), [artists]);
  const artistIds = artists.map((a) => a.id);

  const { net, debts } = useMemo(() => computeBalances(expenses, artistIds), [expenses, artistIds]);
  const income = useMemo(() => computeIncome(fichas, artists), [fichas, artists]);

  return (
    <div className="space-y-8">
      {/* Net position per artist (income - expense_share) */}
      <div>
        <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-3">
          Posição líquida por artista
        </p>
        <p className="font-body text-[10px] text-gray-700 mb-3">Receitas de fichas menos despesas partilhadas</p>
        <div className="space-y-2">
          {artists.map((a) => {
            const expenseNet = Math.round(net[a.id] ?? 0);
            const artistIncome = income[a.id] ?? 0;
            const netPos = artistIncome + expenseNet;
            return (
              <div key={a.id} className="bg-zinc-900 border border-white/[0.07] px-4 py-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-xs text-white">{a.name[0]}</span>
                  </div>
                  <span className="font-body text-sm text-white flex-1">{a.name}</span>
                  <div className="text-right">
                    <p className={`font-body text-sm font-semibold ${netPos >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {netPos >= 0 ? '+' : ''}{centsToBRL(netPos)}
                    </p>
                    <p className="font-body text-[9px] text-gray-600 mt-0.5">posição líquida</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                  <div>
                    <p className="font-body text-[9px] text-gray-600 uppercase tracking-widest">Receitas</p>
                    <p className="font-body text-xs text-green-400 font-semibold">{centsToBRL(artistIncome)}</p>
                  </div>
                  <div>
                    <p className="font-body text-[9px] text-gray-600 uppercase tracking-widest">Saldo despesas</p>
                    <p className={`font-body text-xs font-semibold ${expenseNet >= 0 ? 'text-white' : 'text-red-400'}`}>
                      {expenseNet >= 0 ? '+' : ''}{centsToBRL(expenseNet)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simplified debts */}
      {debts.length > 0 && (
        <div>
          <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-3">Quem deve a quem (despesas)</p>
          <div className="space-y-2">
            {debts.map((d, i) => (
              <div key={i} className="flex items-center gap-3 bg-zinc-900 border border-white/[0.07] px-4 py-3">
                <span className="font-body text-sm text-white">{artistMap.get(d.from) ?? d.from}</span>
                <span className="text-gray-600 font-body text-xs">→</span>
                <span className="font-body text-sm text-white">{artistMap.get(d.to) ?? d.to}</span>
                <span className="ml-auto font-body text-sm font-semibold text-ink-400">{centsToBRL(d.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {debts.length === 0 && expenses.length > 0 && (
        <div className="text-center py-10 text-gray-600">
          <p className="font-body text-sm">Todos os saldos de despesas estão quites ✓</p>
        </div>
      )}
    </div>
  );
}

// ── Tab: Categorias ───────────────────────────────────────────────────────────
function TabCategorias() {
  const expenses = useStore((s) => s.expenses);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of expenses) {
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    }
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([cat, total]) => ({ cat, total }));
  }, [expenses]);

  const grandTotal = byCategory.reduce((s, r) => s + r.total, 0);

  const catColors: Record<string, string> = {
    Studio: 'bg-ink-500', Material: 'bg-blue-500', Alimentação: 'bg-orange-400',
    Marketing: 'bg-purple-500', Equipamento: 'bg-cyan-500', Aluguel: 'bg-yellow-500',
    Salário: 'bg-green-500', Outros: 'bg-gray-500',
  };

  if (byCategory.length === 0) {
    return (
      <div className="text-center py-20 text-gray-600">
        <p className="font-display text-3xl tracking-widest uppercase">Sem dados</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-4">
        Despesas por categoria
      </p>
      {byCategory.map(({ cat, total }) => {
        const pct = grandTotal > 0 ? (total / grandTotal) * 100 : 0;
        return (
          <div key={cat}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-body text-sm text-white">{cat}</span>
              <div className="text-right">
                <span className="font-body text-sm font-semibold text-white">{centsToBRL(total)}</span>
                <span className="font-body text-[10px] text-gray-600 ml-2">{pct.toFixed(1)}%</span>
              </div>
            </div>
            <div className="h-2 bg-zinc-800 w-full overflow-hidden">
              <div
                className={`h-full ${catColors[cat] ?? 'bg-gray-500'} transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Tab: Gráficos ─────────────────────────────────────────────────────────────
function TabGraficos({ artists }: { artists: { id: string; name: string }[] }) {
  const expenses = useStore((s) => s.expenses);
  const fichas   = useStore((s) => s.fichaSubmissions);

  const income = useMemo(() => computeIncome(fichas, artists), [fichas, artists]);

  // Last 12 months: expenses + income
  const monthly = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      const totalExp = expenses
        .filter((e) => e.date.startsWith(key))
        .reduce((s, e) => s + e.amount, 0);
      const totalInc = fichas
        .filter((f) => f.submittedAt.startsWith(key))
        .reduce((s, f) => s + parseFichaValue(f.valorAcordado), 0);
      return { label, key, totalExp, totalInc };
    });
  }, [expenses, fichas]);

  // Per-artist totals
  const byArtist = useMemo(() => {
    const expMap = new Map<string, number>();
    for (const e of expenses) {
      expMap.set(e.paidBy, (expMap.get(e.paidBy) ?? 0) + e.amount);
    }
    return artists
      .map((a) => ({ name: a.name, expense: expMap.get(a.id) ?? 0, income: income[a.id] ?? 0 }))
      .sort((a, b) => (b.income + b.expense) - (a.income + a.expense));
  }, [expenses, income, artists]);

  const maxMonthly = Math.max(...monthly.map((m) => Math.max(m.totalExp, m.totalInc)), 1);

  return (
    <div className="space-y-10">
      {/* Monthly grouped bar chart */}
      <div>
        <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">
          Receitas vs Despesas (últimos 12 meses)
        </p>
        <div className="flex items-center gap-4 mb-4">
          <span className="flex items-center gap-1.5 font-body text-[10px] text-gray-500">
            <span className="w-3 h-3 bg-green-500 inline-block" /> Receitas
          </span>
          <span className="flex items-center gap-1.5 font-body text-[10px] text-gray-500">
            <span className="w-3 h-3 bg-ink-500/80 inline-block" /> Despesas
          </span>
        </div>
        <div className="flex items-end gap-1 h-40">
          {monthly.map((m) => (
            <div key={m.key} className="flex-1 flex flex-col items-center gap-0.5 group relative">
              {(m.totalInc > 0 || m.totalExp > 0) && (
                <div className="absolute bottom-7 left-1/2 -translate-x-1/2 bg-zinc-800 border border-white/10 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 text-left">
                  <p className="font-body text-[10px] text-green-400">+{centsToBRL(m.totalInc)}</p>
                  <p className="font-body text-[10px] text-ink-400">-{centsToBRL(m.totalExp)}</p>
                </div>
              )}
              <div className="w-full flex gap-0.5 items-end" style={{ height: '128px' }}>
                {/* Income bar */}
                <div className="flex-1 bg-green-500/80 hover:bg-green-500 transition-colors"
                  style={{ height: `${(m.totalInc / maxMonthly) * 100}%`, minHeight: m.totalInc > 0 ? '3px' : '0' }} />
                {/* Expense bar */}
                <div className="flex-1 bg-ink-500/80 hover:bg-ink-500 transition-colors"
                  style={{ height: `${(m.totalExp / maxMonthly) * 100}%`, minHeight: m.totalExp > 0 ? '3px' : '0' }} />
              </div>
              <span className="font-body text-[9px] text-gray-600 tracking-wide mt-1">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-artist income vs expenses */}
      {byArtist.some((a) => a.income > 0 || a.expense > 0) && (
        <div>
          <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-4">
            Por artista
          </p>
          <div className="space-y-4">
            {byArtist.map((a) => {
              const maxVal = Math.max(...byArtist.map((x) => Math.max(x.income, x.expense)), 1);
              return (
                <div key={a.name}>
                  <p className="font-body text-xs text-white mb-1.5">{a.name}</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-body text-[9px] text-gray-600 w-16 shrink-0">Receitas</span>
                      <div className="flex-1 h-2 bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(a.income / maxVal) * 100}%` }} />
                      </div>
                      <span className="font-body text-xs text-green-400 w-24 text-right shrink-0">{centsToBRL(a.income)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-body text-[9px] text-gray-600 w-16 shrink-0">Despesas</span>
                      <div className="flex-1 h-2 bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-ink-500/80 transition-all duration-500" style={{ width: `${(a.expense / maxVal) * 100}%` }} />
                      </div>
                      <span className="font-body text-xs text-gray-400 w-24 text-right shrink-0">{centsToBRL(a.expense)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
type Tab = 'despesas' | 'receitas' | 'saldos' | 'categorias' | 'graficos';

export default function AdminFinanceiro() {
  const artists = useStore((s) => s.artists);
  const [tab, setTab] = useState<Tab>('receitas');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'receitas',   label: 'Receitas' },
    { id: 'despesas',   label: 'Despesas' },
    { id: 'saldos',     label: 'Saldos' },
    { id: 'categorias', label: 'Categorias' },
    { id: 'graficos',   label: 'Gráficos' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-1">El Dude</p>
        <h1 className="font-display text-4xl text-white uppercase tracking-wide">Financeiro</h1>
      </div>

      {/* Tab bar */}
      <div className="grid grid-cols-5 mb-8 border border-white/10 overflow-hidden">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`py-2.5 font-body text-[10px] font-semibold tracking-widest uppercase transition-colors ${
              tab === t.id
                ? 'bg-white text-black'
                : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'receitas'   && <TabReceitas   artists={artists} />}
      {tab === 'despesas'   && <TabDespesas   artists={artists} />}
      {tab === 'saldos'     && <TabSaldos     artists={artists} />}
      {tab === 'categorias' && <TabCategorias />}
      {tab === 'graficos'   && <TabGraficos   artists={artists} />}
    </div>
  );
}
