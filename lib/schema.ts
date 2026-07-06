import { z } from "zod";
import { esRutValido } from "./rut";
import { esTelefonoValido } from "./phone";
import { NOMBRES_REGIONES, comunasDeRegion } from "./regiones";
import { CARGOS, EXPERIENCIA, TURNOS, LICENCIAS, COMO_SE_ENTERO } from "./opciones";

const MAX_EDAD = 80;
const MIN_EDAD = 18;

function edadValida(fechaISO: string): boolean {
  const nacimiento = new Date(fechaISO);
  if (Number.isNaN(nacimiento.getTime())) return false;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const noHaCumplidoAun =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  if (noHaCumplidoAun) edad--;
  return edad >= MIN_EDAD && edad <= MAX_EDAD;
}

export const postulacionSchema = z
  .object({
    nombreCompleto: z
      .string()
      .trim()
      .min(3, "Ingresa tu nombre completo")
      .max(120, "Nombre demasiado largo")
      .regex(/^[a-zA-ZÀ-ÿñÑ\s'.-]+$/, "El nombre solo puede contener letras"),
    rut: z.string().refine(esRutValido, "RUT inválido, revisa el dígito verificador"),
    fechaNacimiento: z
      .string()
      .min(1, "Selecciona tu fecha de nacimiento")
      .refine(edadValida, `Debes tener entre ${MIN_EDAD} y ${MAX_EDAD} años`),
    telefono: z.string().refine(esTelefonoValido, "Teléfono inválido, formato +56 9 XXXX XXXX"),
    correo: z.string().trim().toLowerCase().email("Correo electrónico inválido"),
    region: z.enum(NOMBRES_REGIONES as [string, ...string[]], {
      error: "Selecciona una región",
    }),
    comuna: z.string().min(1, "Selecciona una comuna"),

    cargo: z.enum(CARGOS, { error: "Selecciona un cargo" }),
    experiencia: z.enum(EXPERIENCIA, { error: "Selecciona tu experiencia" }),
    turno: z.enum(TURNOS, { error: "Selecciona un régimen de turno" }),
    disponibilidadFaena: z.enum(["Sí", "No"], { error: "Indica tu disponibilidad" }),
    licencias: z.array(z.enum(LICENCIAS)).min(1, "Selecciona al menos una opción"),
    examenesVigentes: z.enum(["Sí", "No"], { error: "Indica si tienes exámenes vigentes" }),
    institucionExamenes: z.string().trim().max(120, "Nombre demasiado largo").optional(),

    linkedin: z
      .string()
      .trim()
      .max(200, "Link demasiado largo")
      .optional()
      .refine(
        (valor) => !valor || /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/.+/i.test(valor),
        "Ingresa un link válido de LinkedIn (ej: https://linkedin.com/in/tu-nombre)"
      ),

    comoSeEntero: z.enum(COMO_SE_ENTERO, { error: "Selecciona una opción" }),
    autorizacionDatos: z.literal(true, {
      error: "Debes autorizar el tratamiento de tus datos personales",
    }),
  })
  .superRefine((datos, ctx) => {
    if (!comunasDeRegion(datos.region).includes(datos.comuna)) {
      ctx.addIssue({
        code: "custom",
        path: ["comuna"],
        message: "La comuna no corresponde a la región seleccionada",
      });
    }
    if (datos.examenesVigentes === "Sí" && !datos.institucionExamenes?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["institucionExamenes"],
        message: "Indica la institución donde realizaste los exámenes",
      });
    }
  });

export type PostulacionInput = z.infer<typeof postulacionSchema>;

export const ARCHIVO_TIPOS_PERMITIDOS = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

export const ARCHIVO_TAMANO_MAXIMO = 8 * 1024 * 1024; // 8 MB
