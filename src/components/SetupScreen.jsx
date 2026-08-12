import { useTranslations } from "../i18n/LanguageContext.jsx";
import Header from "./Header.jsx";
import HexButton from "./HexButton.jsx";
import PageShell from "./PageShell.jsx";
import Select from "./Select.jsx";
import Stepper from "./Stepper.jsx";

export default function SetupScreen({ bag, onMenuClick, onEstrai, onNavigate }) {
  const { t } = useTranslations();
  const {
    difficultyOptions,
    traitsInPlay,
    setTraitsInPlay,
    difficultyId,
    setDifficultyId,
    blacksOverride,
    setBlacksOverride,
    maxDraw,
    setMaxDraw,
    adrenalineActive,
    setAdrenalineActive,
    confusionNext,
    setConfusionNext,
    inputWhites,
    inputBlacks,
    newTest,
    resetAll,
  } = bag;

  const selectOptions = difficultyOptions.map((d) => ({
    value: d.id,
    label: `${d.label} (${d.blacks} ${t.difficulty.neriSuffix})`,
  }));

  function handleEstrai() {
    newTest();
    onEstrai();
  }

  return (
    <PageShell onNavigate={onNavigate}>
      <Header
        variant="hero"
        step={t.setup.step}
        description={t.setup.description}
        onMenuClick={onMenuClick}
        onNavigate={onNavigate}
      />

      <div className="space-y-6 px-6 pb-10">
        <div className="space-y-2">
          <div className="text-sm font-bold uppercase tracking-wide">
            {t.setup.difficolta}
          </div>
          <Select
            value={difficultyId}
            onChange={setDifficultyId}
            options={selectOptions}
            placeholder={t.setup.selectPlaceholder}
          />
        </div>

        <div className="space-y-2">
          <div className="text-sm font-bold uppercase tracking-wide">
            {t.setup.trattiInGioco}
          </div>
          <Stepper
            value={traitsInPlay}
            min={0}
            max={12}
            onChange={setTraitsInPlay}
          />
          <div className="font-brand-serif text-xs italic text-brand-rose/90">
            {t.setup.trattiHint}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-bold uppercase tracking-wide">
            {t.setup.overrideNeri}
          </div>
          <Stepper
            value={blacksOverride}
            min={0}
            max={99}
            onChange={setBlacksOverride}
          />
          <div className="font-brand-serif text-xs italic text-brand-rose/90">
            {t.setup.overrideHint}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-bold uppercase tracking-wide">
            {t.setup.maxEstrazioni}
          </div>
          <Stepper
            value={adrenalineActive ? 4 : maxDraw}
            min={1}
            max={4}
            onChange={setMaxDraw}
            disabled={adrenalineActive}
          />
          <div className="font-brand-serif text-xs italic text-brand-rose/90">
            {t.setup.maxEstrazioniHint}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-bold uppercase tracking-wide">
            {t.setup.adrenalina}
          </div>
          <label className="flex items-center gap-3 select-none">
            <input
              type="checkbox"
              checked={adrenalineActive}
              onChange={(e) => setAdrenalineActive(e.target.checked)}
              className="h-5 w-5 shrink-0 rounded border-zinc-600 bg-zinc-900 accent-brand-gold"
            />
            <span className="font-brand-serif text-sm italic text-zinc-300">
              {t.setup.adrenalinaLabel}
            </span>
          </label>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-bold uppercase tracking-wide">
            {t.setup.confusione}
          </div>
          <label className="flex items-center gap-3 select-none">
            <input
              type="checkbox"
              checked={confusionNext}
              onChange={(e) => setConfusionNext(e.target.checked)}
              className="h-5 w-5 shrink-0 rounded border-zinc-600 bg-zinc-900 accent-brand-gold"
            />
            <span className="font-brand-serif text-sm italic text-zinc-300">
              {t.setup.confusioneLabel}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-2 divide-x divide-brand-rose/30 border border-brand-rose/30 bg-brand-rose/15 py-4 text-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-rose">
              {t.setup.tratti}
            </div>
            <div className="mt-1 text-3xl font-bold">{inputWhites}</div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-rose">
              {t.setup.neri}
            </div>
            <div className="mt-1 text-3xl font-bold">{inputBlacks}</div>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <HexButton label={t.setup.estrai} onClick={handleEstrai} />
        </div>

        <button
          type="button"
          onClick={resetAll}
          className="mx-auto block text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 transition-transform hover:text-white active:scale-95"
        >
          {t.setup.reset}
        </button>
      </div>
    </PageShell>
  );
}
