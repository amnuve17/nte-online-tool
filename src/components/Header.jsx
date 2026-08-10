import { useTranslations } from "../i18n/LanguageContext.jsx";

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export default function Header({
  variant = "plain",
  step,
  description,
  onMenuClick,
  onNavigate,
}) {
  const { t } = useTranslations();
  const bar = (
    <div className="flex items-center justify-between px-6 pt-6">
      <button
        type="button"
        onClick={() => onNavigate?.("landing")}
        className="font-display text-3xl uppercase tracking-tight"
      >
        {t.common.brand}
      </button>
      <button
        type="button"
        aria-label={t.common.openMenu}
        className="p-2"
        onClick={onMenuClick}
      >
        <MenuIcon />
      </button>
    </div>
  );

  if (variant !== "hero") {
    return <div className="pb-4">{bar}</div>;
  }

  return (
    <div>
      {bar}

      {step && (
        <div className="px-6 pb-8 pt-5">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-rose">
            {step}
          </p>
          {description && (
            <p className="font-brand-serif mt-2 text-sm leading-relaxed text-zinc-300/90">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
