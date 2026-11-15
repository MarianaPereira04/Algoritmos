import Link from "next/link";
import { Card } from "@/components/Card";

const groups = [
  {
    name: "Procesos",
    accent: "proceso" as const,
    first: { label: "Round Robin", href: "/procesos/round-robin" },
    algorithms: [{ label: "Round Robin", href: "/procesos/round-robin" }],
  },
  {
    name: "Memoria",
    accent: "memoria" as const,
    first: { label: "FIFO", href: "/memoria/fifo" },
    algorithms: [
      { label: "FIFO", href: "/memoria/fifo" },
      { label: "LRU", href: "/memoria/lru" },
      { label: "Óptimo", href: "/memoria/optimal" },
      { label: "Clock", href: "/memoria/clock" },
      { label: "LFU", href: "/memoria/lfu" },
    ],
  },
  {
    name: "Disco",
    accent: "disco" as const,
    first: { label: "FCFS", href: "/disco/fcfs" },
    algorithms: [
      { label: "FCFS", href: "/disco/fcfs" },
      { label: "SSTF", href: "/disco/sstf" },
      { label: "SCAN", href: "/disco/scan" },
      { label: "C-SCAN", href: "/disco/cscan" },
    ],
  },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Laboratorio digital · Sistemas operativos</p>
          <h1>OS Lab – Laboratorio de algoritmos de Sistemas Operativos</h1>
          <p className="hero-copy">
            Explora cómo se organizan los procesos, la memoria y el disco mediante
            simulaciones paso a paso.
          </p>
        </div>
      </section>

      <div className="section-heading">
        <h2>Elige un laboratorio</h2>
        <p>Una colección clara para aprender haciendo.</p>
      </div>

      <section className="cards-grid" aria-label="Laboratorios disponibles">
        {groups.map((group, index) => (
          <Card
            accent={group.accent}
            description={
              group.name === "Procesos"
                ? "Observa la planificación y los turnos que recibe cada proceso."
                : group.name === "Memoria"
                  ? "Compara cómo cada política administra los marcos de memoria."
                  : "Sigue el movimiento de la cabeza al atender las solicitudes."
            }
            icon={group.name === "Procesos" ? "↻" : group.name === "Memoria" ? "▦" : "↔"}
            key={group.name}
            number={`0${index + 1}`}
            title={group.name}
          >
            <Link className="card-primary" href={group.first.href}>
              Explorar {group.first.label} <span aria-hidden="true">→</span>
            </Link>
            <ul className="algorithm-list" aria-label={`Algoritmos de ${group.name.toLowerCase()}`}>
              {group.algorithms.map((algorithm) => (
                <li key={algorithm.href}>
                  <Link href={algorithm.href}>{algorithm.label}</Link>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </section>
    </>
  );
}
