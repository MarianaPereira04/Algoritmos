const labels: Record<string, string> = {
  fcfs: "FCFS",
  sstf: "SSTF",
  scan: "SCAN",
  cscan: "C-SCAN",
};

export default async function DiskAlgorithmPage({
  params,
}: {
  params: Promise<{ algoritmo: string }>;
}) {
  const { algoritmo } = await params;
  return <h1>{labels[algoritmo] ?? algoritmo}</h1>;
}
