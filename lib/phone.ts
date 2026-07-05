// Utilidades de teléfono chileno: formateo visual +56 9 XXXX XXXX

function soloDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

// Acepta que el usuario escriba con o sin +56, y va formateando progresivamente
export function formatearTelefono(valor: string): string {
  let digitos = soloDigitos(valor);

  // Quita el prefijo de país si el usuario lo escribió
  if (digitos.startsWith("56")) {
    digitos = digitos.slice(2);
  }
  digitos = digitos.slice(0, 9); // 9 + 8 dígitos

  if (digitos.length === 0) return "";

  let resultado = "+56";
  resultado += ` ${digitos.slice(0, 1)}`;
  if (digitos.length > 1) resultado += ` ${digitos.slice(1, 5)}`;
  if (digitos.length > 5) resultado += ` ${digitos.slice(5, 9)}`;

  return resultado.trim();
}

export function esTelefonoValido(valor: string): boolean {
  const digitos = soloDigitos(valor).replace(/^56/, "");
  return /^9\d{8}$/.test(digitos);
}

export function normalizarTelefono(valor: string): string {
  return formatearTelefono(valor);
}
