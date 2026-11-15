import type { Metadata } from "next";

const labels: Record<string, string> = {
  fifo: "FIFO",
  lru: "LRU",
  optimal: "Óptimo",
  clock: "Clock",
  lfu: "LFU",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ algoritmo: string }>;
}): Promise<Metadata> {
  const { algoritmo } = await params;
  return { title: `${labels[algoritmo] ?? "Algoritmo no encontrado"} | Memoria | OS Lab` };
}

export default function MemoryAlgorithmLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
