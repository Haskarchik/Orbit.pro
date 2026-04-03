import type { Metadata } from "next";
import { Language } from "@/lib/translations";

export const metadata: Metadata = {
  title: "Orbit Pro | Habit Architecture & Financial Discipline",
  description: "Next-generation ritual tracking and personal finance hub for high achievers.",
};

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'ua' }];
}

import { DashboardProvider } from "@/context/DashboardContext";
import DashboardLayout from "@/components/DashboardLayout";

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang: langParam } = await params;
  const lang = langParam as Language;
  return (
    <DashboardProvider lang={lang}>
        <DashboardLayout lang={lang}>
            {children}
        </DashboardLayout>
    </DashboardProvider>
  );
}
