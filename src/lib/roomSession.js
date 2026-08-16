const ROOM_SESSION_KEY = "nte-room-session";

// Su mobile, mettere l'app in background a lungo può far scaricare la pagina
// dal browser/OS per liberare memoria: al ritorno in foreground il reload
// riparte da App.jsx con lo screen di default. Salvando codice stanza e
// ruolo in sessionStorage, App.jsx può riaprire subito la schermata Stanze
// invece di buttare l'utente sulla Landing.
export function loadStoredRoom() {
  try {
    const raw = window.sessionStorage.getItem(ROOM_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.code === "string" &&
      (parsed.role === "master" || parsed.role === "player")
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveStoredRoom(room) {
  try {
    if (room) window.sessionStorage.setItem(ROOM_SESSION_KEY, JSON.stringify(room));
    else window.sessionStorage.removeItem(ROOM_SESSION_KEY);
  } catch {
    // sessionStorage non disponibile (es. modalità privata): nessun impatto,
    // solo niente rientro automatico dopo un reload in background.
  }
}
