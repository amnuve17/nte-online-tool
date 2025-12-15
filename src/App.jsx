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

function drawOneFromCounts(w, b) {
  const total = w + b;
  if (total <= 0) return null;
  const r = randInt(total);
  return r < w ? "W" : "B";
}

function clampInt(v, min, max) {
  const n = Number.isFinite(v) ? v : 0;
  const i = Math.trunc(n);
  return Math.max(min, Math.min(max, i));
}

/**
 * Confusione:
 * per ogni tratto, invece di aggiungere 1 bianco, aggiungiamo 1 token casuale (W/B).
 * Nota: assumiamo 50/50 perché non stiamo modellando una riserva fisica finita.
 */
function randomTraitTokens(nTraits) {
  let w = 0,
    b = 0;
  for (let i = 0; i < nTraits; i++) {
    if (randInt(2) === 0) w++;
    else b++;
  }
  return { w, b };
}

export default function App() {

  // --- input “regolamento” ---
  const [traitsInPlay, setTraitsInPlay] = useState(3);
  const [difficultyId, setDifficultyId] = useState("normale");
  const [blackOverride, setBlackOverride] = useState(false);
  const [blacksManual, setBlacksManual] = useState(3);

  // --- opzioni prova ---
  const [maxDraw, setMaxDraw] = useState(4); // limite base 1–4

  // Rischio: si decide DOPO le pescate base, e porta a 5 totali
  const [riskActive, setRiskActive] = useState(false);

  // Confusione: vale per la PROSSIMA prova; poi si consuma
  const [confusionNext, setConfusionNext] = useState(false);
  const [confusionThisTest, setConfusionThisTest] = useState(false);

  // --- stato prova corrente (sacchetto e pescate) ---
  const [bagW, setBagW] = useState(3);
  const [bagB, setBagB] = useState(3);
  const [drawn, setDrawn] = useState([]); // ["W","B",...]

  const difficulty = useMemo(
    () => DIFFICULTY.find((d) => d.id === difficultyId) || DIFFICULTY[2],
    [difficultyId]
  );

  const inputBlacks = blackOverride
    ? clampInt(blacksManual, 0, 99)
    : difficulty.blacks;

  const inputWhites = clampInt(traitsInPlay, 0, 12);

  const baseMaxDraw = clampInt(maxDraw, 1, 4);
  const effectiveMaxDraw = riskActive ? 5 : baseMaxDraw;

  const totalInBag = bagW + bagB;
  const canDrawMore = drawn.length < effectiveMaxDraw && totalInBag > 0;

  const drawnW = drawn.filter((x) => x === "W").length;
  const drawnB = drawn.filter((x) => x === "B").length;

  const success = drawnW >= 1;
  const extraSuccess = Math.max(0, drawnW - 1);
  const complications = drawnB;

  function newTest() {
    setDrawn([]);
    setRiskActive(false); // ogni nuova prova parte senza rischio

    if (confusionNext) {
      const { w, b } = randomTraitTokens(inputWhites);
      setBagW(w);
      setBagB(inputBlacks + b);

      setConfusionThisTest(true);
      setConfusionNext(false);
      return;
    }

    setBagW(inputWhites);
    setBagB(inputBlacks);
    setConfusionThisTest(false);
  }

  function draw() {
    if (!canDrawMore) return;
    const t = drawOneFromCounts(bagW, bagB);
    if (!t) return;

    setDrawn((prev) => [...prev, t]);
    if (t === "W") setBagW((x) => x - 1);
    else setBagB((x) => x - 1);
  }

  function risk() {
    // puoi rischiare solo dopo aver completato le pescate base
    if (riskActive) return;
    if (drawn.length !== baseMaxDraw) return;
    if (totalInBag <= 0) return;
    setRiskActive(true); // ora puoi arrivare a 5 totali, stesso sacchetto
  }

  function resetAll() {
    setTraitsInPlay(3);
    setDifficultyId("normale");
    setBlackOverride(false);
    setBlacksManual(3);
    setMaxDraw(4);

    setRiskActive(false);

    setConfusionNext(false);
    setConfusionThisTest(false);

    setBagW(3);
    setBagB(3);
    setDrawn([]);
  }

  const bagIsSecret = confusionThisTest;

  const canRisk =
    !riskActive && drawn.length === baseMaxDraw && baseMaxDraw < 5 && totalInBag > 0;

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-5xl p-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-4xl font-bold">NOT THE END - TOKEN BAG (W/B)</h1>
          <p className="text-zinc-700 text-sm">
            Sacchetto per prova: bianchi = tratti in gioco, neri = difficoltà.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* SETUP */}
          <section className="rounded-2xl bg-white border border-zinc-200 p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Setup Prova</h2>
              <button
                onClick={resetAll}
                className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-sm"
              >
                Reset
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="space-y-1">
                <div className="text-sm text-zinc-800">Tratti in gioco</div>
                <input
                  type="number"
                  min={0}
                  max={12}
                  value={traitsInPlay}
                  onChange={(e) =>
                    setTraitsInPlay(clampInt(parseInt(e.target.value, 10), 0, 12))
                  }
                  className="w-full rounded-xl bg-white border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
                />
                <div className="text-xs text-zinc-500">
                  Normale: +1 bianco per tratto. Confusione: 1 token casuale per tratto.
                </div>
              </label>

              <label className="space-y-1">
                <div className="text-sm text-zinc-800">Difficoltà</div>
                <select
                  value={difficultyId}
                  onChange={(e) => setDifficultyId(e.target.value)}
                  disabled={blackOverride}
                  className="w-full rounded-xl bg-white border border-zinc-200 px-3 py-2 outline-none disabled:opacity-60 focus:ring-2 focus:ring-zinc-200"
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
              <label className="flex items-center gap-2 text-sm text-zinc-800 select-none">
                <input
                  type="checkbox"
                  className="accent-zinc-900"
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
                onChange={(e) =>
                  setBlacksManual(clampInt(parseInt(e.target.value, 10), 0, 99))
                }
                disabled={!blackOverride}
                className="w-32 rounded-xl bg-white border border-zinc-200 px-3 py-2 outline-none disabled:opacity-60 focus:ring-2 focus:ring-zinc-200"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm text-zinc-800">Max pescate base (1–4)</label>
                <select
                  value={maxDraw}
                  onChange={(e) =>
                    setMaxDraw(clampInt(parseInt(e.target.value, 10), 1, 4))
                  }
                  className="w-24 rounded-xl bg-white border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm text-zinc-800 select-none">
                <input
                  type="checkbox"
                  className="accent-zinc-900"
                  checked={confusionNext}
                  onChange={(e) => setConfusionNext(e.target.checked)}
                />
                Confusione (prossima prova: tratti → token casuali)
              </label>

              {confusionNext && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2">
                  Confusione “in coda”: verrà consumata alla prossima “Nuova Prova”.
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={newTest}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-semibold"
              >
                Nuova Prova
              </button>

              <div className="text-sm text-zinc-700">
                Base: <span className="font-semibold">{inputWhites}</span> tratti +{" "}
                <span className="font-semibold">{inputBlacks}</span> neri
              </div>
            </div>
          </section>

          {/* SACCHETTO + PESCA */}
          <section className="rounded-2xl bg-white border border-zinc-200 p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Sacchetto</h2>
              <div className="text-sm text-zinc-700">
                Rimasti: <span className="font-semibold">{totalInBag}</span>
              </div>
            </div>

            {confusionThisTest && (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2">
                Confusione attiva: la composizione del sacchetto resta segreta.
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3">
                <div className="text-sm text-zinc-600">
                  {bagIsSecret ? "Bianchi (segreto)" : "Bianchi (successi)"}
                </div>
                <div className="text-2xl font-bold">{bagIsSecret ? "?" : bagW}</div>
              </div>

              <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3">
                <div className="text-sm text-zinc-600">
                  {bagIsSecret ? "Neri (segreto)" : "Neri"}
                </div>
                <div className="text-2xl font-bold">{bagIsSecret ? "?" : bagB}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={draw}
                disabled={!canDrawMore}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:bg-zinc-300 disabled:text-zinc-600 font-semibold"
              >
                Pesca 1
              </button>

              <button
                onClick={risk}
                disabled={!canRisk}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:bg-zinc-300 disabled:text-zinc-600 font-semibold"
                title="Dopo le pescate base puoi rischiare per arrivare a 5 totali"
              >
                Rischia (arriva a 5)*
              </button>

              <button
                onClick={() => {
                  setBagW(inputWhites);
                  setBagB(inputBlacks);
                  setDrawn([]);
                  setConfusionThisTest(false);
                  setRiskActive(false);
                }}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200"
              >
                Reimposta Prova
              </button>
            </div>

            <div>
              <p className="text-xs text-zinc-500">* Rischiare regala al narratore tutti i token neri estratti. Rischia solo quando è davvero importante!</p>
            </div>

            <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">
                  Pescati ({drawn.length}/{effectiveMaxDraw})
                </div>
                <div className="text-xs text-zinc-600">
                  {success ? "SUCCESSO (almeno 1 bianco)" : "nessun bianco → fallimento"}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {drawn.length === 0 ? (
                  <div className="text-sm text-zinc-500">Nessuna pescata.</div>
                ) : (
                  drawn.map((t, i) => (
                    <span
                      key={i}
                      className={
                        "inline-flex items-center justify-center h-8 w-8 rounded-full border " +
                        (t === "W"
                          ? "bg-white text-zinc-900 border-zinc-300"
                          : "bg-zinc-900 text-white border-zinc-900")
                      }
                      title={t === "W" ? "Bianco (successo)" : "Nero"}
                    >
                      {t}
                    </span>
                  ))
                )}
              </div>

              <div className="text-sm text-zinc-800">
                <div>
                  Successi: <span className="font-semibold">{drawnW}</span>{" "}
                  {drawnW > 0 && (
                    <span className="text-zinc-500">(extra miglioramento: {extraSuccess})</span>
                  )}
                </div>
                <div>
                  Neri: <span className="font-semibold">{complications}</span>{" "}
                  <span className="text-zinc-500">(da “spendere” secondo le regole)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200 space-y-2">
                <div className="text-sm text-zinc-700">
                  Per ogni token nero scegli una conseguenza:
                </div>

                <details className="rounded-xl bg-white border border-zinc-200 p-3">
                  <summary className="cursor-pointer font-semibold select-none">
                    Complicazione
                  </summary>
                  <div className="mt-2 text-sm text-zinc-600">
                    Il Narratore complica la scena: peggiora la situazione o alza la pressione narrativa.
                  </div>
                </details>

                <details className="rounded-xl bg-white border border-zinc-200 p-3">
                  <summary className="cursor-pointer font-semibold select-none">
                    Sventura (es. Ferita)
                  </summary>
                  <div className="mt-2 text-sm text-zinc-600">
                    Ottieni una sventura: resta finché non viene risolta; quando entra in gioco, aggiunge neri al sacchetto.
                  </div>
                </details>

                <details className="rounded-xl bg-white border border-zinc-200 p-3">
                  <summary className="cursor-pointer font-semibold select-none">
                    Adrenalina
                  </summary>
                  <div className="mt-2 text-sm text-zinc-600">
                    Metti 1 nero su Adrenalina: nella prossima prova sei obbligato a estrarre 4 token, poi si rimuove.
                  </div>
                </details>

                <details className="rounded-xl bg-white border border-zinc-200 p-3">
                  <summary className="cursor-pointer font-semibold select-none">
                    Confusione
                  </summary>
                  <div className="mt-2 text-sm text-zinc-600">
                    Metti 1 nero su Confusione: nella prossima prova i tratti non danno bianchi garantiti ma token casuali, poi si rimuove.
                  </div>
                </details>
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