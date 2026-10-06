import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "@fontsource/poppins/latin-600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskFlow",
  description: "Organize your tasks with TaskFlow.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
