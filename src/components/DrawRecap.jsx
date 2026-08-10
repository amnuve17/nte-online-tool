import { useTranslations } from "../i18n/LanguageContext.jsx";
import DrawSlot from "./DrawSlot.jsx";

export default function DrawRecap({ bag }) {
  const { t } = useTranslations();
  const { drawn, effectiveMaxDraw, drawnW, complications } = bag;

  const slots = Array.from({ length: effectiveMaxDraw }, (_, i) => {
    const token = drawn[i];
    if (token === "W") return "success";
    if (token === "B") return "complication";
    return "empty";
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-center gap-3">
        {slots.map((s, i) => (
          <DrawSlot key={i} state={s} />
        ))}
      </div>

      <p className="text-center text-lg font-bold uppercase tracking-wide">
        {t.estrazione.pescati}{" "}
        <span className="text-brand-rose">{drawn.length}</span>{" "}
        {t.estrazione.di} {effectiveMaxDraw}
      </p>

      <div className="grid grid-cols-2 divide-x divide-brand-rose/30 border border-brand-rose/30 bg-brand-rose/15 py-4 text-center">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-rose">
            {t.estrazione.successi}
          </div>
          <div className="mt-1 text-3xl font-bold">{drawnW}</div>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-rose">
            {t.estrazione.neri}
          </div>
          <div className="mt-1 text-3xl font-bold">{complications}</div>
        </div>
      </div>
    </div>
  );
}
