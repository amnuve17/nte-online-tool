import t from "../i18n/index.js";

const LINKS = [
  { id: "landing", label: t.nav.start },
  { id: "setup", label: t.nav.setup },
  { id: "estrazione", label: t.nav.estrazione },
  { id: "autori", label: t.nav.autori },
];

export default function NavMenu({ open, current, onNavigate, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label={t.common.closeMenu}
        onClick={onClose}
        className="absolute inset-0 bg-black/70"
      />
      <nav className="absolute right-0 top-0 flex h-full w-64 flex-col gap-1 border-l border-zinc-800 bg-black px-6 py-8 text-white">
        <button
          type="button"
          aria-label={t.common.closeMenu}
          onClick={onClose}
          className="mb-6 self-end p-2 text-2xl leading-none text-zinc-400 hover:text-white"
        >
          ×
        </button>
        {LINKS.map((link) => (
          <button
            key={link.id}
            type="button"
            onClick={() => onNavigate(link.id)}
            className={
              "font-display rounded-xl px-3 py-3 text-left text-xl uppercase tracking-wide transition-colors " +
              (current === link.id
                ? "text-brand-gold"
                : "text-white hover:text-brand-gold-light")
            }
          >
            {link.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
