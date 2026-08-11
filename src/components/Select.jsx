import { useEffect, useRef, useState } from "react";

export default function Select({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-16 w-full items-center justify-between border border-zinc-700/60 bg-zinc-900/80 px-4 text-left text-lg font-semibold outline-none transition-transform active:scale-[0.98] focus:border-brand-gold"
      >
        <span className={selected ? "text-white" : "text-zinc-500"}>
          {selected ? selected.label : placeholder}
        </span>
        <span
          className={`text-brand-gold transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden border border-zinc-700/60 bg-zinc-900 shadow-lg shadow-black/60">
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={
                  "block w-full px-4 py-3 text-left text-sm transition-all active:scale-[0.98] " +
                  (o.value === value
                    ? "bg-brand-gold/15 text-brand-gold"
                    : "text-zinc-200 hover:bg-zinc-800")
                }
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
