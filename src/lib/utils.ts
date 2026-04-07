/**
 * Formata um valor numérico ou string em formato de moeda Real (R$)
 */
export function formatPrice(price: string | number | undefined): string {
  if (price === undefined || price === null || price === '') return '';
  
  const s = String(price).trim();
  
  // Se for apenas o número limpo (ex: "300")
  // Ou se tiver separadores decimais (ex: "300.50" ou "300,50")
  let num: number;
  
  if (typeof price === 'number') {
    num = price;
  } else {
    // Tenta limpar e converter
    // Remove "R$", espaços, etc, mantendo apenas dígitos, vírgula e ponto
    const cleaned = s.replace(/[^\d.,-]/g, '');
    
    if (cleaned.includes(',') && cleaned.includes('.')) {
      // Formato complexo como 1.200,50 -> remove o ponto de milhar e troca vírgula por ponto
      num = parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
    } else if (cleaned.includes(',')) {
      // Formato simples 300,50 -> troca vírgula por ponto
      num = parseFloat(cleaned.replace(',', '.'));
    } else {
      // Formato 300 ou 300.50
      num = parseFloat(cleaned);
    }
  }

  if (isNaN(num)) return s;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}
