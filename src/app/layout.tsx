import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Runtime Notes — A personal software wiki",
  description: "A personal hobby wiki collecting sourced notes on Python, Lua, Bash, Ruby, shells, compilers, and runtimes.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
