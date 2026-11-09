export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 17 L9 11 L13 15 L21 7" /><path d="M15 7h6v6" />
        </svg>
      </div>
      <div className="leading-none">
        <div className={`font-display text-lg font-semibold ${inverted ? "text-sidebar-accent-foreground" : "text-navy"}`}>TripWise</div>
        <div className={`mt-1 text-[10px] tracking-wide ${inverted ? "text-sidebar-foreground/70" : "text-muted-foreground"}`}>Travel smarter. Spend better.</div>
      </div>
    </div>
  );
}
