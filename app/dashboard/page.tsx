import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import PanelPostulaciones from "@/components/PanelPostulaciones";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/dashboard/ingresar");

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
              Dashboard de Postulaciones
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-tinta/60">
              {session.user?.email}
              {session.user?.rol && (
                <span className="ml-2 rounded-full bg-teal/10 px-2 py-0.5 text-[11px] font-semibold uppercase text-teal">
                  {session.user.rol}
                </span>
              )}
            </span>
            {session.user?.rol === "admin" && (
              <Link
                href="/dashboard/usuarios"
                className="rounded-lg border border-borde px-3 py-1.5 text-xs font-medium text-tinta/70 transition hover:border-naranjo/40 hover:text-naranjo"
              >
                Gestionar usuarios
              </Link>
            )}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/dashboard/ingresar" });
              }}
            >
              <button
                type="submit"
                className="rounded-lg border border-borde px-3 py-1.5 text-xs font-medium text-tinta/70 transition hover:border-naranjo/40 hover:text-naranjo"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <PanelPostulaciones esAdmin={session.user?.rol === "admin"} />
      </main>
    </div>
  );
}
