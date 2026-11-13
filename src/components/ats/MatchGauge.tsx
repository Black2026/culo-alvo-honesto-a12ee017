import { cn } from "@/lib/utils";

interface MatchGaugeProps {
  score: number | null;
  className?: string;
}

/** Indicador circular em forma de alvo. Mostra "—" quando não há base para um percentual. */
export function MatchGauge({ score, className }: MatchGaugeProps) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const value = score ?? 0;
  const offset = circumference - (value / 100) * circumference;
  const tone = score === null ? "text-muted-foreground" : score >= 70 ? "text-success" : score >= 40 ? "text-primary" : "text-warning";

  return (
    <div className={cn("relative size-40 shrink-0", className)} role="img" aria-label={score === null ? "Match não calculado" : `Match estimado de ${score}%`}>
      <svg viewBox="0 0 128 128" className="size-full -rotate-90">
        <circle cx="64" cy="64" r="60" className="fill-primary-soft/40" />
        <circle cx="64" cy="64" r="36" className="fill-card" />
        <circle cx="64" cy="64" r={radius} fill="none" strokeWidth="10" className="stroke-muted" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("stroke-current transition-[stroke-dashoffset] duration-700 ease-out", tone)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-4xl font-extrabold tracking-tight tabular-nums", tone)}>
          {score === null ? "—" : `${score}%`}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">estimado</span>
      </div>
    </div>
  );
}
