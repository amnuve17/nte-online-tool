import { useState } from "react";

const STORAGE_KEY = "nte-room-identity";

function loadInitial() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { nickname: "", avatar: null };
    const parsed = JSON.parse(raw);
    return {
      nickname: typeof parsed.nickname === "string" ? parsed.nickname : "",
      avatar: typeof parsed.avatar === "string" ? parsed.avatar : null,
    };
  } catch {
    return { nickname: "", avatar: null };
  }
}

function save(identity) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
}

// Nickname e avatar restano solo su questo dispositivo, per precompilare il
// form la prossima volta: non vengono mai scritti su alcun database.
export function useRoomIdentity() {
  const [identity, setIdentity] = useState(loadInitial);

  function setNickname(nickname) {
    setIdentity((prev) => {
      const next = { ...prev, nickname };
      save(next);
      return next;
    });
  }

  function setAvatar(avatar) {
    setIdentity((prev) => {
      const next = { ...prev, avatar };
      save(next);
      return next;
    });
  }

  return { nickname: identity.nickname, avatar: identity.avatar, setNickname, setAvatar };
}
