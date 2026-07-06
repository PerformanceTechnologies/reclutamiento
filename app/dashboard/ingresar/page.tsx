import Image from "next/image";
import { signIn } from "@/auth";

export default function IngresarDashboard({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-crema px-6">
      <Image
        src="/logo-pertec.png"
        alt="Performance Technologies — PERTEC"
        width={220}
        height={170}
        className="h-14 w-auto object-contain"
        priority
      />

      <div className="mt-10 w-full max-w-sm rounded-2xl border border-borde bg-white p-8 text-center shadow-sm">
        <h1 className="font-condensed text-xl font-bold uppercase text-tinta">
          Dashboard de Postulaciones
        </h1>
        <p className="mt-2 text-sm text-tinta/60">
          Acceso exclusivo para el equipo de PERTEC con cuenta @pertec.cl.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("microsoft-entra-id", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-naranjo px-5 py-3 font-condensed text-sm font-bold uppercase tracking-wide text-white transition hover:bg-naranjo-suave"
          >
            Iniciar sesión con Microsoft
          </button>
        </form>

        <ErrorAcceso searchParams={searchParams} />
      </div>
    </div>
  );
}

async function ErrorAcceso({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  if (!error) return null;
  return (
    <p className="mt-4 text-xs font-medium text-red-600">
      Tu cuenta no tiene acceso a este panel. Debes usar una cuenta @pertec.cl.
    </p>
  );
}
