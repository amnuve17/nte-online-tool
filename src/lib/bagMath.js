// Logica pura di estrazione/sacchetto, condivisa tra l'hook client
// (src/hooks/useTokenBag.js, sessione locale) e il server di stanza
// (party/room.js, autorevole per le sessioni multiplayer).

export const DIFFICULTY_IDS = [
  "facilissima",
  "facile",
  "normale",
  "difficile",
  "difficilissima",
  "quasi_impossibile",
];

export const DIFFICULTY_BLACKS = {
  facilissima: 1,
  facile: 2,
  normale: 3,
  difficile: 4,
  difficilissima: 5,
  quasi_impossibile: 6,
};

// Setup di default per una stanza: usato sia dal server (party/room.js) al
// primo avvio, sia dal client per il pulsante "torna al setup".
export const DEFAULT_ROOM_SETUP = {
  traitsInPlay: 3,
  difficultyId: "normale",
  blacksOverride: 0,
  maxDraw: 4,
  adrenalineActive: false,
  confusionNext: false,
};

export function randInt(maxExclusive) {
  if (maxExclusive <= 0) return 0;
  return crypto.getRandomValues(new Uint32Array(1))[0] % maxExclusive;
}

export function drawOneFromCounts(w, b) {
  const total = w + b;
  if (total <= 0) return null;
  const r = randInt(total);
  return r < w ? "W" : "B";
}

export function clampInt(v, min, max) {
  const n = Number.isFinite(v) ? v : 0;
  const i = Math.trunc(n);
  return Math.max(min, Math.min(max, i));
}

/**
 * Confusione:
 * per ogni tratto, invece di aggiungere 1 bianco, aggiungiamo 1 token casuale (W/B).
 * Nota: assumiamo 50/50 perché non stiamo modellando una riserva fisica finita.
 */
export function randomTraitTokens(nTraits) {
  let w = 0,
    b = 0;
  for (let i = 0; i < nTraits; i++) {
    if (randInt(2) === 0) w++;
    else b++;
  }
  return { w, b };
}
