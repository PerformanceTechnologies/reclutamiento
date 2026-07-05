// Rate limiting best-effort en memoria (por instancia serverless).
// Es una primera línea de defensa contra formularios que se reenvían en bucle.
// Para protección real contra ataques de volumen (DDoS) se recomienda activar
// Vercel Attack Challenge Mode o poner el dominio detrás de Cloudflare (gratis).

const VENTANA_MS = 10 * 60 * 1000; // 10 minutos
const MAX_INTENTOS_POR_VENTANA = 5;
const MAX_ENTRADAS_EN_MEMORIA = 5000;

const intentosPorIp = new Map<string, number[]>();

export function excedeLimite(ip: string): boolean {
  const ahora = Date.now();

  if (intentosPorIp.size > MAX_ENTRADAS_EN_MEMORIA) {
    for (const [clave, marcas] of intentosPorIp) {
      const vigentes = marcas.filter((t) => ahora - t < VENTANA_MS);
      if (vigentes.length === 0) intentosPorIp.delete(clave);
      else intentosPorIp.set(clave, vigentes);
    }
  }

  const marcas = (intentosPorIp.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);
  marcas.push(ahora);
  intentosPorIp.set(ip, marcas);

  return marcas.length > MAX_INTENTOS_POR_VENTANA;
}

export function obtenerIpCliente(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "desconocida";
}
