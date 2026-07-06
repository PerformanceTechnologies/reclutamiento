import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { credencialesGraphConfiguradas, listarPostulaciones } from "@/lib/graph";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!credencialesGraphConfiguradas()) {
    return NextResponse.json({ error: "SharePoint no está configurado." }, { status: 503 });
  }

  try {
    const postulaciones = await listarPostulaciones();
    return NextResponse.json({ postulaciones, actualizadoEn: new Date().toISOString() });
  } catch (error) {
    console.error("[postulaciones] Error al listar:", error);
    return NextResponse.json({ error: "No pudimos cargar las postulaciones." }, { status: 500 });
  }
}
