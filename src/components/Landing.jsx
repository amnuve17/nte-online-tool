import Footer from "./Footer.jsx";
import HexButton from "./HexButton.jsx";
import HexField from "./HexField.jsx";
import { HERO_GRADIENT } from "../lib/theme.js";
import t from "../i18n/index.js";

export default function Landing({ onStart, onNavigate }) {
  return (
    <div className="min-h-screen w-full" style={{ backgroundImage: HERO_GRADIENT }}>
      <div className="relative mx-auto min-h-screen w-full max-w-120 overflow-hidden text-white">
        <HexField className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-linear-to-b from-black/15 via-transparent to-black/50" />

        <div className="relative z-10 flex min-h-screen flex-col">
          <div className="mx-auto flex w-full max-w-sm flex-1 flex-col px-7 pt-12 pb-24">
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

            <button
              type="button"
              className="font-brand-serif mx-auto mt-2 text-xs italic text-brand-gold-light/80 underline decoration-dotted underline-offset-2"
            >
              <span aria-hidden="true">ⓘ</span> {t.landing.helpLink}
            </button>

            <div className="mt-16 flex justify-center">
              <HexButton label={t.landing.start} onClick={onStart} />
            </div>
          </div>

          <Footer onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}
