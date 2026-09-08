import type { Metadata } from "next";
import "./globals.css";
import { UporaStoreProvider } from "@/lib/store/useUporaStore";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

export const metadata: Metadata = {
  title: "UPORA — Learn. Work. Earn. Grow.",
  description:
    "A global economic mobility platform connecting practical skill verification, legitimate client work, and financial progress. Make opportunity accessible to anyone, anywhere.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-canvas-dark text-text-primary antialiased flex flex-col selection:bg-brand-growth selection:text-canvas-dark">
        <UporaStoreProvider>
          <Header />
          <main className="flex-1 pb-20 lg:pb-12">{children}</main>
          <MobileNav />
        </UporaStoreProvider>
      </body>
    </html>
  );
}
