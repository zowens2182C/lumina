import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumina OS",
  description: "Your local command center for ideas, agents, and momentum.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
