"use client";

import { useEffect, useState } from "react";

type NoticeLocale = "en" | "es" | "fr" | "hi" | "bn" | "zh" | "zhHant" | "ar" | "ur";

const COPY: Record<NoticeLocale, { title: string; body: string }> = {
  en: {
    title: "Language and spelling",
    body: "You can use your browser translation to read this form. Type answers with English letters so our staff packet is usable. Legal names should match the passport or government ID spelling.",
  },
  es: {
    title: "Idioma y escritura",
    body: "Puede usar la traducción de su navegador para leer este formulario. Escriba sus respuestas con letras en inglés para que nuestro equipo pueda procesarlas. Los nombres legales deben coincidir con el pasaporte o identificación oficial.",
  },
  fr: {
    title: "Langue et orthographe",
    body: "Vous pouvez utiliser la traduction de votre navigateur pour lire ce formulaire. Saisissez les réponses avec des lettres anglaises afin que notre équipe puisse traiter le dossier. Les noms légaux doivent correspondre au passeport ou à la pièce d'identité.",
  },
  hi: {
    title: "भाषा और वर्तनी",
    body: "इस फॉर्म को पढ़ने के लिए आप अपने ब्राउज़र का अनुवाद इस्तेमाल कर सकते हैं। जवाब अंग्रेजी अक्षरों में लिखें ताकि हमारी टीम आपका पैकेट प्रोसेस कर सके। कानूनी नाम पासपोर्ट या सरकारी ID की स्पेलिंग से मेल खाना चाहिए।",
  },
  bn: {
    title: "ভাষা ও বানান",
    body: "এই ফর্ম পড়তে আপনি ব্রাউজার অনুবাদ ব্যবহার করতে পারেন। উত্তর ইংরেজি অক্ষরে লিখুন যাতে আমাদের দল আপনার প্যাকেট প্রক্রিয়া করতে পারে। আইনি নাম পাসপোর্ট বা সরকারি ID-এর বানানের সঙ্গে মিলতে হবে।",
  },
  zh: {
    title: "语言和拼写",
    body: "您可以使用浏览器翻译来阅读此表格。请用英文字母填写答案，方便我们的团队处理。法定姓名应与护照或政府身份证件上的拼写一致。",
  },
  zhHant: {
    title: "語言和拼寫",
    body: "您可以使用瀏覽器翻譯來閱讀此表格。請用英文字母填寫答案，方便我們的團隊處理。法定姓名應與護照或政府身分證件上的拼寫一致。",
  },
  ar: {
    title: "اللغة والتهجئة",
    body: "يمكنك استخدام ترجمة المتصفح لقراءة هذا النموذج. اكتب الإجابات بحروف إنجليزية حتى يتمكن فريقنا من معالجة الملف. يجب أن يطابق الاسم القانوني تهجئة جواز السفر أو الهوية الحكومية.",
  },
  ur: {
    title: "زبان اور ہجے",
    body: "آپ یہ فارم پڑھنے کے لیے اپنے براؤزر کا ترجمہ استعمال کر سکتے ہیں۔ جواب انگریزی حروف میں لکھیں تاکہ ہماری ٹیم آپ کا پیکٹ پروسیس کر سکے۔ قانونی نام پاسپورٹ یا سرکاری ID کے ہجے کے مطابق ہونا چاہیے۔",
  },
};

function detectNoticeLocale(): NoticeLocale {
  const languages = typeof navigator === "undefined" ? [] : (navigator.languages?.length ?? 0) > 0 ? navigator.languages : [navigator.language];
  const normalized = languages.map((language) => language.toLowerCase());
  if (normalized.some((language) => language.startsWith("es"))) return "es";
  if (normalized.some((language) => language.startsWith("fr"))) return "fr";
  if (normalized.some((language) => language.startsWith("hi"))) return "hi";
  if (normalized.some((language) => language.startsWith("bn"))) return "bn";
  if (normalized.some((language) => language.startsWith("zh-hant") || language.startsWith("zh-tw") || language.startsWith("zh-hk") || language.startsWith("zh-mo"))) return "zhHant";
  if (normalized.some((language) => language.startsWith("zh"))) return "zh";
  if (normalized.some((language) => language.startsWith("ar"))) return "ar";
  if (normalized.some((language) => language.startsWith("ur"))) return "ur";
  return "en";
}

export function FormLanguageNotice() {
  const [locale, setLocale] = useState<NoticeLocale>("en");

  useEffect(() => {
    setLocale(detectNoticeLocale());
  }, []);

  const copy = COPY[locale];

  return (
    <div
      className="mb-5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
      dir={locale === "ar" || locale === "ur" ? "rtl" : "ltr"}
      translate="yes"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        {copy.title}
      </p>
      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
        {copy.body}
      </p>
    </div>
  );
}
