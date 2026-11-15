import type { Metadata } from "next";

export const metadata: Metadata = { title: "Round Robin | OS Lab" };

export default function RoundRobinLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
