import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { MouseMoveEffect } from "@/components/mouse-move-effect";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Interact",
  description: "Effortless real-world utility",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <MouseMoveEffect />
          <ThemeSwitcher />
          {children}
        </Providers>
      </body>
    </html>
  );
}
