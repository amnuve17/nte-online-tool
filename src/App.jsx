import { useMemo, useState } from "react";

const DIFFICULTY = [
  { id: "facilissima", label: "Facilissima", blacks: 1 },
  { id: "facile", label: "Facile", blacks: 2 },
  { id: "normale", label: "Normale", blacks: 3 },
  { id: "difficile", label: "Difficile", blacks: 4 },
  { id: "difficilissima", label: "Difficilissima", blacks: 5 },
  { id: "quasi_impossibile", label: "Quasi impossibile", blacks: 6 },
];

function randInt(maxExclusive) {
  if (maxExclusive <= 0) return 0;
  return crypto.getRandomValues(new Uint32Array(1))[0] % maxExclusive;
}

/**
 * Estrae 1 token dal sacchetto (solo W/B) senza reinserimento.
 * Ritorna "W" o "B" o null se vuoto.
 */
function drawOneFromCounts(w, b) {
  const total = w + b;
  if (total <= 0) return null;
  const r = randInt(total); // [0..total-1]
  return r < w ? "W" : "B";
}

function clampInt(v, min, max) {
  const n = Number.isFinite(v) ? v : 0;
  const i = Math.trunc(n);
  return Math.max(min, Math.min(max, i));
}

export default function App() {
  // --- input “regolamento” ---
  const [traitsInPlay, setTraitsInPlay] = useState(3); // bianchi
  const [difficultyId, setDifficultyId] = useState("normale");
  const [blackOverride, setBlackOverride] = useState(false);
  const [blacksManual, setBlacksManual] = useState(3);

  // --- stato prova corrente (sacchetto e pescate) ---
  const [bagW, setBagW] = useState(3);
  const [bagB, setBagB] = useState(3);
  const [drawn, setDrawn] = useState([]); // ["W","B",...]
  const [maxDraw, setMaxDraw] = useState(4);

  // tracker opzionale (coerente con scheda: spendi neri per adrenalina/confusione)
  const [adrenaline, setAdrenaline] = useState(false);
  const [confusion, setConfusion] = useState(false);

  const difficulty = useMemo(
    () => DIFFICULTY.find((d) => d.id === difficultyId) || DIFFICULTY[2],
    [difficultyId]
  );

  const inputBlacks = blackOverride ? clampInt(blacksManual, 0, 99) : difficulty.blacks;
  const inputWhites = clampInt(traitsInPlay, 0, 12);

  const totalInBag = bagW + bagB;
  const canDrawMore = drawn.length < clampInt(maxDraw, 1, 4) && totalInBag > 0;

  const drawnW = drawn.filter((x) => x === "W").length;
  const drawnB = drawn.filter((x) => x === "B").length;

  const success = drawnW >= 1; // “un bianco basta”
  const extraSuccess = Math.max(0, drawnW - 1); // “bianchi extra migliorano”
  // i neri non annullano: sono complicazioni/sventure “da gestire”
  const complications = drawnB;

  function newTest() {
    setBagW(inputWhites);
    setBagB(inputBlacks);
    setDrawn([]);
  }

  function draw() {
    if (!canDrawMore) return;
    const t = drawOneFromCounts(bagW, bagB);
    if (!t) return;

    setDrawn((prev) => [...prev, t]);
    if (t === "W") setBagW((x) => x - 1);
    else setBagB((x) => x - 1);
  }

  function resetAll() {
    setTraitsInPlay(3);
    setDifficultyId("normale");
    setBlackOverride(false);
    setBlacksManual(3);
    setBagW(3);
    setBagB(3);
    setDrawn([]);
    setMaxDraw(4);
    setAdrenaline(false);
    setConfusion(false);
  }

  function spendBlackTo(kind) {
    if (drawnB <= 0) return;

    // max 1 per ciascuna condizione
    if (kind === "adrenaline" && adrenaline) return;
    if (kind === "confusion" && confusion) return;

    // rimuovi 1 nero “speso” dalla lista pescata (tracking)
    const idx = drawn.lastIndexOf("B");
    if (idx === -1) return;

    setDrawn((prev) => {
      const next = prev.slice();
      next.splice(idx, 1);
      return next;
    });

    if (kind === "adrenaline") setAdrenaline(true);
    if (kind === "confusion") setConfusion(true);
  }


  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-5xl p-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Not the End — Token Bag (W/B)</h1>
          <p className="text-zinc-300 text-sm">
            Sacchetto per prova: bianchi = tratti in gioco, neri = difficoltà.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Setup Prova</h2>
              <button
                onClick={resetAll}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm"
              >
                Reset
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="space-y-1">
                <div className="text-sm text-zinc-200">Tratti in gioco → Bianchi</div>
                <input
                  type="number"
                  min={0}
                  max={12}
                  value={traitsInPlay}
                  onChange={(e) => setTraitsInPlay(clampInt(parseInt(e.target.value, 10), 0, 12))}
                  className="w-full rounded-xl bg-zinc-950/60 border border-zinc-800 px-3 py-2 outline-none"
                />
              </label>

              <label className="space-y-1">
                <div className="text-sm text-zinc-200">Difficoltà</div>
                <select
                  value={difficultyId}
                  onChange={(e) => setDifficultyId(e.target.value)}
                  disabled={blackOverride}
                  className="w-full rounded-xl bg-zinc-950/60 border border-zinc-800 px-3 py-2 outline-none disabled:opacity-60"
                >
                  {DIFFICULTY.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label} ({d.blacks} neri)
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-zinc-200 select-none">
                <input
                  type="checkbox"
                  className="accent-zinc-200"
                  checked={blackOverride}
                  onChange={(e) => setBlackOverride(e.target.checked)}
                />
                override neri (manuale)
              </label>

              <input
                type="number"
                min={0}
                max={99}
                value={blacksManual}
                onChange={(e) => setBlacksManual(clampInt(parseInt(e.target.value, 10), 0, 99))}
                disabled={!blackOverride}
                className="w-32 rounded-xl bg-zinc-950/60 border border-zinc-800 px-3 py-2 outline-none disabled:opacity-60"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-zinc-200">Max pescate (1–4)</label>
              <select
                value={maxDraw}
                onChange={(e) => setMaxDraw(clampInt(parseInt(e.target.value, 10), 1, 4))}
                className="w-24 rounded-xl bg-zinc-950/60 border border-zinc-800 px-3 py-2 outline-none"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={newTest}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 font-semibold"
              >
                Nuova Prova
              </button>
              <div className="text-sm text-zinc-300 self-center">
                Imposterà: <span className="font-semibold">{inputWhites}</span> bianchi +{" "}
                <span className="font-semibold">{inputBlacks}</span> neri
              </div>
            </div>
          </section>

          {/* SACCHETTO + PESCA */}
          <section className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Sacchetto</h2>
              <div className="text-sm text-zinc-300">
                Rimasti: <span className="font-semibold">{totalInBag}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-zinc-950/40 border border-zinc-800 p-3">
                <div className="text-sm text-zinc-300">Bianchi (successi)</div>
                <div className="text-2xl font-bold">{bagW}</div>
              </div>
              <div className="rounded-xl bg-zinc-950/40 border border-zinc-800 p-3">
                <div className="text-sm text-zinc-300">Neri (complicazioni)</div>
                <div className="text-2xl font-bold">{bagB}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={draw}
                disabled={!canDrawMore}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-300 font-semibold"
              >
                Pesca 1
              </button>
              <button
                onClick={() => {
                  setBagW(inputWhites);
                  setBagB(inputBlacks);
                  setDrawn([]);
                }}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
              >
                Reimposta Prova
              </button>
            </div>

            <div className="rounded-xl bg-zinc-950/40 border border-zinc-800 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Pescati ({drawn.length}/{clampInt(maxDraw, 1, 4)})</div>
                <div className="text-xs text-zinc-400">
                  {success ? "SUCCESSO (almeno 1 bianco)" : "nessun bianco → fallimento"}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {drawn.length === 0 ? (
                  <div className="text-sm text-zinc-400">Nessuna pescata.</div>
                ) : (
                  drawn.map((t, i) => (
                    <span
                      key={i}
                      className={
                        "inline-flex items-center justify-center h-8 w-8 rounded-full border " +
                        (t === "W"
                          ? "bg-zinc-100 text-zinc-950 border-zinc-300"
                          : "bg-zinc-950 text-zinc-100 border-zinc-700")
                      }
                      title={t === "W" ? "Bianco (successo)" : "Nero (complicazione)"}
                    >
                      {t}
                    </span>
                  ))
                )}
              </div>

              <div className="text-sm text-zinc-200">
                <div>
                  Successi: <span className="font-semibold">{drawnW}</span>{" "}
                  {drawnW > 0 && (
                    <span className="text-zinc-400">
                      (extra miglioramento: {extraSuccess})
                    </span>
                  )}
                </div>
                <div>
                  Neri: <span className="font-semibold">{complications}</span>{" "}
                  <span className="text-zinc-400">(complicazioni/sventure da gestire)</span>
                </div>
              </div>

              {/* tracker “spendi nero” */}
              <div className="pt-2 border-t border-zinc-800">
                <div className="text-sm text-zinc-300 mb-2">Spendi 1 nero per:</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => spendBlackTo("adrenaline")}
                    disabled={drawnB <= 0 || adrenaline}
                    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 disabled:opacity-50 text-sm"
                  >
                    Adrenalina {adrenaline ? "✓" : ""}
                  </button>
                  <button
                    onClick={() => spendBlackTo("confusion")}
                    disabled={drawnB <= 0 || confusion}
                    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 disabled:opacity-50 text-sm"
                  >
                    Confusione {confusion ? "✓" : ""}
                  </button>
                </div>
              </div>
            </div>
            {!canDrawMore && drawn.length > 0 && (
              <div className="text-xs text-zinc-500">
                Fine pesca: hai raggiunto il limite o il sacchetto è vuoto.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
