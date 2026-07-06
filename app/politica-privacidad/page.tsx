import Image from "next/image";
import Link from "next/link";

export default function PoliticaPrivacidad() {
  return (
    <div className="flex flex-1 flex-col bg-crema">
      <header className="sticky top-0 z-40 border-b border-borde bg-crema/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Image
            src="/logo-pertec.png"
            alt="Performance Technologies — PERTEC"
            width={160}
            height={40}
            className="h-9 w-auto object-contain"
          />
          <Link href="/" className="text-sm font-medium text-tinta/60 hover:text-naranjo">
            Volver al formulario
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl flex-1 px-6 py-14 text-tinta">
        <span className="etiqueta-seccion">Postulaciones PERTEC</span>
        <h1 className="mt-3 font-condensed text-3xl font-extrabold uppercase tracking-tight">
          Política de privacidad y tratamiento de datos personales
        </h1>
        <p className="mt-3 text-sm text-tinta/50">Última actualización: julio de 2026</p>

        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-tinta/75">
          <p>
            Performance Technologies SpA (&quot;PERTEC&quot;) trata los datos personales que
            entregas a través de este formulario de postulación de acuerdo con la Ley N° 19.628
            sobre Protección de la Vida Privada y su normativa complementaria.
          </p>

          <div>
            <h2 className="font-condensed text-lg font-bold uppercase text-tinta">
              1. ¿Qué datos recopilamos?
            </h2>
            <p className="mt-2">
              Recopilamos los datos que ingresas voluntariamente en el formulario: datos de
              identificación (nombre, RUT, fecha de nacimiento), datos de contacto (teléfono,
              correo electrónico, región y comuna), antecedentes laborales (cargo de interés,
              experiencia, disponibilidad, licencias y certificaciones) y los documentos que
              adjuntes (CV y otros certificados).
            </p>
          </div>

          <div>
            <h2 className="font-condensed text-lg font-bold uppercase text-tinta">
              2. ¿Para qué usamos tus datos?
            </h2>
            <p className="mt-2">
              Usamos tu información exclusivamente para evaluar tu postulación, contactarte
              durante el proceso de selección y, si aplicas a más de una vacante, para futuras
              búsquedas que calcen con tu perfil. No utilizamos tus datos con fines comerciales ni
              los vendemos a terceros.
            </p>
          </div>

          <div>
            <h2 className="font-condensed text-lg font-bold uppercase text-tinta">
              3. ¿Dónde se almacenan tus datos?
            </h2>
            <p className="mt-2">
              Tus datos y documentos se almacenan en infraestructura segura, con acceso
              restringido exclusivamente al personal autorizado del equipo de Reclutamiento de
              PERTEC bajo protocolos de confidencialidad. La transmisión de datos entre tu
              navegador y nuestros servidores se realiza mediante conexión cifrada de extremo a
              extremo (HTTPS).
            </p>
          </div>

          <div>
            <h2 className="font-condensed text-lg font-bold uppercase text-tinta">
              4. ¿Cuánto tiempo conservamos tu información?
            </h2>
            <p className="mt-2">
              Conservamos tus antecedentes mientras dure el proceso de selección y por un período
              razonable posterior, para futuras vacantes que puedan ajustarse a tu perfil. Puedes
              solicitar la eliminación de tus datos en cualquier momento.
            </p>
          </div>

          <div>
            <h2 className="font-condensed text-lg font-bold uppercase text-tinta">
              5. Tus derechos
            </h2>
            <p className="mt-2">
              Puedes solicitar acceso, rectificación o eliminación de tus datos personales
              escribiendo a nuestro equipo de Reclutamiento a través de{" "}
              <a href="https://www.pertec.cl" className="font-medium text-naranjo hover:underline">
                www.pertec.cl
              </a>
              .
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-borde bg-crema">
        <div className="mx-auto max-w-3xl px-6 py-6 text-center text-xs text-tinta/45">
          © {new Date().getFullYear()} Performance Technologies SpA. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
