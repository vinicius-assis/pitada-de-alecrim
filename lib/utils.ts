/**
 * Formata um valor numérico para o formato monetário brasileiro (R$ 0,00)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Aplica máscara de valor monetário brasileiro em um input
 * Converte "123456" para "1.234,56"
 */
export function formatCurrencyInput(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, "");

  if (!numbers) return "";

  // Converte para número e divide por 100 para ter centavos
  const number = parseFloat(numbers) / 100;

  // Formata como moeda brasileira (sem símbolo R$)
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}

/**
 * Remove a formatação e retorna apenas o número
 * "1.234,56" -> 1234.56
 */
export function parseCurrencyInput(value: string): number {
  // Remove tudo exceto números, vírgula e ponto
  const cleaned = value.replace(/[^\d,.-]/g, "");
  
  // Remove pontos (separadores de milhar) e substitui vírgula por ponto
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  
  const parsed = parseFloat(normalized);
  
  return isNaN(parsed) ? 0 : parsed;
}

