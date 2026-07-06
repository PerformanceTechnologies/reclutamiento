import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { eliminarPostulacion } from "@/lib/graph";

export const runtime = "nodejs";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user?.rol !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await eliminarPostulacion(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[postulaciones] Error al eliminar:", error);
    return NextResponse.json({ error: "No pudimos eliminar la postulación." }, { status: 500 });
  }
}
