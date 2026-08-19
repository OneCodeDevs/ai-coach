import { cn } from "@/lib/cn";

type EqualizerProps = {
  total: number;
  done: number;
  className?: string;
};

export function Equalizer({ total, done, className }: EqualizerProps) {
  const bars = Math.max(total, 1);
  return (
    <div
      className={cn("equalizer", className)}
      role="img"
      aria-label={`${done} von ${total} Lerneinheiten abgeschlossen`}
    >
      {Array.from({ length: bars }, (_, index) => (
        <span
          key={index}
          className={index < done ? "on" : undefined}
          style={{ height: `${10 + ((index * 7) % 18)}px` }}
        />
      ))}
    </div>
  );
}
