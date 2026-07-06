import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { agregarUsuarioAutorizado, credencialesGraphConfiguradas, listarUsuariosAutorizados } from "@/lib/graph";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function exigirAdmin() {
  const session = await auth();
  if (!session || session.user?.rol !== "admin") return null;
  return session;
}

export async function GET() {
  const session = await exigirAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  if (!credencialesGraphConfiguradas()) {
    return NextResponse.json({ error: "SharePoint no está configurado." }, { status: 503 });
  }

  try {
    const usuarios = await listarUsuariosAutorizados();
    return NextResponse.json({ usuarios });
  } catch (error) {
    console.error("[usuarios] Error al listar:", error);
    return NextResponse.json({ error: "No pudimos cargar los usuarios." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await exigirAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const cuerpo = await request.json().catch(() => null);
  const correo = String(cuerpo?.correo ?? "").trim().toLowerCase();
  const rol = String(cuerpo?.rol ?? "");

  if (!/^[^\s@]+@pertec\.cl$/.test(correo)) {
    return NextResponse.json({ error: "Debe ser un correo @pertec.cl válido." }, { status: 400 });
  }
  if (rol !== "admin" && rol !== "reclutador") {
    return NextResponse.json({ error: "Rol inválido." }, { status: 400 });
  }

  try {
    const existentes = await listarUsuariosAutorizados();
    if (existentes.some((u) => u.correo === correo)) {
      return NextResponse.json({ error: "Ese correo ya tiene acceso." }, { status: 409 });
    }
    await agregarUsuarioAutorizado(correo, rol);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[usuarios] Error al agregar:", error);
    return NextResponse.json({ error: "No pudimos agregar el usuario." }, { status: 500 });
  }
}
