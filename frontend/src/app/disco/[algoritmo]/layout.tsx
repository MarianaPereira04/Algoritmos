import type { Metadata } from "next";

const labels: Record<string, string> = {
  fcfs: "FCFS",
  sstf: "SSTF",
  scan: "SCAN",
  cscan: "C-SCAN",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ algoritmo: string }>;
}): Promise<Metadata> {
  const { algoritmo } = await params;
  return { title: `${labels[algoritmo] ?? "Algoritmo no encontrado"} | Disco | OS Lab` };
}

export default function DiskAlgorithmLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
