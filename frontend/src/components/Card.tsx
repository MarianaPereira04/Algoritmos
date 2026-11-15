import type { ReactNode } from "react";

type CardProps = {
  title: string;
  description: string;
  accent: "proceso" | "memoria" | "disco";
  number: string;
  icon: string;
  children: ReactNode;
};

export function Card({ title, description, accent, number, icon, children }: CardProps) {
  return (
    <article className={`card card--${accent}`}>
      <div className="card-topline">
        <span className="card-number">{number}</span>
        <span className="card-icon" aria-hidden="true">{icon}</span>
      </div>
      <h3>{title}</h3>
      <p className="card-description">{description}</p>
      {children}
    </article>
  );
}
