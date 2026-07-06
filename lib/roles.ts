import { buscarRolAutorizado, credencialesGraphConfiguradas } from "./graph";

export type Rol = "admin" | "reclutador";

// Respaldo fijo: esta cuenta siempre es admin, incluso si la lista de
// SharePoint quedara vacía o mal configurada por error.
const ADMIN_DE_RESPALDO = "hugo.antivil@pertec.cl";

function esRolValido(valor: string | null): valor is Rol {
  return valor === "admin" || valor === "reclutador";
}

export async function obtenerRol(correo: string | null | undefined): Promise<Rol | null> {
  if (!correo) return null;
  const correoNormalizado = correo.toLowerCase();

  if (correoNormalizado === ADMIN_DE_RESPALDO) return "admin";
  if (!credencialesGraphConfiguradas()) return null;

  try {
    const rol = await buscarRolAutorizado(correoNormalizado);
    return esRolValido(rol) ? rol : null;
  } catch (error) {
    console.error("[roles] Error consultando autorización:", error);
    return null;
  }
}

export async function estaAutorizado(correo: string | null | undefined): Promise<boolean> {
  return (await obtenerRol(correo)) !== null;
}
