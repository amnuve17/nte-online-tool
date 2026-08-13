import { useTranslations } from "../i18n/LanguageContext.jsx";
import Header from "./Header.jsx";
import PageShell from "./PageShell.jsx";
import RoomDrawPanel from "./RoomDrawPanel.jsx";
import RoomHistory from "./RoomHistory.jsx";
import RoomPlayerList from "./RoomPlayerList.jsx";

export default function RoomPlayerPanel({ onLeave, onMenuClick, onNavigate }) {
  const { t } = useTranslations();

  return (
    <PageShell onNavigate={onNavigate}>
      <Header variant="plain" onMenuClick={onMenuClick} onNavigate={onNavigate} />

      <div className="space-y-8 px-6 pb-10">
        <RoomPlayerList />

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
