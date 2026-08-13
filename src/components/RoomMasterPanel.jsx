import { useTranslations } from "../i18n/LanguageContext.jsx";
import { useRoom } from "../context/RoomContext.jsx";
import { DIFFICULTY_BLACKS } from "../lib/bagMath.js";
import Header from "./Header.jsx";
import PageShell from "./PageShell.jsx";
import RoomDrawPanel from "./RoomDrawPanel.jsx";
import RoomHistory from "./RoomHistory.jsx";
import RoomPlayerList from "./RoomPlayerList.jsx";
import Select from "./Select.jsx";
import Stepper from "./Stepper.jsx";

export default function RoomMasterPanel({ roomCode, onLeave, onMenuClick, onNavigate }) {
  const { t } = useTranslations();
  const { state, actions } = useRoom();
  const { setup, players, activePlayerId } = state;

  function updateSetup(patch) {
    actions.setSetup({ ...setup, ...patch });
  }

  const selectOptions = Object.keys(DIFFICULTY_BLACKS).map((id) => ({
    value: id,
    label: `${t.difficulty[id]} (${DIFFICULTY_BLACKS[id]} ${t.difficulty.neriSuffix})`,
  }));

  const playerEntries = Object.entries(players).sort(([idA], [idB]) => {
    if (idA === state.masterId) return -1;
    if (idB === state.masterId) return 1;
    return 0;
  });

  return (
    <PageShell onNavigate={onNavigate}>
      <Header variant="plain" onMenuClick={onMenuClick} onNavigate={onNavigate} />

      <div className="space-y-8 px-6 pb-10">
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-rose">
            {t.stanza.yourCode}
          </div>
          <div className="font-display text-4xl tracking-[0.3em]">{roomCode}</div>
          <p className="font-brand-serif text-xs italic text-zinc-400">
            {t.stanza.shareCode}
          </p>
        </div>

        <RoomPlayerList />

        <div className="space-y-6">
          <div className="text-sm font-bold uppercase tracking-wide">
            {t.stanza.composeTest}
          </div>

          <div className="space-y-2">
            <div className="text-sm font-bold uppercase tracking-wide">
              {t.setup.difficolta}
            </div>
            <Select
              value={setup.difficultyId}
              onChange={(v) => updateSetup({ difficultyId: v })}
              options={selectOptions}
              placeholder={t.setup.selectPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-bold uppercase tracking-wide">
              {t.setup.trattiInGioco}
            </div>
            <Stepper
              value={setup.traitsInPlay}
              min={0}
              max={12}
              onChange={(v) => updateSetup({ traitsInPlay: v })}
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
              value={setup.blacksOverride}
              min={0}
              max={99}
              onChange={(v) => updateSetup({ blacksOverride: v })}
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
              value={setup.adrenalineActive ? 4 : setup.maxDraw}
              min={1}
              max={4}
              onChange={(v) => updateSetup({ maxDraw: v })}
              disabled={setup.adrenalineActive}
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
                checked={setup.adrenalineActive}
                onChange={(e) => updateSetup({ adrenalineActive: e.target.checked })}
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
                checked={setup.confusionNext}
                onChange={(e) => updateSetup({ confusionNext: e.target.checked })}
                className="h-5 w-5 shrink-0 rounded border-zinc-600 bg-zinc-900 accent-brand-gold"
              />
              <span className="font-brand-serif text-sm italic text-zinc-300">
                {t.setup.confusioneLabel}
              </span>
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-bold uppercase tracking-wide">
            {t.stanza.selectActivePlayer}
          </div>
          {playerEntries.length === 0 ? (
            <p className="font-brand-serif text-sm italic text-zinc-400">
              {t.stanza.noPlayers}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {playerEntries.map(([id, player]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => actions.selectActivePlayer(id)}
                  className={
                    "border px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all active:scale-95 " +
                    (id === activePlayerId
                      ? "border-brand-gold text-brand-gold"
                      : "border-zinc-700 text-zinc-300 hover:border-zinc-500")
                  }
                >
                  {player.nickname}
                </button>
              ))}
            </div>
          )}
        </div>

        <RoomDrawPanel />

        <RoomHistory />

        <button
          type="button"
          onClick={onLeave}
          className="mx-auto block text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 transition-transform hover:text-white active:scale-95"
        >
          {t.stanza.leaveRoom}
        </button>
      </div>
    </PageShell>
  );
}
