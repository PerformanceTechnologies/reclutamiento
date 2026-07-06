"use client";

import { useCallback, useEffect, useState } from "react";

interface Usuario {
  id: string;
  correo: string;
  rol: string;
}

const inputBase =
  "w-full rounded-lg border border-borde bg-white px-3.5 py-2.5 text-sm text-tinta outline-none transition focus:border-naranjo focus:ring-2 focus:ring-naranjo/15";

export default function PanelUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("reclutador");
  const [enviando, setEnviando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const respuesta = await fetch("/api/usuarios", { cache: "no-store" });
      const cuerpo = await respuesta.json();
      if (!respuesta.ok) throw new Error(cuerpo.error ?? "Error desconocido");
      setUsuarios(cuerpo.usuarios);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos cargar los usuarios.");
    }
  }, []);

  useEffect(() => {
    const primeraCarga = setTimeout(cargar, 0);
    return () => clearTimeout(primeraCarga);
  }, [cargar]);

  async function agregarUsuario(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const respuesta = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, rol }),
      });
      const cuerpo = await respuesta.json();
      if (!respuesta.ok) throw new Error(cuerpo.error ?? "No pudimos agregar el usuario.");
      setCorreo("");
      setRol("reclutador");
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos agregar el usuario.");
    } finally {
      setEnviando(false);
    }
  }

  async function quitarUsuario(id: string, correoUsuario: string) {
    if (!window.confirm(`¿Quitar el acceso de ${correoUsuario}?`)) return;
    setEliminandoId(id);
    try {
      const respuesta = await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
      const cuerpo = await respuesta.json();
      if (!respuesta.ok) throw new Error(cuerpo.error ?? "No pudimos quitar el acceso.");
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos quitar el acceso.");
    } finally {
      setEliminandoId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="etiqueta-seccion">Administración</span>
        <h1 className="mt-2 font-condensed text-2xl font-bold uppercase text-tinta">
          Usuarios con acceso al dashboard
        </h1>
        <p className="mt-1 text-sm text-tinta/55">
          Solo las cuentas listadas aquí pueden iniciar sesión en el panel de postulaciones.
        </p>
      </div>

      <form
        onSubmit={agregarUsuario}
        className="flex flex-col gap-3 rounded-2xl border border-borde bg-white p-5 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium text-tinta/85">Correo @pertec.cl</label>
          <input
            type="email"
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="nombre.apellido@pertec.cl"
            className={inputBase}
          />
        </div>
        <div className="sm:w-40">
          <label className="mb-1.5 block text-sm font-medium text-tinta/85">Rol</label>
          <select value={rol} onChange={(e) => setRol(e.target.value)} className={inputBase}>
            <option value="reclutador">Reclutador</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={enviando}
          className="inline-flex items-center justify-center rounded-lg bg-naranjo px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-naranjo-suave disabled:opacity-60"
        >
          {enviando ? "Agregando..." : "Agregar"}
        </button>
      </form>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-borde bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-borde text-xs uppercase tracking-wide text-tinta/45">
              <th className="px-6 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {(usuarios ?? []).map((u) => (
              <tr key={u.id} className="border-b border-borde/60 last:border-b-0">
                <td className="px-6 py-3 font-medium text-tinta">{u.correo}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
                      u.rol === "admin" ? "bg-teal/10 text-teal" : "bg-naranjo/10 text-naranjo"
                    }`}
                  >
                    {u.rol}
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <button
                    onClick={() => quitarUsuario(u.id, u.correo)}
                    disabled={eliminandoId === u.id}
                    className="text-xs font-medium text-tinta/50 hover:text-red-600 disabled:opacity-50"
                  >
                    {eliminandoId === u.id ? "Quitando..." : "Quitar acceso"}
                  </button>
                </td>
              </tr>
            ))}
            {usuarios && usuarios.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-tinta/45">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
