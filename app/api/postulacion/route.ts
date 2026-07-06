import { NextResponse } from "next/server";
import { postulacionSchema, ARCHIVO_TIPOS_PERMITIDOS, ARCHIVO_TAMANO_MAXIMO } from "@/lib/schema";
import { excedeLimite, obtenerIpCliente } from "@/lib/rateLimit";
import {
  credencialesGraphConfiguradas,
  existeRutDuplicado,
  subirArchivoAPostulacion,
  crearItemPostulacion,
} from "@/lib/graph";
import { normalizarRut } from "@/lib/rut";

export const runtime = "nodejs";

const TIEMPO_MINIMO_HUMANO_MS = 1500;

function validarArchivo(archivo: File | null): string | null {
  if (!archivo) return null;
  if (!ARCHIVO_TIPOS_PERMITIDOS.includes(archivo.type)) {
    return "Formato de archivo no permitido.";
  }
  if (archivo.size > ARCHIVO_TAMANO_MAXIMO) {
    return "El archivo supera el tamaño máximo permitido (8 MB).";
  }
  return null;
}

export async function POST(request: Request) {
  const ip = obtenerIpCliente(request.headers);
  if (excedeLimite(ip)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta nuevamente en unos minutos." },
      { status: 429 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  // Honeypot: campo invisible para humanos. Si viene con contenido, es un bot.
  const honeypot = String(formData.get("empresaWeb") ?? "");
  if (honeypot.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  // Time-trap: un humano no puede completar 14 campos + adjuntar un archivo en menos de 1.5s.
  const tiempoTranscurrido = Number(formData.get("tiempoTranscurridoMs") ?? 0);
  if (!Number.isFinite(tiempoTranscurrido) || tiempoTranscurrido < TIEMPO_MINIMO_HUMANO_MS) {
    return NextResponse.json(
      { error: "Detectamos un envío inusualmente rápido. Por favor intenta nuevamente." },
      { status: 400 }
    );
  }

  const datosCrudos = {
    nombreCompleto: formData.get("nombreCompleto"),
    rut: formData.get("rut"),
    fechaNacimiento: formData.get("fechaNacimiento"),
    telefono: formData.get("telefono"),
    correo: formData.get("correo"),
    region: formData.get("region"),
    comuna: formData.get("comuna"),
    cargo: formData.get("cargo"),
    experiencia: formData.get("experiencia"),
    turno: formData.get("turno"),
    disponibilidadFaena: formData.get("disponibilidadFaena"),
    licencias: formData.getAll("licencias"),
    examenesVigentes: formData.get("examenesVigentes"),
    institucionExamenes: formData.get("institucionExamenes") || undefined,
    linkedin: formData.get("linkedin") || undefined,
    comoSeEntero: formData.get("comoSeEntero"),
    autorizacionDatos: formData.get("autorizacionDatos") === "true",
  };

  const resultado = postulacionSchema.safeParse(datosCrudos);
  if (!resultado.success) {
    return NextResponse.json(
      { error: "Revisa los datos ingresados.", detalles: resultado.error.issues },
      { status: 400 }
    );
  }
  const datos = resultado.data;

  const cvBruto = formData.get("cv") as File | null;
  const cv = cvBruto && cvBruto.size > 0 ? cvBruto : null;
  if (cv) {
    const errorCv = validarArchivo(cv);
    if (errorCv) return NextResponse.json({ error: errorCv }, { status: 400 });
  }

  const otrosDocumentos = formData.getAll("otrosDocumentos").filter((a): a is File => a instanceof File && a.size > 0);
  for (const archivo of otrosDocumentos) {
    const error = validarArchivo(archivo);
    if (error) return NextResponse.json({ error }, { status: 400 });
  }

  const rutNormalizado = normalizarRut(datos.rut);

  if (!credencialesGraphConfiguradas()) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[postulacion] Credenciales de Microsoft Graph no configuradas — simulando envío exitoso solo en desarrollo."
      );
      return NextResponse.json({ ok: true, simulado: true });
    }
    console.error("[postulacion] Faltan variables de entorno de Microsoft Graph/SharePoint en producción.");
    return NextResponse.json(
      { error: "El sistema de postulaciones no está disponible en este momento. Intenta más tarde." },
      { status: 503 }
    );
  }

  try {
    const yaExiste = await existeRutDuplicado(rutNormalizado);
    if (yaExiste) {
      return NextResponse.json(
        { error: "Ya existe una postulación registrada con este RUT." },
        { status: 409 }
      );
    }

    const carpeta = `${rutNormalizado.replace(/[.\-]/g, "")}-${Date.now()}`;

    const cvSubido = cv
      ? await subirArchivoAPostulacion(carpeta, {
          nombre: cv.name,
          buffer: Buffer.from(await cv.arrayBuffer()),
          tipo: cv.type,
        })
      : undefined;

    const otrosSubidos = [];
    for (const archivo of otrosDocumentos) {
      otrosSubidos.push(
        await subirArchivoAPostulacion(carpeta, {
          nombre: archivo.name,
          buffer: Buffer.from(await archivo.arrayBuffer()),
          tipo: archivo.type,
        })
      );
    }

    await crearItemPostulacion(
      { ...datos, rut: rutNormalizado },
      { cv: cvSubido, otros: otrosSubidos }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[postulacion] Error al procesar postulación:", error);
    return NextResponse.json(
      { error: "No pudimos guardar tu postulación. Intenta nuevamente en unos minutos." },
      { status: 500 }
    );
  }
}
