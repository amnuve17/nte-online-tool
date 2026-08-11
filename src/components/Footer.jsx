import { useTranslations } from "../i18n/LanguageContext.jsx";

const FUMBLEGDR_URL = "https://www.fumblegdr.it/";
const MS_EDIZIONI_URL = "https://www.msedizioni.it/";

export default function Footer({ onNavigate }) {
  const { t } = useTranslations();
  return (
    <footer className="font-brand-serif relative z-10 border-t border-white/10 px-6 py-6 text-center text-xs text-zinc-400">
      <button
        type="button"
        onClick={() => onNavigate?.("autori")}
        className="inline-block text-sm text-zinc-300 underline transition-transform hover:text-white active:scale-95"
      >
        {t.footer.autori}
      </button>
      <p className="mt-2">{t.footer.line1}</p>
      <p className="mt-1">
        {t.footer.belongsTo}{" "}
        <a
          href={FUMBLEGDR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-zinc-300 underline transition-transform hover:text-white active:scale-95"
        >
          FumbleGDR
        </a>{" "}
        {t.footer.and}{" "}
        <a
          href={MS_EDIZIONI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-zinc-300 underline transition-transform hover:text-white active:scale-95"
        >
          MS Edizioni
        </a>
        , {t.footer.rightsReserved}
      </p>
    </footer>
  );
}
