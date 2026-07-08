# Puesta en marcha — Formulario de Reclutamiento PERTEC

El formulario (frontend + validaciones + antispam) ya está construido y funciona de forma
independiente. Para que las postulaciones se guarden de verdad en SharePoint, falta conectar
las credenciales de Microsoft 365 — esa parte requiere acceso administrativo a tu tenant que
yo no tengo, así que estos pasos los debes hacer tú (o tu equipo de TI).

## 1. App Registration en Entra ID

1. Portal Azure → **Entra ID** → **App registrations** → **New registration**.
2. Anota el **Tenant ID** y **Application (client) ID** que se generan.
3. **Certificates & secrets** → **New client secret** → copia el *value* inmediatamente (solo se
   muestra una vez) → ese es tu `AZURE_CLIENT_SECRET`.
4. **API permissions** → **Add a permission** → **Microsoft Graph** → **Application permissions**
   → busca y agrega `Sites.Selected`.
5. **Grant admin consent** para ese permiso (requiere rol de administrador global o de
   aplicaciones).

## 2. Sitio SharePoint

1. Crea (o reutiliza) el sitio de SharePoint donde vivirán las postulaciones.
2. Dentro del sitio crea:
   - Una **Lista** llamada `Postulaciones` con las columnas: `RUT`, `FechaNacimiento`,
     `Telefono`, `Correo`, `Region`, `Comuna`, `Cargo`, `Experiencia`, `Turno`,
     `DisponibilidadFaena`, `Licencias`, `ExamenesVigentes`, `InstitucionExamenes`, `LinkedIn`,
     `ComoSeEntero`, `CVUrl`, `OtrosDocumentosUrl` (todas de tipo texto de una línea sirven).
   - Una **Biblioteca de documentos** (puede ser la biblioteca "Documentos" por defecto).
3. Como `Sites.Selected` no da acceso automático, debes otorgárselo explícitamente a la app:
   con PowerShell (`Grant-PnPAzureADAppSitePermission`) o vía Graph Explorer, dale permiso
   **write** de tu App Registration sobre este sitio específico.
4. Obtén el **Site ID**: `GET https://graph.microsoft.com/v1.0/sites/{dominio}:/sites/{nombre-sitio}`
   en [Graph Explorer](https://developer.microsoft.com/graph/graph-explorer).
5. Obtén el **Drive ID** de la biblioteca: `GET /sites/{site-id}/drives`.

## 3. Variables de entorno

Copia `.env.example` a `.env.local` (desarrollo) y completa los 5 valores obtenidos arriba.
En Vercel, agrégalas en **Settings → Environment Variables** (Production y Preview).

## 4. Dominio en Vercel

**Settings → Domains** → agrega `postular.pertec.cl` → sigue la instrucción de Vercel
para crear el registro **CNAME** en el proveedor DNS de pertec.cl.

> El panel interno donde el equipo revisa las postulaciones ya no vive en este proyecto —
> se administra desde `core.pertec.cl/reclutamiento`, reutilizando este mismo App
> Registration solo para autenticar el acceso de servidor a servidor con Microsoft Graph.

## 5. Notificación automática (Power Automate)

En [Power Automate](https://make.powerautomate.com): **Crear flujo automatizado** → trigger
"Cuando se crea un elemento" (SharePoint, lista `Postulaciones`) → acción "Enviar un correo
electrónico (V2)" a tu equipo de Reclutamiento.

## Mientras tanto

Sin estas 5 variables configuradas, el formulario funciona igual en desarrollo local (`npm run
dev`): valida todo y **simula** un envío exitoso sin guardar nada, para que puedas probar la
experiencia completa. En producción, si faltan las variables, el formulario muestra un mensaje
de mantenimiento en vez de fingir que la postulación se guardó.
