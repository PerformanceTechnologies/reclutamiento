import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import PanelUsuarios from "@/components/PanelUsuarios";

export default async function UsuariosDashboardPage() {
  const session = await auth();
  if (!session) redirect("/dashboard/ingresar");
  if (session.user?.rol !== "admin") redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-crema">
      <header className="sticky top-0 z-40 border-b border-borde bg-crema/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Image
              src="/logo-pertec.png"
              alt="Performance Technologies — PERTEC"
              width={220}
              height={170}
              className="h-11 w-auto object-contain"
              priority
            />
            <span className="font-condensed text-lg font-bold uppercase text-tinta">
              Usuarios del dashboard
            </span>
          </div>
          <Link
            href="/dashboard"
            className="rounded-lg border border-borde px-3 py-1.5 text-xs font-medium text-tinta/70 transition hover:border-naranjo/40 hover:text-naranjo"
          >
            ← Volver al dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <PanelUsuarios />
      </main>
    </div>
  );
}
