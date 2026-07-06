"use client";

import { useEffect, useState } from "react";

export default function BotonSubir() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const alScrollear = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", alScrollear, { passive: true });
    alScrollear();
    return () => window.removeEventListener("scroll", alScrollear);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Volver arriba"
      className={`fixed bottom-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-borde bg-white/90 text-tinta/45 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-naranjo/40 hover:text-naranjo sm:bottom-6 sm:right-6 ${
        visible ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-2"
      }`}
    >
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
        <path
          d="M10 15V5m0 0l-5 5m5-5l5 5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
