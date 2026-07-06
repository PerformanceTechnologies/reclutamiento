import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential } from "@azure/identity";
import type { PostulacionInput } from "./schema";

const GRAPH_SCOPE = "https://graph.microsoft.com/.default";

// IDs de las Listas en el sitio RRHHCorporativo (ver SETUP.md).
const ID_LISTA = "f9f9ce5d-99ba-433e-8316-f1ca8a22d945";
const ID_LISTA_USUARIOS = "d6bd8215-a92d-4bcb-8e94-5901bdf0c8d1";

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
    .api(`/sites/${SITE_ID()}/lists/${ID_LISTA}/items`)
    .header("Prefer", "HonorNonIndexedQueriesWarningMayFailRandomly")
    .expand("fields($select=RUT)")
    .filter(`fields/RUT eq '${rut.replace(/'/g, "")}'`)
    .get();

  return Array.isArray(respuesta?.value) && respuesta.value.length > 0;
}

export interface PostulacionGuardada {
  id: string;
  creadaEn: string;
  nombreCompleto: string;
  rut: string;
  fechaNacimiento: string;
  telefono: string;
  correo: string;
  region: string;
  comuna: string;
  cargo: string;
  experiencia: string;
  turno: string;
  disponibilidadFaena: string;
  licencias: string;
  examenesVigentes: string;
  institucionExamenes: string;
  linkedin: string;
  comoSeEntero: string;
  cvUrl: string;
  otrosDocumentosUrl: string;
}

const MAX_PAGINAS = 10;

export async function listarPostulaciones(): Promise<PostulacionGuardada[]> {
  const graph = await clienteGraph();
  const items: Record<string, unknown>[] = [];

  let siguiente: string | undefined = `/sites/${SITE_ID()}/lists/${ID_LISTA}/items?$expand=fields&$top=200`;
  let paginas = 0;

  while (siguiente && paginas < MAX_PAGINAS) {
    const respuesta = await graph.api(siguiente).get();
    items.push(...(respuesta?.value ?? []));
    siguiente = respuesta?.["@odata.nextLink"];
    paginas++;
  }

  return items
    .map((item) => {
      const f = (item.fields ?? {}) as Record<string, string>;
      return {
        id: String(item.id ?? ""),
        creadaEn: String(item.createdDateTime ?? ""),
        nombreCompleto: f.Title ?? "",
        rut: f.RUT ?? "",
        fechaNacimiento: f.FechaNacimiento ?? "",
        telefono: f.Telefono ?? "",
        correo: f.Correo ?? "",
        region: f.Region ?? "",
        comuna: f.Comuna ?? "",
        cargo: f.Cargo ?? "",
        experiencia: f.Experiencia ?? "",
        turno: f.Turno ?? "",
        disponibilidadFaena: f.DisponibilidadFaena ?? "",
        licencias: f.Licencias ?? "",
        examenesVigentes: f.ExamenesVigentes ?? "",
        institucionExamenes: f.InstitucionExamenes ?? "",
        linkedin: f.LinkedIn ?? "",
        comoSeEntero: f.ComoSeEntero ?? "",
        cvUrl: f.CVUrl ?? "",
        otrosDocumentosUrl: f.OtrosDocumentosUrl ?? "",
      };
    })
    .sort((a, b) => (a.creadaEn < b.creadaEn ? 1 : -1));
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

export async function eliminarPostulacion(id: string): Promise<void> {
  const graph = await clienteGraph();
  await graph.api(`/sites/${SITE_ID()}/lists/${ID_LISTA}/items/${id}`).delete();
}

export async function crearItemPostulacion(
  datos: PostulacionInput,
  archivos: { cv?: ArchivoSubido; otros: ArchivoSubido[] }
): Promise<void> {
  const graph = await clienteGraph();

  await graph.api(`/sites/${SITE_ID()}/lists/${ID_LISTA}/items`).post({
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
      LinkedIn: datos.linkedin ?? "",
      ComoSeEntero: datos.comoSeEntero,
      CVUrl: archivos.cv?.urlWeb ?? "",
      OtrosDocumentosUrl: archivos.otros.map((a) => a.urlWeb).join("; "),
    },
  });
}

export interface UsuarioAutorizado {
  id: string;
  correo: string;
  rol: string;
}

export async function listarUsuariosAutorizados(): Promise<UsuarioAutorizado[]> {
  const graph = await clienteGraph();
  const respuesta = await graph
    .api(`/sites/${SITE_ID()}/lists/${ID_LISTA_USUARIOS}/items`)
    .expand("fields")
    .top(200)
    .get();

  return (respuesta?.value ?? []).map((item: Record<string, unknown>) => {
    const f = (item.fields ?? {}) as Record<string, string>;
    return { id: String(item.id ?? ""), correo: (f.Title ?? "").toLowerCase(), rol: f.Rol ?? "" };
  });
}

export async function buscarRolAutorizado(correo: string): Promise<string | null> {
  const graph = await clienteGraph();
  const correoNormalizado = correo.toLowerCase().replace(/'/g, "");
  const respuesta = await graph
    .api(`/sites/${SITE_ID()}/lists/${ID_LISTA_USUARIOS}/items`)
    .header("Prefer", "HonorNonIndexedQueriesWarningMayFailRandomly")
    .expand("fields($select=Title,Rol)")
    .filter(`fields/Title eq '${correoNormalizado}'`)
    .get();

  const item = respuesta?.value?.[0];
  return item?.fields?.Rol ?? null;
}

export async function agregarUsuarioAutorizado(correo: string, rol: string): Promise<void> {
  const graph = await clienteGraph();
  await graph.api(`/sites/${SITE_ID()}/lists/${ID_LISTA_USUARIOS}/items`).post({
    fields: { Title: correo.toLowerCase(), Rol: rol },
  });
}

export async function eliminarUsuarioAutorizado(id: string): Promise<void> {
  const graph = await clienteGraph();
  await graph.api(`/sites/${SITE_ID()}/lists/${ID_LISTA_USUARIOS}/items/${id}`).delete();
}
