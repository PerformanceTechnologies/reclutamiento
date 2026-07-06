import Image from "next/image";
import Link from "next/link";
import PostulacionForm from "@/components/PostulacionForm";

const CONFIANZA = [
  {
    titulo: "Datos protegidos",
    texto: "Tu información se transmite cifrada y se almacena con acceso restringido.",
    icono: (
      <path
        d="M6 10.5V8a6 6 0 1112 0v2.5M5 10.5h14a1 1 0 011 1V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-8.5a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    titulo: "Revisión por especialistas",
    texto: "Tu postulación es evaluada por el equipo de Reclutamiento de PERTEC.",
    icono: (
      <path
        d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    titulo: "100% online",
    texto: "Completa tu postulación desde cualquier dispositivo, sin papeleo.",
    icono: (
      <path
        d="M12 8v4l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-crema">
      <header className="sticky top-0 z-40 border-b border-borde bg-crema/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Image
            src="/logo-pertec.png"
            alt="Performance Technologies — PERTEC"
            width={220}
            height={170}
            className="h-16 w-auto object-contain"
            priority
          />
          <a
            href="https://www.pertec.cl"
            className="text-sm font-medium text-tinta/60 transition hover:text-naranjo"
          >
            www.pertec.cl
          </a>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 pt-14 pb-10 text-center sm:pt-20">
          <span className="etiqueta-seccion mx-auto">Trabaja con nosotros</span>
          <h1 className="mx-auto mt-4 max-w-2xl font-condensed text-4xl font-extrabold uppercase leading-tight tracking-tight text-tinta sm:text-5xl">
            Postula a nuestro equipo
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-tinta/60">
            Somos una empresa con foco en continuidad operativa para la gran minería.
            Cuéntanos de ti y súmate a nuestro equipo de mantenimiento y operaciones.
          </p>

          <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-2">
            {CONFIANZA.map((item) => (
              <div
                key={item.titulo}
                title={item.texto}
                className="inline-flex items-center gap-1.5 rounded-full border border-borde bg-white px-3 py-1.5"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0 text-teal">
                  {item.icono}
                </svg>
                <span className="text-xs font-medium text-tinta/75">{item.titulo}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6">
          <PostulacionForm />
        </section>
      </main>

      <footer className="border-t border-borde bg-crema">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 py-8 text-center text-xs text-tinta/45">
          <p>© {new Date().getFullYear()} Performance Technologies SpA. Todos los derechos reservados.</p>
          <Link href="/politica-privacidad" className="font-medium text-tinta/55 underline-offset-2 hover:text-naranjo hover:underline">
            Política de privacidad
          </Link>
        </div>
      </footer>
    </div>
  );
}
