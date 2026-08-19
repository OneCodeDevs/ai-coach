import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { chakraPetch, ibmPlexSans, jetbrainsMono } from "@/lib/fonts";
import { FOCUS_COOKIE } from "@/lib/constants";
import { AppShell } from "@/components/layout/app-shell";
import { listKapitel } from "@/lib/content/loader";
import { getCompletedLessons } from "@/lib/db/queries";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Coach",
    template: "%s · AI Coach",
  },
  description:
    "Lernplattform für Agentic Coding, MCP und AI-Engineering bei OneCode.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0612",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const focusMode = cookieStore.get(FOCUS_COOKIE)?.value === "1";
  const [kapitel, completed] = await Promise.all([
    listKapitel(),
    Promise.resolve(getCompletedLessons()),
  ]);
  const lessonTotal = kapitel.reduce((sum, item) => sum + item.lessons.length, 0);

  return (
    <html
      lang="de"
      className={`${chakraPetch.variable} ${ibmPlexSans.variable} ${jetbrainsMono.variable} ${focusMode ? "focus-mode" : ""}`}
    >
      <body className="font-sans antialiased">
        <AppShell
          kapitel={kapitel}
          focusMode={focusMode}
          progress={{ done: completed.length, total: lessonTotal }}
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
