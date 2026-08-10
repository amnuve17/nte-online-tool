import { useTranslations } from "../i18n/LanguageContext.jsx";

const HEX_POINTS = "50,2 150,2 198,86.5 150,171 50,171 2,86.5";

export default function DrawSlot({ state }) {
  const { t } = useTranslations();
  const isSuccess = state === "success";
  const isComplication = state === "complication";

  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 200 173" className="absolute inset-0 h-full w-full">
        <polygon
          points={HEX_POINTS}
          fill={isSuccess ? "#ffffff" : "none"}
          stroke={isSuccess ? "none" : "#ffffff"}
          strokeOpacity={isComplication ? 1 : isSuccess ? 1 : 0.25}
          strokeWidth="4"
        />
      </svg>
      {(isSuccess || isComplication) && (
        <span
          className={
            "absolute inset-0 flex items-center justify-center text-lg font-bold " +
            (isSuccess ? "text-black" : "text-white")
          }
        >
          {isSuccess ? t.tokens.bianco : t.tokens.nero}
        </span>
      )}
    </div>
  );
}
