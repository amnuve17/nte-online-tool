import { useEffect, useRef, useState } from "react";
import { useTranslations } from "../i18n/LanguageContext.jsx";
import { RoomProvider, useRoom } from "../context/RoomContext.jsx";
import { useRoomIdentity } from "../lib/roomIdentity.js";
import { resizeImageToDataUrl } from "../lib/resizeImage.js";
import { generateRoomCode, normalizeRoomCode } from "../lib/roomCode.js";
import { loadStoredRoom, saveStoredRoom } from "../lib/roomSession.js";
import Header from "./Header.jsx";
import HexButton from "./HexButton.jsx";
import PageShell from "./PageShell.jsx";
import PlayerAvatar from "./PlayerAvatar.jsx";
import RoomMasterPanel from "./RoomMasterPanel.jsx";
import RoomPlayerPanel from "./RoomPlayerPanel.jsx";

const NOT_FOUND_TIMEOUT_MS = 2500;

function RoomInner({ roomCode, role, onLeave, onMenuClick, onNavigate }) {
  const { t } = useTranslations();
  const { state, connected, isMaster } = useRoom();
  const [notFoundTimedOut, setNotFoundTimedOut] = useState(false);

  useEffect(() => {
    if (role !== "player" || state?.masterId) return;
    const timer = setTimeout(() => setNotFoundTimedOut(true), NOT_FOUND_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [role, state?.masterId]);

  if (role === "player" && notFoundTimedOut && !state?.masterId) {
    return (
      <PageShell onNavigate={onNavigate}>
        <Header variant="plain" onMenuClick={onMenuClick} onNavigate={onNavigate} />
        <div className="space-y-4 px-6 pb-10 text-center">
          <p className="font-brand-serif text-sm text-brand-rose">
            {t.stanza.notFound}
          </p>
          <button
            type="button"
            onClick={onLeave}
            className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 underline decoration-dotted transition-transform hover:text-white active:scale-95"
          >
            {t.stanza.leaveRoom}
          </button>
        </div>
      </PageShell>
    );
  }

  if (!connected || !state) {
    return (
      <PageShell onNavigate={onNavigate}>
        <Header variant="plain" onMenuClick={onMenuClick} onNavigate={onNavigate} />
        <p className="font-brand-serif px-6 pb-10 text-center text-sm text-zinc-400">
          {t.stanza.connecting}
        </p>
      </PageShell>
    );
  }

  return isMaster ? (
    <RoomMasterPanel
      roomCode={roomCode}
      onLeave={onLeave}
      onMenuClick={onMenuClick}
      onNavigate={onNavigate}
    />
  ) : (
    <RoomPlayerPanel onLeave={onLeave} onMenuClick={onMenuClick} onNavigate={onNavigate} />
  );
}

export default function RoomScreen({ onMenuClick, onNavigate }) {
  const { t } = useTranslations();
  const identity = useRoomIdentity();
  const avatarInputRef = useRef(null);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [room, setRoomState] = useState(loadStoredRoom); // { code, role } | null

  function setRoom(next) {
    setRoomState(next);
    saveStoredRoom(next);
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const dataUrl = await resizeImageToDataUrl(file, 128);
    identity.setAvatar(dataUrl);
  }

  function handleCreate() {
    if (!identity.nickname.trim()) {
      setError(t.stanza.nicknameRequired);
      return;
    }
    setError("");
    setRoom({ code: generateRoomCode(), role: "master" });
  }

  function handleJoin() {
    if (!identity.nickname.trim()) {
      setError(t.stanza.nicknameRequired);
      return;
    }
    const code = normalizeRoomCode(joinCode);
    if (!code) {
      setError(t.stanza.roomCodeRequired);
      return;
    }
    setError("");
    setRoom({ code, role: "player" });
  }

  if (room) {
    return (
      <RoomProvider
        roomCode={room.code}
        role={room.role}
        identity={{ nickname: identity.nickname, avatar: identity.avatar }}
      >
        <RoomInner
          roomCode={room.code}
          role={room.role}
          onLeave={() => setRoom(null)}
          onMenuClick={onMenuClick}
          onNavigate={onNavigate}
        />
      </RoomProvider>
    );
  }

  return (
    <PageShell onNavigate={onNavigate}>
      <Header variant="plain" onMenuClick={onMenuClick} onNavigate={onNavigate} />

      <div className="space-y-6 px-6 pb-10">
        <div className="space-y-4">
          <h2 className="font-display text-2xl uppercase tracking-tight">
            {t.stanza.lobbyTitle}
          </h2>
          <p className="font-brand-serif text-sm leading-relaxed text-zinc-300/90">
            {t.stanza.lobbyDescription}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-bold uppercase tracking-wide">
              {t.stanza.nickname}
            </div>
            <input
              type="text"
              value={identity.nickname}
              onChange={(e) => identity.setNickname(e.target.value)}
              placeholder={t.stanza.nicknamePlaceholder}
              maxLength={24}
              className="flex h-16 w-full items-center border border-zinc-700/60 bg-zinc-900/80 px-4 text-lg font-semibold outline-none transition-transform active:scale-[0.98] focus:border-brand-gold"
            />
          </div>

          <div className="flex items-center gap-4">
            <PlayerAvatar
              image={identity.avatar}
              nickname={identity.nickname}
              size="h-16 w-16"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="text-sm font-bold uppercase tracking-wide">
                {t.stanza.avatar}
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="text-xs italic text-brand-gold underline decoration-dotted transition-transform active:scale-95"
                >
                  {t.stanza.chooseImage}
                </button>
                {identity.avatar && (
                  <button
                    type="button"
                    onClick={() => identity.setAvatar(null)}
                    className="text-xs italic text-zinc-400 underline decoration-dotted transition-transform hover:text-white active:scale-95"
                  >
                    {t.stanza.removeImage}
                  </button>
                )}
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          {error && (
            <p className="font-brand-serif text-xs italic text-brand-rose">{error}</p>
          )}
        </div>

        <div className="flex justify-center pt-2">
          <HexButton label={t.stanza.createRoom} onClick={handleCreate} />
        </div>

        <div className="space-y-2">
          <div className="text-sm font-bold uppercase tracking-wide">
            {t.stanza.joinRoom}
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder={t.stanza.roomCodePlaceholder}
              maxLength={5}
              className="flex h-16 min-w-0 flex-1 items-center border border-zinc-700/60 bg-zinc-900/80 px-4 text-center text-lg font-bold uppercase tracking-[0.3em] outline-none transition-transform active:scale-[0.98] focus:border-brand-gold"
            />
            <button
              type="button"
              onClick={handleJoin}
              className="shrink-0 border border-brand-gold px-6 text-sm font-bold uppercase tracking-wide text-brand-gold transition-all hover:bg-brand-gold/15 active:scale-95"
            >
              {t.stanza.enter}
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
