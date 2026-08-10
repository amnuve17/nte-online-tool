export default function HexButton({ label, onClick, disabled = false, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative flex h-44 w-52 items-center justify-center ${className}`}
    >
      <svg viewBox="0 0 200 173" className="absolute inset-0 h-full w-full">
        <polygon
          points="50,2 150,2 198,86.5 150,171 50,171 2,86.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={
            disabled
              ? "text-zinc-600"
              : "text-white/90 transition-colors group-hover:text-white"
          }
        />
      </svg>
      <span
        className={
          "font-display relative z-10 text-2xl tracking-[0.2em] transition-colors " +
          (disabled
            ? "text-zinc-500"
            : "text-brand-gold group-hover:text-brand-gold-light")
        }
      >
        {label}
      </span>
    </button>
  );
}
