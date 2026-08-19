type MerksatzProps = {
  children: React.ReactNode;
};

export function Merksatz({ children }: MerksatzProps) {
  return (
    <aside className="my-6 rounded-lg border border-neon-lime/40 bg-bg-elevated p-4">
      <p className="font-display text-xs uppercase tracking-[0.18em] text-neon-lime">
        Merksatz
      </p>
      <div className="mt-2">{children}</div>
    </aside>
  );
}
