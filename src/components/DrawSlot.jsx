import { useId } from "react";
import { useTranslations } from "../i18n/LanguageContext.jsx";
import { useTokenImages } from "../context/TokenImagesContext.jsx";

const HEX_POINTS = "50,2 150,2 198,86.5 150,171 50,171 2,86.5";

export default function DrawSlot({ state }) {
  const { t } = useTranslations();
  const { images } = useTokenImages();
  const clipId = useId();
  const isSuccess = state === "success";
  const isComplication = state === "complication";
  const customImage = isSuccess ? images.white : isComplication ? images.black : null;

  return (
    <div
      className={
        "relative h-16 w-16 shrink-0" +
        (isSuccess || isComplication
          ? " animate-[token-reveal_450ms_ease-out]"
          : "")
      }
    >
      <svg viewBox="0 0 200 173" className="absolute inset-0 h-full w-full">
        {customImage && (
          <>
            <clipPath id={clipId}>
              <polygon points={HEX_POINTS} />
            </clipPath>
            <image
              href={customImage}
              x="0"
              y="0"
              width="200"
              height="173"
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#${clipId})`}
            />
          </>
        )}
        <polygon
          points={HEX_POINTS}
          fill={customImage ? "none" : isSuccess ? "currentColor" : "none"}
          stroke={customImage ? "#ffffff" : isSuccess ? "none" : "currentColor"}
          strokeOpacity={isComplication || customImage ? 1 : isSuccess ? 1 : 0.25}
          strokeWidth="4"
          className={
            customImage
              ? ""
              : isSuccess
                ? "text-token-white"
                : isComplication
                  ? "text-token-black"
                  : "text-white"
          }
        />
      </svg>
      {(isSuccess || isComplication) && !customImage && (
        <span
          className={
            "absolute inset-0 flex items-center justify-center text-lg font-bold " +
            (isSuccess ? "text-token-white-text" : "text-token-black")
          }
        >
          {isSuccess ? t.tokens.bianco : t.tokens.nero}
        </span>
      )}
    </div>
  );
}
