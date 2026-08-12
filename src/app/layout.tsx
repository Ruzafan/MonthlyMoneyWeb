import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finanzas personales",
  description: "Controla tus gastos, ingresos y ahorro",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();
  const signedIn = Boolean(session?.user);

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="flex min-h-screen">
          {signedIn && <Sidebar />}
          <div className={`flex min-h-screen flex-1 flex-col ${signedIn ? "pb-16 md:pb-0" : ""}`}>
            {children}
          </div>
        </div>
        {signedIn && <MobileNav />}
      </body>
    </html>
  );
}
