import { useTranslations } from "../i18n/LanguageContext.jsx";
import { AdrenalineIcon, ConfusionIcon, RiskIcon } from "./HistoryBadgeIcons.jsx";

// Cronologia delle prove nella sessione solitaria: stessa struttura e stessi
// criteri (adrenalina/confusione/rischio) della cronologia di stanza, senza
// avatar/nickname dato che qui c'è un solo giocatore.
export default function DrawHistory({ history }) {
  const { t } = useTranslations();

  return (
    <div className="space-y-3">
      <div className="text-sm font-bold uppercase tracking-wide">
        {t.stanza.historyTitle}
      </div>
      {history.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-gold">
          <span className="flex items-center gap-1.5">
            <AdrenalineIcon /> {t.stanza.adrenalineBadge}
          </span>
          <span className="flex items-center gap-1.5">
            <ConfusionIcon /> {t.stanza.confusionBadge}
          </span>
          <span className="flex items-center gap-1.5">
            <RiskIcon /> {t.stanza.riskedBadge}
          </span>
        </div>
      )}
      {history.length === 0 ? (
        <p className="font-brand-serif text-sm italic text-zinc-400">
          {t.stanza.noHistory}
        </p>
      ) : (
        <div className="space-y-2">
          {history.map((entry, i) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 border border-zinc-700/60 bg-zinc-900/40 px-3 py-2.5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-zinc-600 text-sm font-bold text-zinc-400">
                {history.length - i}
              </div>
              <div className="min-w-0 flex-1">
                {(entry.adrenaline || entry.confusion || entry.risked) && (
                  <div className="flex items-center gap-2 text-brand-gold">
                    {entry.adrenaline && (
                      <span title={t.stanza.adrenalineBadge}>
                        <AdrenalineIcon aria-label={t.stanza.adrenalineBadge} />
                      </span>
                    )}
                    {entry.confusion && (
                      <span title={t.stanza.confusionBadge}>
                        <ConfusionIcon aria-label={t.stanza.confusionBadge} />
                      </span>
                    )}
                    {entry.risked && (
                      <span title={t.stanza.riskedBadge}>
                        <RiskIcon aria-label={t.stanza.riskedBadge} />
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3 text-right">
                <div>
                  <div className="text-base font-bold leading-none">{entry.whites}</div>
                  <div className="text-[10px] uppercase tracking-wide text-brand-rose">
                    {t.estrazione.bianchi}
                  </div>
                </div>
                <div>
                  <div className="text-base font-bold leading-none">{entry.blacks}</div>
                  <div className="text-[10px] uppercase tracking-wide text-brand-rose">
                    {t.estrazione.neri}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
