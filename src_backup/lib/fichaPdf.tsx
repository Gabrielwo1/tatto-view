import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import type { FichaSubmission } from '../store';

// ── Styles ────────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#1a1a1a',
  },

  // Header
  header: { marginBottom: 20, borderBottomWidth: 2, borderBottomColor: '#111', paddingBottom: 12 },
  studioName: { fontSize: 22, fontFamily: 'Helvetica-Bold', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 2 },
  studioSub: { fontSize: 8, color: '#888', letterSpacing: 2, textTransform: 'uppercase' },
  docTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', letterSpacing: 2, textTransform: 'uppercase', marginTop: 8, color: '#444' },
  docMeta: { fontSize: 7.5, color: '#999', marginTop: 2 },

  // Section
  section: { marginBottom: 16 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 8, paddingBottom: 4, borderBottomWidth: 0.5, borderBottomColor: '#ddd',
  },
  sectionNum: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#cc2222' },
  sectionTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', letterSpacing: 2, textTransform: 'uppercase', color: '#555' },

  // Grid fields
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fieldHalf: { width: '47%' },
  fieldFull: { width: '100%' },
  fieldLabel: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', letterSpacing: 1.5, textTransform: 'uppercase', color: '#999', marginBottom: 2 },
  fieldValue: { fontSize: 9, color: '#111', borderBottomWidth: 0.5, borderBottomColor: '#ddd', paddingBottom: 3 },

  // Conditions table
  condGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0 },
  condRow: { width: '50%', flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: '#eee', paddingVertical: 4, paddingRight: 4 },
  condLabel: { flex: 1, fontSize: 8, color: '#333' },
  condBadgeSim: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: '#cc2222', letterSpacing: 1, textTransform: 'uppercase', width: 24, textAlign: 'center' },
  condBadgeNao: { fontSize: 6.5, color: '#aaa', letterSpacing: 1, textTransform: 'uppercase', width: 24, textAlign: 'center' },
  condBadgeEmpty: { fontSize: 6.5, color: '#ddd', width: 24, textAlign: 'center' },

  // Terms
  termBox: { backgroundColor: '#f8f8f8', padding: 10, marginBottom: 8 },
  termText: { fontSize: 7.5, color: '#555', lineHeight: 1.5 },

  // Signature
  sigRow: { flexDirection: 'row', gap: 20, marginTop: 8 },
  sigField: { flex: 1 },
  sigLine: { borderBottomWidth: 0.75, borderBottomColor: '#333', marginBottom: 3, height: 20 },
  sigLabel: { fontSize: 6.5, color: '#999', letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center' },

  // Footer
  footer: { position: 'absolute', bottom: 24, left: 40, right: 40, borderTopWidth: 0.5, borderTopColor: '#eee', paddingTop: 6, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 6.5, color: '#bbb', letterSpacing: 1 },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(v: string | undefined | null) {
  return v?.trim() || '—';
}

function fmtDate(iso: string | undefined | null) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── PDF Document ──────────────────────────────────────────────────────────────

function FichaPdfDoc({ sub }: { sub: FichaSubmission }) {
  const tatuadoresStr = [
    ...sub.tatuadoresSelecionados.filter((t) => t !== 'Outro'),
    sub.outroTatuador ? `Outro: ${sub.outroTatuador}` : '',
  ].filter(Boolean).join(', ');

  const condEntries = Object.entries(sub.conditions);

  return (
    <Document title={`Ficha de Anamnese — ${sub.nome}`} author="El Dude Tattoo">
      <Page size="A4" style={S.page}>

        {/* ── Header ── */}
        <View style={S.header}>
          <Text style={S.studioName}>El Dude Tattoo</Text>
          <Text style={S.studioSub}>Francisco Beltrão — PR · elduderinotattoo@gmail.com</Text>
          <Text style={S.docTitle}>Ficha de Anamnese</Text>
          <Text style={S.docMeta}>Enviada em {fmtDateTime(sub.submittedAt)} · ID: {sub.id.slice(0, 8).toUpperCase()}</Text>
        </View>

        {/* ── 01 Identificação ── */}
        <View style={S.section}>
          <View style={S.sectionHeader}>
            <Text style={S.sectionNum}>01.</Text>
            <Text style={S.sectionTitle}>Identificação</Text>
          </View>
          <View style={S.grid}>
            <View style={S.fieldFull}>
              <Text style={S.fieldLabel}>Nome Completo</Text>
              <Text style={S.fieldValue}>{fmt(sub.nome)}</Text>
            </View>
            <View style={S.fieldHalf}>
              <Text style={S.fieldLabel}>E-mail</Text>
              <Text style={S.fieldValue}>{fmt(sub.email)}</Text>
            </View>
            <View style={S.fieldHalf}>
              <Text style={S.fieldLabel}>CPF</Text>
              <Text style={S.fieldValue}>{fmt(sub.cpf)}</Text>
            </View>
            <View style={S.fieldHalf}>
              <Text style={S.fieldLabel}>Data de Nascimento</Text>
              <Text style={S.fieldValue}>{fmtDate(sub.dataNascimento)}</Text>
            </View>
            <View style={S.fieldHalf}>
              <Text style={S.fieldLabel}>Telefone</Text>
              <Text style={S.fieldValue}>{fmt(sub.telefone)}</Text>
            </View>
            <View style={S.fieldHalf}>
              <Text style={S.fieldLabel}>Tel. para Emergência</Text>
              <Text style={S.fieldValue}>{fmt(sub.telefoneEmergencia)}</Text>
            </View>
            <View style={S.fieldHalf}>
              <Text style={S.fieldLabel}>Cidade</Text>
              <Text style={S.fieldValue}>{fmt(sub.cidade)}</Text>
            </View>
            <View style={S.fieldHalf}>
              <Text style={S.fieldLabel}>CEP</Text>
              <Text style={S.fieldValue}>{fmt(sub.cep)}</Text>
            </View>
            <View style={S.fieldFull}>
              <Text style={S.fieldLabel}>Endereço</Text>
              <Text style={S.fieldValue}>{fmt(sub.endereco)}</Text>
            </View>
          </View>
        </View>

        {/* ── 02 Procedimento ── */}
        <View style={S.section}>
          <View style={S.sectionHeader}>
            <Text style={S.sectionNum}>02.</Text>
            <Text style={S.sectionTitle}>Procedimento</Text>
          </View>
          <View style={S.grid}>
            <View style={S.fieldFull}>
              <Text style={S.fieldLabel}>Tatuador(es)</Text>
              <Text style={S.fieldValue}>{fmt(tatuadoresStr)}</Text>
            </View>
            <View style={S.fieldHalf}>
              <Text style={S.fieldLabel}>Local do Corpo</Text>
              <Text style={S.fieldValue}>{fmt(sub.localCorpo)}</Text>
            </View>
            <View style={S.fieldHalf}>
              <Text style={S.fieldLabel}>Valor Acordado</Text>
              <Text style={S.fieldValue}>{fmt(sub.valorAcordado)}</Text>
            </View>
            <View style={S.fieldHalf}>
              <Text style={S.fieldLabel}>Data da Sessão</Text>
              <Text style={S.fieldValue}>{fmtDate(sub.dataAssinatura)}</Text>
            </View>
          </View>
        </View>

        {/* ── 03 Histórico Clínico ── */}
        <View style={S.section}>
          <View style={S.sectionHeader}>
            <Text style={S.sectionNum}>03.</Text>
            <Text style={S.sectionTitle}>Histórico Clínico</Text>
          </View>
          {condEntries.length > 0 && (
            <View style={S.condGrid}>
              {condEntries.map(([label, answer]) => (
                <View key={label} style={S.condRow}>
                  <Text style={S.condLabel}>{label}</Text>
                  {answer === 'sim' ? (
                    <Text style={S.condBadgeSim}>SIM</Text>
                  ) : answer === 'nao' ? (
                    <Text style={S.condBadgeNao}>NÃO</Text>
                  ) : (
                    <Text style={S.condBadgeEmpty}>—</Text>
                  )}
                </View>
              ))}
            </View>
          )}
          {sub.detalhesCondicoes && (
            <View style={{ marginTop: 8 }}>
              <Text style={S.fieldLabel}>Alergias / Medicamentos / Doenças</Text>
              <Text style={{ ...S.fieldValue, paddingTop: 3, lineHeight: 1.5 }}>{sub.detalhesCondicoes}</Text>
            </View>
          )}
        </View>

        {/* ── Termo ── */}
        <View style={S.section}>
          <View style={S.sectionHeader}>
            <Text style={S.sectionNum}>✦</Text>
            <Text style={S.sectionTitle}>Termo de Responsabilidade</Text>
          </View>
          <View style={S.termBox}>
            <Text style={S.termText}>
              O cliente declara serem verdadeiras as informações acima prestadas e responsabiliza-se pelos cuidados pós-procedimento,
              estando ciente de que a tatuagem é definitiva. Autoriza também o uso de imagem para portfólio e redes sociais do artista/estúdio.
              Todos os termos foram aceitos digitalmente no ato do preenchimento desta ficha.
            </Text>
          </View>
          <View style={S.sigRow}>
            <View style={S.sigField}>
              <View style={S.sigLine} />
              <Text style={S.sigLabel}>Assinatura do Cliente</Text>
            </View>
            <View style={S.sigField}>
              <View style={S.sigLine} />
              <Text style={S.sigLabel}>Tatuador Responsável</Text>
            </View>
            <View style={S.sigField}>
              <View style={S.sigLine} />
              <Text style={S.sigLabel}>São Paulo, {fmtDate(sub.dataAssinatura)}</Text>
            </View>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>EL DUDE TATTOO · Ficha de Anamnese</Text>
          <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} / ${totalPages}`} />
          <Text style={S.footerText}>ID: {sub.id.slice(0, 8).toUpperCase()}</Text>
        </View>
      </Page>
    </Document>
  );
}

// ── Download helpers ──────────────────────────────────────────────────────────

export async function downloadFichaPdf(sub: FichaSubmission) {
  const blob = await pdf(<FichaPdfDoc sub={sub} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ficha-${sub.nome.replace(/\s+/g, '-').toLowerCase()}-${sub.id.slice(0, 6)}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
