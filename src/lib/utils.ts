/**
 * Formata um valor para o padrão monetário brasileiro (R$ 0,00).
 *
 * Aceita:
 *  - números: 300 → "R$ 300,00"
 *  - strings numéricas: "300" → "R$ 300,00"
 *  - strings já formatadas: "R$ 300,00" → "R$ 300,00" (retorna como está)
 *  - strings com prefixo parcial: "R$ 300" → "R$ 300,00"
 *  - strings não-numéricas: "A combinar" → "A combinar"
 *  - null / undefined / "" → ""
 */
export function formatPrice(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';

  // Se já é número, formata direto
  if (typeof value === 'number') {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // String: tenta extrair valor numérico
  const cleaned = value
    .replace(/^R\$\s*/, '')  // Remove prefixo R$
    .replace(/\./g, '')      // Remove separador de milhar
    .replace(',', '.');      // Troca vírgula decimal por ponto

  const num = parseFloat(cleaned);

  if (isNaN(num)) {
    // Não é numérico ("A combinar", etc.) — retorna original
    return value;
  }

  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
