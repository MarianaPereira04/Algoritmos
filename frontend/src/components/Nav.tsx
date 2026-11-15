"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const sections = [
  {
    title: "Procesos",
    base: "/procesos",
    items: [{ label: "Round Robin", href: "/procesos/round-robin" }],
  },
  {
    title: "Memoria",
    base: "/memoria",
    items: [
      { label: "FIFO", href: "/memoria/fifo" },
      { label: "LRU", href: "/memoria/lru" },
      { label: "Óptimo", href: "/memoria/optimal" },
      { label: "Clock", href: "/memoria/clock" },
      { label: "LFU", href: "/memoria/lfu" },
    ],
  },
  {
    title: "Disco",
    base: "/disco",
    items: [
      { label: "FCFS", href: "/disco/fcfs" },
      { label: "SSTF", href: "/disco/sstf" },
      { label: "SCAN", href: "/disco/scan" },
      { label: "C-SCAN", href: "/disco/cscan" },
    ],
  },
];

export function Nav() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link className="brand" href="/" aria-label="OS Lab, inicio">
          <span className="brand-mark" aria-hidden="true">OS</span>
          <span>OS Lab</span>
        </Link>
        <nav
          className="nav-menus"
          aria-label="Algoritmos"
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpenMenu(null);
          }}
        >
          {sections.map((section) => (
            <details
              className="nav-menu"
              key={section.title}
              open={openMenu === section.title}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setOpenMenu(section.title);
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === "mouse") setOpenMenu(null);
              }}
            >
              <summary
                className={pathname.startsWith(section.base) ? "is-active" : undefined}
                aria-haspopup="true"
                aria-expanded={openMenu === section.title}
                onClick={(event) => {
                  event.preventDefault();
                  setOpenMenu((current) => current === section.title ? null : section.title);
                }}
              >
                {section.title}
              </summary>
              <div className="nav-dropdown">
                {section.items.map((item) => (
                  <Link
                    className="nav-link"
                    href={item.href}
                    key={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    onClick={() => setOpenMenu(null)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </details>
          ))}
        </nav>
      </div>
    </header>
  );
}
