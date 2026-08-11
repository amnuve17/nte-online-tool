import { useState } from "react";
import { useTranslations } from "../i18n/LanguageContext.jsx";
import DrawRecap from "./DrawRecap.jsx";
import Header from "./Header.jsx";
import HexButton from "./HexButton.jsx";
import PageShell from "./PageShell.jsx";

export default function EstrazioneScreen({ bag, onMenuClick, onNavigate }) {
  const { t } = useTranslations();
  const [showConsequences, setShowConsequences] = useState(false);
  const {
    bagW,
    bagB,
    totalInBag,
    bagIsSecret,
    canDrawMore,
    drawn,
    draw,
    canRisk,
    risk,
    resetTest,
    complications,
  } = bag;

  const finished = !canDrawMore && drawn.length > 0;

  return (
    <PageShell onNavigate={onNavigate}>
      <Header
        variant="hero"
        step={t.estrazione.step}
        description={t.estrazione.description}
        onMenuClick={onMenuClick}
        onNavigate={onNavigate}
      />

      <div className="space-y-6 px-6 pb-10">
        <div className="border border-brand-rose/30 bg-brand-rose/15 py-4 text-center">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-rose">
            {t.estrazione.rimasti}
          </div>
          <div className="mt-1 text-4xl font-bold">{totalInBag}</div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-brand-rose/30 border border-brand-rose/30 bg-brand-rose/15 py-4 text-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-rose">
              {t.estrazione.bianchi}
            </div>
            <div className="mt-1 text-3xl font-bold">
              {bagIsSecret ? "?" : bagW}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-rose">
              {t.estrazione.neri}
            </div>
            <div className="mt-1 text-3xl font-bold">
              {bagIsSecret ? "?" : bagB}
            </div>
          </div>
        </div>

        <DrawRecap bag={bag} />

        <div className="flex justify-center pt-2">
          <HexButton
            label={t.estrazione.estrai}
            disabled={!canDrawMore}
            onClick={draw}
          />
        </div>

        {finished && (
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={risk}
                disabled={!canRisk}
                className="border border-brand-rose/40 bg-brand-rose/15 py-3 text-sm font-bold uppercase tracking-wide transition-all hover:bg-brand-rose/25 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
              >
                {t.estrazione.rischia}
              </button>
              <button
                type="button"
                onClick={resetTest}
                className="border border-brand-rose/40 bg-brand-rose/15 py-3 text-sm font-bold uppercase tracking-wide transition-all hover:bg-brand-rose/25 active:scale-[0.97]"
              >
                {t.estrazione.reimposta}
              </button>
            </div>

            <p className="font-brand-serif text-center text-xs italic text-brand-rose/90">
              {t.estrazione.rischiaWarning}
            </p>

            {complications > 0 && (
              <>
                <p className="font-brand-serif text-center text-xs text-zinc-300">
                  <span aria-hidden="true">ⓘ</span> {t.estrazione.infoPrefix}{" "}
                  <span className="underline decoration-dotted">
                    {t.estrazione.scegliConseguenza}
                  </span>
                  .
                </p>

                <button
                  type="button"
                  onClick={() => setShowConsequences((v) => !v)}
                  className="w-full border border-zinc-600 py-3 text-sm font-bold uppercase tracking-wide transition-all hover:border-white active:scale-[0.98]"
                >
                  {showConsequences
                    ? t.estrazione.nascondiConseguenze
                    : t.estrazione.vediConseguenze}
                </button>

                {showConsequences && (
                  <div className="space-y-2">
                    {t.consequences.map((c) => (
                      <details
                        key={c.title}
                        className="border border-zinc-700 bg-zinc-900/60 p-3"
                      >
                        <summary className="cursor-pointer font-semibold select-none">
                          {c.title}
                        </summary>
                        <div className="font-brand-serif mt-2 text-sm text-zinc-300">
                          {c.body}
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </>
            )}

            <button
              type="button"
              onClick={() => onNavigate("setup")}
              className="mx-auto block text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 underline decoration-dotted transition-transform hover:text-white active:scale-95"
            >
              {t.estrazione.tornaSetup}
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
}
