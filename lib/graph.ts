import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential } from "@azure/identity";
import type { PostulacionInput } from "./schema";

const GRAPH_SCOPE = "https://graph.microsoft.com/.default";

// Nombre interno de la Lista y de la Biblioteca de documentos en el sitio SharePoint.
// Deben coincidir con lo creado en el sitio (ver SETUP.md).
const NOMBRE_LISTA = "Postulaciones";

export function credencialesGraphConfiguradas(): boolean {
  return Boolean(
    process.env.AZURE_TENANT_ID &&
      process.env.AZURE_CLIENT_ID &&
      process.env.AZURE_CLIENT_SECRET &&
      process.env.SHAREPOINT_SITE_ID &&
      process.env.SHAREPOINT_DRIVE_ID
  );
}

let credencial: ClientSecretCredential | null = null;

function obtenerCredencial(): ClientSecretCredential {
  if (!credencial) {
    credencial = new ClientSecretCredential(
      process.env.AZURE_TENANT_ID!,
      process.env.AZURE_CLIENT_ID!,
      process.env.AZURE_CLIENT_SECRET!
    );
  }
  return credencial;
}

async function clienteGraph(): Promise<Client> {
  const token = await obtenerCredencial().getToken(GRAPH_SCOPE);
  if (!token) throw new Error("No fue posible autenticar contra Microsoft Graph");
  return Client.init({
    authProvider: (done) => done(null, token.token),
  });
}

const SITE_ID = () => process.env.SHAREPOINT_SITE_ID!;
const DRIVE_ID = () => process.env.SHAREPOINT_DRIVE_ID!;

export async function existeRutDuplicado(rut: string): Promise<boolean> {
  const graph = await clienteGraph();
  const respuesta = await graph
    .api(`/sites/${SITE_ID()}/lists/${NOMBRE_LISTA}/items`)
    .header("Prefer", "HonorNonIndexedQueriesWarningMayFailRandomly")
    .expand("fields(select=RUT)")
    .filter(`fields/RUT eq '${rut.replace(/'/g, "")}'`)
    .get();

  return Array.isArray(respuesta?.value) && respuesta.value.length > 0;
}

interface ArchivoSubido {
  nombre: string;
  urlWeb: string;
}

export async function subirArchivoAPostulacion(
  carpeta: string,
  archivo: { nombre: string; buffer: Buffer; tipo: string }
): Promise<ArchivoSubido> {
  const graph = await clienteGraph();
  const rutaDestino = `Postulaciones/${carpeta}/${archivo.nombre}`;

  const resultado = await graph
    .api(`/drives/${DRIVE_ID()}/root:/${encodeURI(rutaDestino)}:/content`)
    .header("Content-Type", archivo.tipo || "application/octet-stream")
    .put(archivo.buffer);

  return { nombre: archivo.nombre, urlWeb: resultado.webUrl };
}

export async function crearItemPostulacion(
  datos: PostulacionInput,
  archivos: { cv: ArchivoSubido; otros: ArchivoSubido[] }
): Promise<void> {
  const graph = await clienteGraph();

  await graph.api(`/sites/${SITE_ID()}/lists/${NOMBRE_LISTA}/items`).post({
    fields: {
      Title: datos.nombreCompleto,
      RUT: datos.rut,
      FechaNacimiento: datos.fechaNacimiento,
      Telefono: datos.telefono,
      Correo: datos.correo,
      Region: datos.region,
      Comuna: datos.comuna,
      Cargo: datos.cargo,
      Experiencia: datos.experiencia,
      Turno: datos.turno,
      DisponibilidadFaena: datos.disponibilidadFaena,
      Licencias: datos.licencias.join("; "),
      ExamenesVigentes: datos.examenesVigentes,
      InstitucionExamenes: datos.institucionExamenes ?? "",
      ComoSeEntero: datos.comoSeEntero,
      CVUrl: archivos.cv.urlWeb,
      OtrosDocumentosUrl: archivos.otros.map((a) => a.urlWeb).join("; "),
    },
  });
}
