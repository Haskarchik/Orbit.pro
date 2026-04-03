import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata = {
  title: "Orbit Pro | Habit Architecture & Financial Discipline",
  description: "Next-generation ritual tracking and personal finance hub for high achievers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ua">
      <body className={inter.className + " antialiased"}>
        {children}
      </body>
    </html>
  );
}
