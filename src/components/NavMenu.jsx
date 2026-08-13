import { useTranslations } from "../i18n/LanguageContext.jsx";

const LANGUAGES = [
  { code: "it", label: "IT" },
  { code: "en", label: "EN" },
];

// La stanza multiplayer richiede il server PartyKit pubblicato su un dominio
// proprio (bloccato per ora dall'attesa nameserver di 5 giorni su Netlify).
// Rimetti a true quando il deploy pubblico è pronto.
const ROOMS_AVAILABLE = false;

export default function NavMenu({ open, current, onNavigate, onClose }) {
  const { t, language, setLanguage } = useTranslations();

  if (!open) return null;

  const links = [
    { id: "landing", label: t.nav.start },
    { id: "setup", label: t.nav.setup },
    { id: "estrazione", label: t.nav.estrazione },
    { id: "stanza", label: t.nav.stanza, disabled: !ROOMS_AVAILABLE },
    { id: "impostazioni", label: t.nav.impostazioni },
    { id: "autori", label: t.nav.autori },
  ];

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
          className="mb-6 self-end p-2 text-2xl leading-none text-zinc-400 transition-transform hover:text-white active:scale-90"
        >
          ×
        </button>
        {links.map((link) => (
          <button
            key={link.id}
            type="button"
            disabled={link.disabled}
            onClick={() => onNavigate(link.id)}
            className={
              "font-display rounded-xl px-3 py-3 text-left text-xl uppercase tracking-wide transition-all " +
              (link.disabled
                ? "text-zinc-600"
                : "active:scale-[0.97] " +
                  (current === link.id
                    ? "text-brand-gold"
                    : "text-white hover:text-brand-gold-light"))
            }
          >
            {link.label}
            {link.disabled && (
              <span className="ml-2 align-middle text-[10px] normal-case tracking-normal text-zinc-500">
                {t.stanza.comingSoon}
              </span>
            )}
          </button>
        ))}

        <div className="mt-auto flex items-center gap-2 border-t border-zinc-800 pt-6">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code)}
              className={
                "font-display rounded-lg border px-3 py-1.5 text-sm tracking-wide transition-all active:scale-95 " +
                (language === l.code
                  ? "border-brand-gold text-brand-gold"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white")
              }
            >
              {l.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
