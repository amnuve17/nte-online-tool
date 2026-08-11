export default function Stepper({ value, min, max, onChange, disabled = false }) {
  return (
    <div
      className={
        "flex h-16 items-center justify-between border border-zinc-700/60 bg-zinc-900/80 px-4" +
        (disabled ? " opacity-50" : "")
      }
    >
      <span className="text-2xl font-bold tabular-nums">{value}</span>
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          disabled={disabled || value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          aria-label="Aumenta"
          className="flex h-6 w-9 items-center justify-center rounded text-base font-bold text-brand-gold hover:text-brand-gold-light disabled:opacity-30"
        >
          +
        </button>
        <button
          type="button"
          disabled={disabled || value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label="Diminuisci"
          className="flex h-6 w-9 items-center justify-center rounded text-base font-bold text-brand-gold hover:text-brand-gold-light disabled:opacity-30"
        >
          −
        </button>
      </div>
    </div>
  );
}
