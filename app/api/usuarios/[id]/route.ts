import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { eliminarUsuarioAutorizado, listarUsuariosAutorizados } from "@/lib/graph";

export const runtime = "nodejs";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user?.rol !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const usuarios = await listarUsuariosAutorizados();
    const objetivo = usuarios.find((u) => u.id === id);

    if (objetivo?.correo === session.user?.email?.toLowerCase()) {
      return NextResponse.json(
        { error: "No puedes quitarte el acceso a ti mismo." },
        { status: 400 }
      );
    }

    await eliminarUsuarioAutorizado(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[usuarios] Error al eliminar:", error);
    return NextResponse.json({ error: "No pudimos quitar el acceso." }, { status: 500 });
  }
}
