"use client";

import { useEffect } from "react";

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Hide header, footer, and chat widget in kiosk mode
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    const chatWidgets = document.querySelectorAll(".fixed.bottom-6.right-6");

    if (header) header.style.display = "none";
    if (footer) footer.style.display = "none";
    chatWidgets.forEach((el) => {
      (el as HTMLElement).style.display = "none";
    });

    return () => {
      if (header) header.style.display = "";
      if (footer) footer.style.display = "";
      chatWidgets.forEach((el) => {
        (el as HTMLElement).style.display = "";
      });
    };
  }, []);

  return <>{children}</>;
}
