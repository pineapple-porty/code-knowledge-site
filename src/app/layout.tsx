import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Runtime Notes — Software curiosities",
  description: "A personal hobby wiki collecting interesting details about Python, Lua, bytecode, and runtimes.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
