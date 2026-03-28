import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kanbanish",
  description: "A simple static Kanban roadmap board.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.className} bg-neutral-950 text-neutral-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
