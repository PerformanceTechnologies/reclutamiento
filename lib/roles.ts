// Control de acceso al dashboard: solo estas cuentas pueden entrar.
// Para agregar a alguien más del equipo, solo agrega una línea aquí.
export type Rol = "admin" | "reclutador";

export const USUARIOS_AUTORIZADOS: Record<string, Rol> = {
  "hugo.antivil@pertec.cl": "admin",
};

export function obtenerRol(correo: string | null | undefined): Rol | null {
  if (!correo) return null;
  return USUARIOS_AUTORIZADOS[correo.toLowerCase()] ?? null;
}

export function estaAutorizado(correo: string | null | undefined): boolean {
  return obtenerRol(correo) !== null;
}
