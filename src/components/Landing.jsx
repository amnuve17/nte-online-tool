import Footer from "./Footer.jsx";
import HexButton from "./HexButton.jsx";
import HexField from "./HexField.jsx";
import { HERO_GRADIENT } from "../lib/theme.js";
import { useTranslations } from "../i18n/LanguageContext.jsx";

export default function Landing({ onStart, onNavigate }) {
  const { t } = useTranslations();
  return (
    <div className="min-h-dvh w-full" style={{ backgroundImage: HERO_GRADIENT }}>
      <div className="relative mx-auto min-h-dvh w-full max-w-120 overflow-hidden text-white">
        <HexField className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-linear-to-b from-black/15 via-transparent to-black/50" />

        <div className="relative z-10 flex min-h-dvh flex-col">
          <div className="mx-auto flex w-full max-w-sm flex-col px-7 pt-12 pb-10">
            <header className="text-center">
              <h1 className="font-display text-5xl uppercase leading-none tracking-tight">
                {t.common.brand}
              </h1>
              <p className="font-display mt-1.5 text-lg uppercase tracking-[0.35em] text-brand-gold">
                {t.landing.subtitle}
              </p>
            </header>

            <p className="font-brand-serif mt-6 text-center text-sm leading-relaxed text-zinc-200/90">
              {t.landing.description}
            </p>

            <a
              href="https://www.msedizioni.it/prodotto/not-the-end/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-brand-serif mx-auto mt-2 text-xs italic text-brand-gold-light/80 underline decoration-dotted underline-offset-2"
            >
              <span aria-hidden="true" className="not-italic">ⓘ</span>{" "}
              {t.landing.helpLink}
            </a>

            <div className="mt-12 flex flex-col items-center gap-12">
              <div className="flex flex-col items-center gap-4">
                <HexButton label={t.landing.quickMatch} onClick={onStart} />
                <p className="font-brand-serif max-w-60 text-center leading-relaxed">
                  <span className="block text-sm font-semibold text-white">
                    {t.landing.quickMatchHighlight}
                  </span>
                  <span className="mt-1 block text-xs text-zinc-300/90">
                    {t.landing.quickMatchDescription}
                  </span>
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <HexButton
                  label={t.landing.multiplayer}
                  onClick={() => onNavigate("stanza")}
                />
                <p className="font-brand-serif max-w-60 text-center leading-relaxed">
                  <span className="block text-sm font-semibold text-white">
                    {t.landing.multiplayerHighlight}
                  </span>
                  <span className="mt-1 block text-xs text-zinc-300/90">
                    {t.landing.multiplayerDescription}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <Footer onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}
