const labels: Record<string, string> = {
  fifo: "FIFO",
  lru: "LRU",
  optimal: "Óptimo",
  clock: "Clock",
  lfu: "LFU",
};

export default async function MemoryAlgorithmPage({
  params,
}: {
  params: Promise<{ algoritmo: string }>;
}) {
  const { algoritmo } = await params;
  return <h1>{labels[algoritmo] ?? algoritmo}</h1>;
}
