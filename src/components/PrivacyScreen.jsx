import { useTranslations } from "../i18n/LanguageContext.jsx";
import Header from "./Header.jsx";
import PageShell from "./PageShell.jsx";

export default function PrivacyScreen({ onMenuClick, onNavigate }) {
  const { t } = useTranslations();

  return (
    <PageShell onNavigate={onNavigate}>
      <Header variant="plain" onMenuClick={onMenuClick} onNavigate={onNavigate} />

      <div className="space-y-8 px-6 pb-10">
        <div className="space-y-2">
          <h2 className="font-display text-2xl uppercase tracking-tight">
            {t.privacy.title}
          </h2>
          <p className="font-brand-serif text-xs italic text-zinc-400">
            {t.privacy.updated}
          </p>
        </div>

        <p className="font-brand-serif text-sm leading-relaxed text-zinc-300/90">
          {t.privacy.intro}
        </p>

        <div className="space-y-6">
          {t.privacy.sections.map((s) => (
            <div key={s.title} className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wide text-brand-gold">
                {s.title}
              </h3>
              <p className="font-brand-serif text-sm leading-relaxed text-zinc-300/90">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
