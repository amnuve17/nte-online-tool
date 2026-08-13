import { useTranslations } from "../i18n/LanguageContext.jsx";
import { useRoom } from "../context/RoomContext.jsx";
import PlayerAvatar from "./PlayerAvatar.jsx";

function CrownIcon(props) {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" {...props}>
      <path d="M3 8l3.5 2.5L12 4l5.5 6.5L21 8l-2 10H5L3 8z" />
    </svg>
  );
}

export default function RoomPlayerList() {
  const { t } = useTranslations();
  const { state, myId } = useRoom();
  const playerEntries = Object.entries(state.players).sort(([idA], [idB]) => {
    if (idA === state.masterId) return -1;
    if (idB === state.masterId) return 1;
    return 0;
  });

  return (
    <div className="space-y-3">
      <div className="text-sm font-bold uppercase tracking-wide">
        {t.stanza.players}
      </div>
      {playerEntries.length === 0 ? (
        <p className="font-brand-serif text-sm italic text-zinc-400">
          {t.stanza.noPlayers}
        </p>
      ) : (
        <div className="space-y-2">
          {playerEntries.map(([id, player]) => (
            <div key={id} className="flex items-center gap-3">
              <PlayerAvatar image={player.avatar} nickname={player.nickname} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 truncate font-semibold">
                  {id === state.masterId && (
                    <CrownIcon className="h-3.5 w-3.5 shrink-0 text-brand-gold" />
                  )}
                  {player.nickname}
                  {id === myId && (
                    <span className="text-xs text-zinc-400">{t.stanza.you}</span>
                  )}
                </div>
                {id === state.masterId && (
                  <div className="text-xs uppercase tracking-wide text-brand-gold">
                    {t.stanza.master}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
