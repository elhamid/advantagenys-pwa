"use client";

import { useEffect, useState } from "react";

type NoticeLocale = "en" | "es" | "fr";

const COPY: Record<NoticeLocale, { title: string; body: string }> = {
  en: {
    title: "Language and spelling",
    body: "You can use your browser translation to read this form. Type answers with English letters so our staff packet is usable. Legal names should match the passport or government ID spelling.",
  },
  es: {
    title: "Idioma y escritura",
    body: "Puede usar la traduccion de su navegador para leer este formulario. Escriba sus respuestas con letras en ingles para que nuestro equipo pueda procesarlas. Los nombres legales deben coincidir con el pasaporte o identificacion oficial.",
  },
  fr: {
    title: "Langue et orthographe",
    body: "Vous pouvez utiliser la traduction de votre navigateur pour lire ce formulaire. Saisissez les reponses avec des lettres anglaises afin que notre equipe puisse traiter le dossier. Les noms legaux doivent correspondre au passeport ou a la piece d'identite.",
  },
};

function detectNoticeLocale(): NoticeLocale {
  const languages = typeof navigator === "undefined" ? [] : navigator.languages.length > 0 ? navigator.languages : [navigator.language];
  const normalized = languages.map((language) => language.toLowerCase());
  if (normalized.some((language) => language.startsWith("es"))) return "es";
  if (normalized.some((language) => language.startsWith("fr"))) return "fr";
  return "en";
}

export function FormLanguageNotice() {
  const [locale, setLocale] = useState<NoticeLocale>("en");

  useEffect(() => {
    setLocale(detectNoticeLocale());
  }, []);

  const copy = COPY[locale];

  return (
    <div className="mb-5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3" translate="yes">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        {copy.title}
      </p>
      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
        {copy.body}
      </p>
    </div>
  );
}
