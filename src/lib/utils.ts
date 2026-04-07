/**
 * Formata um valor numérico ou string em formato de moeda Real (R$)
 */
export function formatPrice(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === '') return '';
  
  const s = String(value).trim();
  
  // Se for apenas o número limpo (ex: "300")
  // Ou se tiver separadores decimais (ex: "300.50" ou "300,50")
  let num: number;
  
  if (typeof value === 'number') {
    num = value;
  } else {
    // Tenta limpar e converter
    // Remove "R$", espaços, etc, mantendo apenas dígitos, vírgula e ponto
    const cleaned = s
      .replace(/^R\$\s*/, '')  // Remove prefixo R$
      .replace(/\./g, '')      // Remove separador de milhar
      .replace(',', '.');      // Troca vírgula decimal por ponto
    
    num = parseFloat(cleaned);
  }

  if (isNaN(num)) {
    // Não é numérico ("A combinar", etc.) — retorna original
    return s;
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}
