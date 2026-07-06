"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postulacionSchema, type PostulacionInput, ARCHIVO_TIPOS_PERMITIDOS, ARCHIVO_TAMANO_MAXIMO } from "@/lib/schema";
import { formatearRut } from "@/lib/rut";
import { formatearTelefono } from "@/lib/phone";
import { NOMBRES_REGIONES, comunasDeRegion } from "@/lib/regiones";
import { CARGOS, EXPERIENCIA, TURNOS, LICENCIAS, COMO_SE_ENTERO } from "@/lib/opciones";
import { Campo, Seccion, inputBase, IconoCandado } from "./ui";
import Link from "next/link";

const TOTAL_SECCIONES = "04";

function tamanoLegible(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PostulacionForm() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PostulacionInput>({
    resolver: zodResolver(postulacionSchema),
    defaultValues: {
      licencias: [],
    },
  });

  const region = watch("region");
  const comunasDisponibles = region ? comunasDeRegion(region) : [];
  const examenesVigentes = watch("examenesVigentes");

  const [cv, setCv] = useState<File | null>(null);
  const [otros, setOtros] = useState<File[]>([]);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [estado, setEstado] = useState<"idle" | "enviado" | "error" | "duplicado">("idle");
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const montadoEn = useRef<number>(0);
  const honeypotRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    montadoEn.current = Date.now();
  }, []);

  function validarArchivo(archivo: File): string | null {
    if (!ARCHIVO_TIPOS_PERMITIDOS.includes(archivo.type)) {
      return "Formato no permitido. Usa PDF, Word, JPG o PNG.";
    }
    if (archivo.size > ARCHIVO_TAMANO_MAXIMO) {
      return `El archivo supera el tamaño máximo (${tamanoLegible(ARCHIVO_TAMANO_MAXIMO)}).`;
    }
    return null;
  }

  function manejarCv(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0] ?? null;
    if (!archivo) {
      setCv(null);
      return;
    }
    const err = validarArchivo(archivo);
    if (err) {
      setErrorArchivo(err);
      setCv(null);
      e.target.value = "";
      return;
    }
    setErrorArchivo(null);
    setCv(archivo);
  }

  function manejarOtros(e: React.ChangeEvent<HTMLInputElement>) {
    const archivos = Array.from(e.target.files ?? []);
    for (const archivo of archivos) {
      const err = validarArchivo(archivo);
      if (err) {
        setErrorArchivo(err);
        e.target.value = "";
        return;
      }
    }
    setErrorArchivo(null);
    setOtros(archivos);
  }

  async function onSubmit(datos: PostulacionInput) {
    setMensajeError(null);
    setEstado("idle");

    const formData = new FormData();
    Object.entries(datos).forEach(([clave, valor]) => {
      if (valor === undefined) return;
      if (Array.isArray(valor)) {
        valor.forEach((v) => formData.append(clave, v));
      } else {
        formData.append(clave, String(valor));
      }
    });
    if (cv) formData.append("cv", cv);
    otros.forEach((archivo) => formData.append("otrosDocumentos", archivo));
    formData.append("tiempoTranscurridoMs", String(Date.now() - montadoEn.current));
    formData.append("empresaWeb", honeypotRef.current?.value ?? "");

    try {
      const respuesta = await fetch("/api/postulacion", {
        method: "POST",
        body: formData,
      });
      const cuerpo = await respuesta.json().catch(() => ({}));

      if (respuesta.ok) {
        setEstado("enviado");
        return;
      }
      if (respuesta.status === 409) {
        setEstado("duplicado");
        return;
      }
      if (respuesta.status === 429) {
        setMensajeError("Has enviado demasiadas solicitudes. Intenta nuevamente en unos minutos.");
      } else {
        setMensajeError(cuerpo.error ?? "No pudimos procesar tu postulación. Intenta nuevamente.");
      }
      setEstado("error");
    } catch {
      setMensajeError("No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.");
      setEstado("error");
    }
  }

  if (estado === "enviado") {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-borde bg-white px-8 py-14 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-teal/10 text-teal">
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="font-condensed text-2xl font-bold uppercase text-tinta">
          ¡Postulación recibida!
        </h2>
        <p className="mt-3 text-sm text-tinta/65">
          Gracias por tu interés en PERTEC. Nuestro equipo de reclutamiento revisará tus
          antecedentes y se pondrá en contacto contigo si tu perfil calza con una vacante activa.
        </p>
      </div>
    );
  }

  if (estado === "duplicado") {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-borde bg-white px-8 py-14 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-naranjo/10 text-naranjo">
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
            <path
              d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A1 1 0 003 19.5h18a1 1 0 00.87-1.46L13.7 3.86a1 1 0 00-1.72 0z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="font-condensed text-2xl font-bold uppercase text-tinta">
          Ya tenemos una postulación con este RUT
        </h2>
        <p className="mt-3 text-sm text-tinta/65">
          Encontramos una postulación previa asociada a este RUT. Si necesitas actualizar tus
          antecedentes, escríbenos directamente a nuestro equipo de reclutamiento.
        </p>
        <button
          onClick={() => setEstado("idle")}
          className="mt-6 text-sm font-semibold text-naranjo underline-offset-4 hover:underline"
        >
          Volver al formulario
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-borde bg-white shadow-sm"
      noValidate
    >
      {/* Honeypot anti-spam: campo invisible para humanos, atractivo para bots */}
      <div className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="empresa_web">No completar este campo</label>
        <input id="empresa_web" name="empresa_web" type="text" tabIndex={-1} autoComplete="off" ref={honeypotRef} />
      </div>

      <Seccion numero="01" total={TOTAL_SECCIONES} titulo="Datos personales">
        <Campo label="Nombre completo" required error={errors.nombreCompleto?.message}>
          <input className={inputBase} placeholder="Ej: Juan Pérez Soto" {...register("nombreCompleto")} />
        </Campo>

        <Controller
          control={control}
          name="rut"
          render={({ field }) => (
            <Campo label="RUT" required error={errors.rut?.message}>
              <input
                className={inputBase}
                placeholder="12.345.678-9"
                inputMode="text"
                maxLength={12}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(formatearRut(e.target.value))}
                onBlur={field.onBlur}
              />
            </Campo>
          )}
        />

        <Campo label="Fecha de nacimiento" required error={errors.fechaNacimiento?.message}>
          <input type="date" className={inputBase} {...register("fechaNacimiento")} />
        </Campo>

        <Controller
          control={control}
          name="telefono"
          render={({ field }) => (
            <Campo label="Teléfono" required error={errors.telefono?.message} hint="Formato: +56 9 XXXX XXXX">
              <input
                className={inputBase}
                placeholder="+56 9 1234 5678"
                inputMode="tel"
                maxLength={16}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(formatearTelefono(e.target.value))}
                onBlur={field.onBlur}
              />
            </Campo>
          )}
        />

        <Campo label="Correo electrónico" required error={errors.correo?.message}>
          <input type="email" className={inputBase} placeholder="tu@correo.com" {...register("correo")} />
        </Campo>

        <div />

        <Campo label="Región" required error={errors.region?.message}>
          <select
            className={inputBase}
            {...register("region")}
            onChange={(e) => {
              setValue("region", e.target.value as PostulacionInput["region"]);
              setValue("comuna", "");
            }}
          >
            <option value="">Selecciona una región</option>
            {NOMBRES_REGIONES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Campo>

        <Campo label="Comuna" required error={errors.comuna?.message}>
          <select className={inputBase} disabled={!region} {...register("comuna")}>
            <option value="">{region ? "Selecciona una comuna" : "Primero elige una región"}</option>
            {comunasDisponibles.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Campo>
      </Seccion>

      <Seccion numero="02" total={TOTAL_SECCIONES} titulo="Datos laborales">
        <Campo label="Cargo al que postulas" required error={errors.cargo?.message}>
          <select className={inputBase} {...register("cargo")}>
            <option value="">Selecciona un cargo</option>
            {CARGOS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Campo>

        <Campo label="Años de experiencia en minería/mantenimiento" required error={errors.experiencia?.message}>
          <select className={inputBase} {...register("experiencia")}>
            <option value="">Selecciona un rango</option>
            {EXPERIENCIA.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </Campo>

        <Campo label="Régimen de turno disponible" required error={errors.turno?.message}>
          <select className={inputBase} {...register("turno")}>
            <option value="">Selecciona un régimen</option>
            {TURNOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Campo>

        <Campo label="¿Disponibilidad para faena/traslado?" required error={errors.disponibilidadFaena?.message}>
          <div className="flex gap-3 pt-1">
            {(["Sí", "No"] as const).map((op) => (
              <label
                key={op}
                className="flex flex-1 cursor-pointer items-center justify-center rounded-lg border border-borde px-4 py-2.5 text-sm font-medium text-tinta/80 transition has-checked:border-naranjo has-checked:bg-naranjo/8 has-checked:text-naranjo"
              >
                <input type="radio" value={op} className="sr-only" {...register("disponibilidadFaena")} />
                {op}
              </label>
            ))}
          </div>
        </Campo>

        <Campo label="Exámenes preocupacionales vigentes" required error={errors.examenesVigentes?.message}>
          <div className="flex gap-3 pt-1">
            {(["Sí", "No"] as const).map((op) => (
              <label
                key={op}
                className="flex flex-1 cursor-pointer items-center justify-center rounded-lg border border-borde px-4 py-2.5 text-sm font-medium text-tinta/80 transition has-checked:border-naranjo has-checked:bg-naranjo/8 has-checked:text-naranjo"
              >
                <input type="radio" value={op} className="sr-only" {...register("examenesVigentes")} />
                {op}
              </label>
            ))}
          </div>
        </Campo>

        {examenesVigentes === "Sí" && (
          <Campo label="Institución donde realizaste los exámenes" required error={errors.institucionExamenes?.message}>
            <input
              className={inputBase}
              placeholder="Ej: Mutual de Seguridad"
              {...register("institucionExamenes")}
            />
          </Campo>
        )}

        <div />

        <Campo label="Licencias / certificaciones" required error={errors.licencias?.message}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {LICENCIAS.map((lic) => (
              <label
                key={lic}
                className="flex items-center gap-2.5 rounded-lg border border-borde px-3.5 py-2.5 text-sm text-tinta/80 transition has-checked:border-naranjo has-checked:bg-naranjo/8"
              >
                <input
                  type="checkbox"
                  value={lic}
                  className="h-4 w-4 accent-naranjo"
                  {...register("licencias")}
                />
                {lic}
              </label>
            ))}
          </div>
        </Campo>
      </Seccion>

      <Seccion
        numero="03"
        total={TOTAL_SECCIONES}
        titulo="Documentos"
        descripcion="Formatos permitidos: PDF, Word, JPG o PNG — máximo 8 MB por archivo."
      >
        <div className="sm:col-span-2">
          <Campo label="Currículum (CV)" hint="Opcional." error={errorArchivo ?? undefined}>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-borde bg-crema/60 px-6 py-8 text-center transition hover:border-naranjo/50">
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-naranjo">
                <path
                  d="M12 15V4m0 0L8 8m4-4l4 4M5 15v3a2 2 0 002 2h10a2 2 0 002-2v-3"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm font-medium text-tinta/80">
                {cv ? cv.name : "Haz clic para subir tu CV (opcional)"}
              </span>
              {cv && <span className="text-xs text-tinta/45">{tamanoLegible(cv.size)}</span>}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={manejarCv}
              />
            </label>
          </Campo>
        </div>

        <div className="sm:col-span-2">
          <Campo label="Otros documentos (certificados, licencias)" hint="Opcional. Puedes seleccionar varios archivos.">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-borde bg-crema/60 px-6 py-5 text-center transition hover:border-teal/50">
              <span className="text-sm font-medium text-tinta/80">
                {otros.length > 0
                  ? `${otros.length} archivo(s) seleccionado(s)`
                  : "Haz clic para subir otros documentos"}
              </span>
              <input
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={manejarOtros}
              />
            </label>
          </Campo>
        </div>

        <div className="sm:col-span-2">
          <Campo label="Perfil de LinkedIn" hint="Opcional." error={errors.linkedin?.message}>
            <input
              className={inputBase}
              placeholder="https://linkedin.com/in/tu-nombre"
              {...register("linkedin")}
            />
          </Campo>
        </div>
      </Seccion>

      <Seccion numero="04" total={TOTAL_SECCIONES} titulo="Para finalizar">
        <Campo label="¿Cómo te enteraste de la vacante?" required error={errors.comoSeEntero?.message}>
          <select className={inputBase} {...register("comoSeEntero")}>
            <option value="">Selecciona una opción</option>
            {COMO_SE_ENTERO.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Campo>

        <div />

        <div className="sm:col-span-2 rounded-xl border border-borde bg-crema/60 p-4">
          <label className="flex items-start gap-3 text-sm text-tinta/75">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 accent-naranjo"
              {...register("autorizacionDatos")}
            />
            <span>
              Autorizo a PERTEC a tratar mis datos personales y antecedentes adjuntos para fines de
              evaluación y selección de personal, conforme a la{" "}
              <Link href="/politica-privacidad" target="_blank" className="font-medium text-naranjo underline-offset-2 hover:underline">
                Política de Privacidad
              </Link>
              . <span className="text-naranjo">*</span>
            </span>
          </label>
          {errors.autorizacionDatos && (
            <p className="mt-2 text-xs font-medium text-red-600">{errors.autorizacionDatos.message}</p>
          )}
        </div>

        <div className="sm:col-span-2 flex items-start gap-2.5 text-xs text-tinta/50">
          <IconoCandado className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
          <p>Conexión cifrada (HTTPS) y acceso restringido. No cedemos tu información a terceros.</p>
        </div>

        {mensajeError && (
          <div className="sm:col-span-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {mensajeError}
          </div>
        )}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-naranjo px-6 py-3.5 font-condensed text-sm font-bold uppercase tracking-wide text-white transition hover:bg-naranjo-suave disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSubmitting ? "Enviando..." : "Enviar postulación"}
            {!isSubmitting && (
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                <path
                  d="M4 10h12m-5-5l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </Seccion>
    </form>
  );
}
