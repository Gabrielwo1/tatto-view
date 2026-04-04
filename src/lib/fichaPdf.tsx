import { pdf } from '@react-pdf/renderer';
import type { FichaSubmission } from '../store';
import { FichaPdfDoc } from '../components/pdf/FichaPdfDoc';

export async function downloadFichaPdf(sub: FichaSubmission) {
  const blob = await pdf(<FichaPdfDoc sub={sub} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ficha-${sub.nome.replace(/\s+/g, '-').toLowerCase()}-${sub.id.slice(0, 6)}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
