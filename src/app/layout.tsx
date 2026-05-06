import "@/css/style.css";

import { Sidebar } from "@/components/Layouts/sidebar";

import { Header } from "@/components/Layouts/header";
import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";
import { Tajawal } from "next/font/google";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | AdventureWorks Analytics",
    default: "AdventureWorks Analytics — لوحة التحكم",
  },
  description:
    "لوحة تحكم تحليلية شاملة لبيانات AdventureWorks — المبيعات، المنتجات، العملاء والمناطق الجغرافية.",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${tajawal.variable} font-[family-name:var(--font-tajawal)] bg-surface-base text-content`}>
        <Providers>
          <NextTopLoader color="#00f2fe" showSpinner={false} height={3} />

          <div className="flex min-h-screen">
            <Sidebar />

            <div className="flex w-full min-w-0 flex-col bg-surface-base">
              <Header />

              <main className="relative z-10 mx-auto w-full max-w-screen-2xl flex-1 p-6 md:p-8 2xl:p-12">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
