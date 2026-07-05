import type { ReactNode } from "react";

export const inputBase =
  "w-full rounded-lg border border-borde bg-white px-3.5 py-2.5 text-[15px] text-tinta placeholder:text-tinta/35 outline-none transition focus:border-naranjo focus:ring-2 focus:ring-naranjo/15 disabled:cursor-not-allowed disabled:bg-black/5";

export function Campo({
  label,
  error,
  required,
  hint,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-tinta/85">
        {label}
        {required && <span className="ml-1 text-naranjo">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-tinta/45">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs font-medium text-red-600">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 6a1 1 0 112 0v4a1 1 0 11-2 0V6zm1 8a1.25 1.25 0 100 2.5A1.25 1.25 0 0010 14z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export function Seccion({
  numero,
  total,
  titulo,
  descripcion,
  children,
}: {
  numero: string;
  total: string;
  titulo: string;
  descripcion?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-borde px-6 py-8 last:border-b-0 sm:px-10">
      <div className="mb-6 flex items-baseline gap-3">
        <span className="font-condensed text-sm font-semibold tracking-wide text-naranjo">
          {numero} / {total}
        </span>
        <h2 className="font-condensed text-xl font-bold uppercase tracking-tight text-tinta sm:text-2xl">
          {titulo}
        </h2>
      </div>
      {descripcion && <p className="mb-6 -mt-4 text-sm text-tinta/60">{descripcion}</p>}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function IconoCandado({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 10.5V8a6 6 0 1112 0v2.5M5 10.5h14a1 1 0 011 1V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-8.5a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
