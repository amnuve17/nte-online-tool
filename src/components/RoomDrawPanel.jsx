import { useEffect, useRef, useState } from "react";
import { useTranslations } from "../i18n/LanguageContext.jsx";
import { useRoom } from "../context/RoomContext.jsx";
import { DEFAULT_ROOM_SETUP } from "../lib/bagMath.js";
import { deriveRoomBag } from "../lib/roomBag.js";
import DrawRecap from "./DrawRecap.jsx";
import HexButton from "./HexButton.jsx";

const FIRST_REVEAL_DELAY_MS = 80;
const REVEAL_STEP_MS = 700;

// Pannello dell'estrazione condivisa: mostrato sia nel pannello master che in
// quello giocatore. Chi sta estraendo vede i controlli, gli altri vedono la
// stessa scena sincronizzata in tempo reale (nessuna azione locale).
export default function RoomDrawPanel() {
  const { t } = useTranslations();
  const { state, myId, isMaster, actions } = useRoom();
  const [showConsequences, setShowConsequences] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const revealStartCountRef = useRef(0);

  const bag = deriveRoomBag(state, actions);
  const isActivePlayer = !!state.activePlayerId && state.activePlayerId === myId;
  const activePlayer = state.activePlayerId ? state.players[state.activePlayerId] : null;
  const finished = !bag.canDrawMore && bag.drawn.length > 0;

  function startRevealing() {
    revealStartCountRef.current = bag.drawn.length;
    setRevealing(true);
  }

  function handleBackToSetup() {
    actions.setSetup(DEFAULT_ROOM_SETUP);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    if (!revealing || !isActivePlayer) return;
    if (!bag.canDrawMore) {
      setRevealing(false);
      return;
    }
    const isFirst = bag.drawn.length === revealStartCountRef.current;
    const timer = setTimeout(
      () => actions.draw(),
      isFirst ? FIRST_REVEAL_DELAY_MS : REVEAL_STEP_MS
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealing, isActivePlayer, bag.drawn.length, bag.canDrawMore]);

  if (!state.test) {
    return (
      <p className="font-brand-serif text-center text-sm italic text-brand-rose/90">
        {t.stanza.waitingForMaster}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border border-brand-rose/30 bg-brand-rose/15 py-4 text-center">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-rose">
          {t.estrazione.rimasti}
        </div>
        <div className="mt-1 text-4xl font-bold">{bag.totalInBag}</div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-brand-rose/30 border border-brand-rose/30 bg-brand-rose/15 py-4 text-center">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-rose">
            {t.estrazione.bianchi}
          </div>
          <div className="mt-1 text-3xl font-bold">
            {bag.bagIsSecret ? "?" : bag.bagW}
          </div>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-rose">
            {t.estrazione.neri}
          </div>
          <div className="mt-1 text-3xl font-bold">
            {bag.bagIsSecret ? "?" : bag.bagB}
          </div>
        </div>
      </div>

      <DrawRecap bag={bag} />

      {isActivePlayer ? (
        <div className="space-y-4 pt-2 text-center">
          {!finished && (
            <p className="font-display text-lg uppercase tracking-[0.2em] text-brand-gold">
              {t.stanza.yourTurn}
            </p>
          )}
          <div className="flex justify-center">
            <HexButton
              label={t.estrazione.rivela}
              disabled={!bag.canDrawMore || revealing}
              onClick={startRevealing}
            />
          </div>
        </div>
      ) : (
        <p className="font-brand-serif text-center text-sm italic text-brand-rose/90">
          {t.stanza.waitingForPrefix}{" "}
          <span className="font-bold not-italic text-white">
            {activePlayer?.nickname}
          </span>{" "}
          {t.stanza.waitingForSuffix}
        </p>
      )}

      {finished && (
        <div className="space-y-6 pt-2">
          {isActivePlayer && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={actions.risk}
                disabled={!bag.canRisk}
                className="border border-brand-rose/40 bg-brand-rose/15 px-10 py-3 text-sm font-bold uppercase tracking-wide transition-all hover:bg-brand-rose/25 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
              >
                {t.estrazione.rischia}
              </button>
            </div>
          )}

          {isMaster && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={actions.resetTest}
                className="border border-brand-rose/40 bg-brand-rose/15 px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all hover:bg-brand-rose/25 active:scale-[0.97]"
              >
                {t.stanza.resetCurrentTest}
              </button>
              <button
                type="button"
                onClick={handleBackToSetup}
                className="border border-zinc-600 px-4 py-3 text-sm font-bold uppercase tracking-wide text-zinc-300 transition-all hover:border-white hover:text-white active:scale-[0.97]"
              >
                {t.stanza.backToSetup}
              </button>
            </div>
          )}

          {isActivePlayer && (
            <p className="font-brand-serif text-center text-xs italic text-brand-rose/90">
              {t.estrazione.rischiaWarning}
            </p>
          )}

          {bag.complications > 0 && (
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
        </div>
      )}
    </div>
  );
}
