"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PostulacionGuardada } from "@/lib/graph";

const INTERVALO_ACTUALIZACION_MS = 30_000;

function contarPor(lista: PostulacionGuardada[], clave: keyof PostulacionGuardada) {
  const conteo = new Map<string, number>();
  for (const item of lista) {
    const valor = item[clave] || "Sin especificar";
    conteo.set(valor, (conteo.get(valor) ?? 0) + 1);
  }
  return Array.from(conteo.entries())
    .map(([etiqueta, total]) => ({ etiqueta, total }))
    .sort((a, b) => b.total - a.total);
}

function formatearFecha(iso: string) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function hace(segundos: number) {
  if (segundos < 5) return "recién";
  if (segundos < 60) return `hace ${segundos}s`;
  return `hace ${Math.floor(segundos / 60)} min`;
}

export default function PanelPostulaciones() {
  const [postulaciones, setPostulaciones] = useState<PostulacionGuardada[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actualizadoEn, setActualizadoEn] = useState<Date | null>(null);
  const [segundosDesde, setSegundosDesde] = useState(0);
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const respuesta = await fetch("/api/postulaciones", { cache: "no-store" });
      const cuerpo = await respuesta.json();
      if (!respuesta.ok) throw new Error(cuerpo.error ?? "Error desconocido");
      setPostulaciones(cuerpo.postulaciones);
      setActualizadoEn(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos cargar los datos.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    const intervalo = setInterval(cargar, INTERVALO_ACTUALIZACION_MS);
    return () => clearInterval(intervalo);
  }, [cargar]);

  useEffect(() => {
    if (!actualizadoEn) return;
    const tick = setInterval(() => {
      setSegundosDesde(Math.round((Date.now() - actualizadoEn.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [actualizadoEn]);

  const porCargo = useMemo(() => contarPor(postulaciones ?? [], "cargo"), [postulaciones]);
  const porRegion = useMemo(() => contarPor(postulaciones ?? [], "region"), [postulaciones]);

  const ultimas24h = useMemo(() => {
    if (!postulaciones) return 0;
    const ahora = Date.now();
    return postulaciones.filter(
      (p) => p.creadaEn && ahora - new Date(p.creadaEn).getTime() < 24 * 60 * 60 * 1000
    ).length;
  }, [postulaciones]);

  const maxCargo = porCargo[0]?.total ?? 1;
  const maxRegion = porRegion[0]?.total ?? 1;

  if (error && !postulaciones) {
    return (
      <div className="rounded-2xl border border-borde bg-white p-8 text-center">
        <p className="text-sm font-medium text-red-600">{error}</p>
        <button
          onClick={cargar}
          className="mt-4 rounded-lg border border-borde px-4 py-2 text-sm font-medium text-tinta/70 hover:border-naranjo/40 hover:text-naranjo"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="etiqueta-seccion">Postulaciones</span>
        <span className="flex items-center gap-2 text-xs text-tinta/45">
          <span
            className={`h-1.5 w-1.5 rounded-full ${cargando ? "bg-naranjo animate-pulse" : "bg-teal"}`}
          />
          {actualizadoEn ? `Actualizado ${hace(segundosDesde)}` : "Cargando..."}
        </span>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <TarjetaResumen titulo="Total postulaciones" valor={postulaciones?.length ?? "—"} />
        <TarjetaResumen titulo="Últimas 24 horas" valor={ultimas24h} />
        <TarjetaResumen titulo="Cargo más solicitado" valor={porCargo[0]?.etiqueta ?? "—"} pequeno />
        <TarjetaResumen titulo="Región líder" valor={porRegion[0]?.etiqueta ?? "—"} pequeno />
      </div>

      {/* Barras por cargo / región */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BarrasDesglose titulo="Por cargo" datos={porCargo} maximo={maxCargo} />
        <BarrasDesglose titulo="Por región" datos={porRegion} maximo={maxRegion} />
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border border-borde bg-white">
        <div className="border-b border-borde px-6 py-4">
          <h2 className="font-condensed text-lg font-bold uppercase text-tinta">
            Postulaciones recientes
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-borde text-xs uppercase tracking-wide text-tinta/45">
                <th className="px-6 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">RUT</th>
                <th className="px-4 py-3 font-medium">Cargo</th>
                <th className="px-4 py-3 font-medium">Región</th>
                <th className="px-4 py-3 font-medium">Teléfono</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-6 py-3 font-medium">CV</th>
              </tr>
            </thead>
            <tbody>
              {(postulaciones ?? []).map((p) => (
                <tr key={p.id} className="border-b border-borde/60 last:border-b-0">
                  <td className="px-6 py-3 font-medium text-tinta">{p.nombreCompleto}</td>
                  <td className="px-4 py-3 text-tinta/70">{p.rut}</td>
                  <td className="px-4 py-3 text-tinta/70">{p.cargo}</td>
                  <td className="px-4 py-3 text-tinta/70">{p.region}</td>
                  <td className="px-4 py-3 text-tinta/70">{p.telefono}</td>
                  <td className="px-4 py-3 text-tinta/50">{formatearFecha(p.creadaEn)}</td>
                  <td className="px-6 py-3">
                    {p.cvUrl ? (
                      <a
                        href={p.cvUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-naranjo hover:underline"
                      >
                        Ver
                      </a>
                    ) : (
                      <span className="text-tinta/30">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {postulaciones && postulaciones.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-tinta/45">
                    Aún no hay postulaciones registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TarjetaResumen({
  titulo,
  valor,
  pequeno,
}: {
  titulo: string;
  valor: string | number;
  pequeno?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-borde bg-white p-4">
      <p className="text-xs font-medium text-tinta/50">{titulo}</p>
      <p
        className={`mt-1 font-condensed font-bold text-tinta ${pequeno ? "text-base" : "text-2xl"}`}
      >
        {valor}
      </p>
    </div>
  );
}

function BarrasDesglose({
  titulo,
  datos,
  maximo,
}: {
  titulo: string;
  datos: { etiqueta: string; total: number }[];
  maximo: number;
}) {
  return (
    <div className="rounded-2xl border border-borde bg-white p-5">
      <h3 className="mb-4 font-condensed text-sm font-bold uppercase text-tinta/70">{titulo}</h3>
      <div className="flex flex-col gap-3">
        {datos.length === 0 && <p className="text-sm text-tinta/40">Sin datos aún.</p>}
        {datos.map((d) => (
          <div key={d.etiqueta}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-tinta/75">{d.etiqueta}</span>
              <span className="text-tinta/45">{d.total}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-crema">
              <div
                className="h-full rounded-full bg-teal"
                style={{ width: `${Math.max(6, (d.total / maximo) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
