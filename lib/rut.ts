// Utilidades de RUT chileno: formateo visual y validación por dígito verificador (módulo 11)

function limpiarRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, "").toUpperCase();
}

export function calcularDigitoVerificador(cuerpo: string): string {
  let suma = 0;
  let multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return "0";
  if (resto === 10) return "K";
  return String(resto);
}

// Formatea progresivamente mientras el usuario escribe: 12.345.678-9
export function formatearRut(valor: string): string {
  const limpio = limpiarRut(valor).slice(0, 9);
  if (limpio.length === 0) return "";

  const cuerpo = limpio.length > 1 ? limpio.slice(0, -1) : limpio;
  const dv = limpio.length > 1 ? limpio.slice(-1) : "";

  let cuerpoFormateado = "";
  for (let i = 0; i < cuerpo.length; i++) {
    const posicionDesdeElFinal = cuerpo.length - i;
    cuerpoFormateado += cuerpo[i];
    if (posicionDesdeElFinal > 1 && posicionDesdeElFinal % 3 === 1) {
      cuerpoFormateado += ".";
    }
  }

  return dv ? `${cuerpoFormateado}-${dv}` : cuerpoFormateado;
}

export function esRutValido(valor: string): boolean {
  const limpio = limpiarRut(valor);
  if (limpio.length < 2) return false;

  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);

  if (!/^\d+$/.test(cuerpo)) return false;
  if (parseInt(cuerpo, 10) < 1000000) return false; // RUT mínimo razonable

  return calcularDigitoVerificador(cuerpo) === dv;
}

// Normaliza a formato estándar para almacenamiento (para VLOOKUP/Power BI consistente)
export function normalizarRut(valor: string): string {
  const limpio = limpiarRut(valor);
  if (limpio.length < 2) return limpio;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  let cuerpoFormateado = "";
  for (let i = 0; i < cuerpo.length; i++) {
    const posicionDesdeElFinal = cuerpo.length - i;
    cuerpoFormateado += cuerpo[i];
    if (posicionDesdeElFinal > 1 && posicionDesdeElFinal % 3 === 1) {
      cuerpoFormateado += ".";
    }
  }
  return `${cuerpoFormateado}-${dv}`;
}
