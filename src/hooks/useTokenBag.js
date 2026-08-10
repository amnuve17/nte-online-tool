import { useMemo, useState } from "react";
import { useTranslations } from "../i18n/LanguageContext.jsx";

function buildDifficulty(t) {
  return [
    { id: "facilissima", label: t.difficulty.facilissima, blacks: 1 },
    { id: "facile", label: t.difficulty.facile, blacks: 2 },
    { id: "normale", label: t.difficulty.normale, blacks: 3 },
    { id: "difficile", label: t.difficulty.difficile, blacks: 4 },
    { id: "difficilissima", label: t.difficulty.difficilissima, blacks: 5 },
    { id: "quasi_impossibile", label: t.difficulty.quasi_impossibile, blacks: 6 },
  ];
}

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
function randomTraitTokens(nTraits) {
  let w = 0,
    b = 0;
  for (let i = 0; i < nTraits; i++) {
    if (randInt(2) === 0) w++;
    else b++;
  }
  return { w, b };
}

export default function useTokenBag() {
  const { t } = useTranslations();

  // --- input “regolamento” ---
  const [traitsInPlay, setTraitsInPlay] = useState(3);
  const [difficultyId, setDifficultyId] = useState("");
  const [blacksOverride, setBlacksOverride] = useState(0); // 0 = nessun override

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

  const difficultyOptions = useMemo(() => buildDifficulty(t), [t]);

  const difficulty = useMemo(
    () =>
      difficultyOptions.find((d) => d.id === difficultyId) ||
      difficultyOptions[2],
    [difficultyOptions, difficultyId]
  );

  const inputBlacks =
    blacksOverride > 0 ? clampInt(blacksOverride, 0, 99) : difficulty.blacks;

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
    const token = drawOneFromCounts(bagW, bagB);
    if (!token) return;

    setDrawn((prev) => [...prev, token]);
    if (token === "W") setBagW((x) => x - 1);
    else setBagB((x) => x - 1);
  }

  function risk() {
    // puoi rischiare solo dopo aver completato le pescate base
    if (riskActive) return;
    if (drawn.length !== baseMaxDraw) return;
    if (totalInBag <= 0) return;
    setRiskActive(true); // ora puoi arrivare a 5 totali, stesso sacchetto
  }

  function resetTest() {
    setBagW(inputWhites);
    setBagB(inputBlacks);
    setDrawn([]);
    setConfusionThisTest(false);
    setRiskActive(false);
  }

  function resetAll() {
    setTraitsInPlay(3);
    setDifficultyId("");
    setBlacksOverride(0);
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
    !riskActive &&
    drawn.length === baseMaxDraw &&
    baseMaxDraw < 5 &&
    totalInBag > 0;

  return {
    difficultyOptions,
    traitsInPlay,
    setTraitsInPlay,
    difficultyId,
    setDifficultyId,
    blacksOverride,
    setBlacksOverride,
    maxDraw,
    setMaxDraw,
    confusionNext,
    setConfusionNext,
    confusionThisTest,
    bagW,
    bagB,
    drawn,
    inputWhites,
    inputBlacks,
    baseMaxDraw,
    effectiveMaxDraw,
    totalInBag,
    canDrawMore,
    drawnW,
    drawnB,
    success,
    extraSuccess,
    complications,
    bagIsSecret,
    canRisk,
    riskActive,
    newTest,
    draw,
    risk,
    resetTest,
    resetAll,
  };
}
