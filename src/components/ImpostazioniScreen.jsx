import { useId, useRef } from "react";
import { useTranslations } from "../i18n/LanguageContext.jsx";
import { useTokenImages } from "../context/TokenImagesContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { resizeImageToDataUrl } from "../lib/resizeImage.js";
import { THEMES } from "../lib/theme.js";
import Header from "./Header.jsx";
import PageShell from "./PageShell.jsx";

const HEX_POINTS = "50,2 150,2 198,86.5 150,171 50,171 2,86.5";

function ThemePicker() {
  const { t } = useTranslations();
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-5 gap-3">
      {THEMES.map(({ id, swatch }) => {
        const active = theme === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            aria-label={t.impostazioni.themes[id]}
            aria-pressed={active}
            className={
              "flex flex-col items-center gap-1.5 transition-transform active:scale-95"
            }
          >
            <span
              style={{
                backgroundImage: `linear-gradient(135deg, ${swatch[0]} 50%, ${swatch[1]} 50%)`,
              }}
              className={
                "h-10 w-10 outline outline-2 outline-offset-2 transition-all " +
                (active ? "outline-white" : "outline-transparent")
              }
            />
            <span
              className={
                "text-center text-[10px] leading-tight " +
                (active ? "text-white" : "text-zinc-400")
              }
            >
              {t.impostazioni.themes[id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function TokenImageField({ type, label }) {
  const { t } = useTranslations();
  const { images, setTokenImage, clearTokenImage } = useTokenImages();
  const inputRef = useRef(null);
  const clipId = useId();
  const current = images[type];

  async function handleChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const dataUrl = await resizeImageToDataUrl(file);
    setTokenImage(type, dataUrl);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-16 w-16 shrink-0">
        <svg viewBox="0 0 200 173" className="absolute inset-0 h-full w-full">
          {current && (
            <>
              <clipPath id={clipId}>
                <polygon points={HEX_POINTS} />
              </clipPath>
              <image
                href={current}
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
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-zinc-600"
          />
        </svg>
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="text-sm font-bold uppercase tracking-wide">
          {label}
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs italic text-brand-gold underline decoration-dotted transition-transform active:scale-95"
          >
            {t.impostazioni.chooseImage}
          </button>
          {current && (
            <button
              type="button"
              onClick={() => clearTokenImage(type)}
              className="text-xs italic text-zinc-400 underline decoration-dotted transition-transform hover:text-white active:scale-95"
            >
              {t.impostazioni.removeImage}
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

export default function ImpostazioniScreen({ onMenuClick, onNavigate }) {
  const { t } = useTranslations();

  return (
    <PageShell onNavigate={onNavigate}>
      <Header variant="plain" onMenuClick={onMenuClick} onNavigate={onNavigate} />

      <div className="space-y-8 px-6 pb-10">
        <div className="space-y-4">
          <h2 className="font-display text-2xl uppercase tracking-tight">
            {t.impostazioni.title}
          </h2>
          <p className="font-brand-serif text-sm leading-relaxed text-zinc-300/90">
            {t.impostazioni.description}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm font-bold uppercase tracking-wide">
              {t.impostazioni.tokenCustomization}
            </div>
            <p className="font-brand-serif mt-1 text-xs italic text-brand-rose/90">
              {t.impostazioni.tokenCustomizationHint}
            </p>
            <p className="font-brand-serif mt-1 text-xs text-zinc-400">
              {t.impostazioni.imageRecommendation}
            </p>
          </div>

          <TokenImageField type="white" label={t.impostazioni.whiteToken} />
          <TokenImageField type="black" label={t.impostazioni.blackToken} />
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm font-bold uppercase tracking-wide">
              {t.impostazioni.themeTitle}
            </div>
            <p className="font-brand-serif mt-1 text-xs italic text-brand-rose/90">
              {t.impostazioni.themeHint}
            </p>
          </div>

          <ThemePicker />
        </div>
      </div>
    </PageShell>
  );
}
