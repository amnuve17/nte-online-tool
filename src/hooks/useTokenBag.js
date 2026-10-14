import { useMemo, useState } from "react";
import { useTranslations } from "../i18n/LanguageContext.jsx";
import {
  DIFFICULTY_BLACKS,
  clampInt,
  drawOneFromCounts,
  randomTraitTokens,
} from "../lib/bagMath.js";

export { clampInt };

const HISTORY_LIMIT = 30;

function buildDifficulty(t) {
  return Object.keys(DIFFICULTY_BLACKS).map((id) => ({
    id,
    label: t.difficulty[id],
    blacks: DIFFICULTY_BLACKS[id],
  }));
}

export default function useTokenBag() {
  const { t } = useTranslations();

  // --- input “regolamento” ---
  const [traitsInPlay, setTraitsInPlay] = useState(3);
  const [blacksValue, setBlacksValue] = useState(DIFFICULTY_BLACKS.normale);

  // --- opzioni prova ---
  const [maxDraw, setMaxDraw] = useState(4); // limite base 1–4
  const [adrenalineActive, setAdrenalineActive] = useState(false); // fissa le estrazioni base a 4

  // Rischio: si decide DOPO le estrazioni base, e porta a base+1 totali
  const [riskActive, setRiskActive] = useState(false);

  // Confusione: vale per la PROSSIMA prova; poi si consuma
  const [confusionNext, setConfusionNext] = useState(false);
  const [confusionThisTest, setConfusionThisTest] = useState(false);

  // --- avanzate (lezioni/abilità specifiche) ---
  // Bianchi bonus: si sommano ai tratti ma NON sono soggetti a confusione
  // (restano garantiti, come descritto dalle lezioni che li generano).
  const [bonusWhites, setBonusWhites] = useState(0);
  // Estrazioni bonus: si sommano al limite base (4), es. "Bisogna saper osare".
  const [bonusMaxDraw, setBonusMaxDraw] = useState(0);
  // Permesso di sbirciare il sacchetto anche se la prova è confusa; si
  // riconsuma a ogni nuova prova, come le altre concessioni delle lezioni.
  const [revealBag, setRevealBag] = useState(false);

  // --- stato prova corrente (sacchetto ed estrazioni) ---
  const [bagW, setBagW] = useState(3);
  const [bagB, setBagB] = useState(3);
  const [drawn, setDrawn] = useState([]); // ["W","B",...]
  const [history, setHistory] = useState([]);

  // Usata solo per mostrare il nome del grado di difficoltà accanto al
  // campo "Neri" quando il valore impostato coincide con uno standard.
  const difficultyOptions = useMemo(() => buildDifficulty(t), [t]);

  const inputBlacks = clampInt(blacksValue, 0, 99);

  const traitsWhites = clampInt(traitsInPlay, 0, 12);
  const bonusWhitesClamped = clampInt(bonusWhites, -5, 5);
  const inputWhites = Math.max(0, traitsWhites + bonusWhitesClamped);

  const bonusMaxDrawClamped = clampInt(bonusMaxDraw, 0, 2);
  const baseMaxDraw = (adrenalineActive ? 4 : clampInt(maxDraw, 1, 4)) + bonusMaxDrawClamped;
  // Il rischio porta sempre al tetto fisso di regolamento (5), non a
  // "baseMaxDraw + 1": se la prova richiedeva solo 2 estrazioni, rischiare
  // deve comunque portare a un totale di 5, non di 3.
  const effectiveMaxDraw = riskActive ? 5 + bonusMaxDrawClamped : baseMaxDraw;

  const totalInBag = bagW + bagB;
  const canDrawMore = drawn.length < effectiveMaxDraw && totalInBag > 0;

  const drawnW = drawn.filter((x) => x === "W").length;
  const drawnB = drawn.filter((x) => x === "B").length;

  const success = drawnW >= 1;
  const extraSuccess = Math.max(0, drawnW - 1);
  const complications = drawnB;

  // Archivia la prova corrente in cronologia prima che venga sovrascritta o
  // azzerata (nuova prova o reset). Ignora le prove senza estrazioni.
  function archiveCurrentTest() {
    if (drawn.length === 0) return;
    const entry = {
      id: crypto.randomUUID(),
      whites: drawnW,
      blacks: drawnB,
      adrenaline: adrenalineActive,
      confusion: confusionThisTest,
      risked: riskActive,
    };
    setHistory((prev) => [entry, ...prev].slice(0, HISTORY_LIMIT));
  }

  function newTest() {
    archiveCurrentTest();
    setDrawn([]);
    setRiskActive(false); // ogni nuova prova parte senza rischio
    setRevealBag(false); // il permesso di sbirciare si riconsuma ogni prova

    if (confusionNext) {
      // Solo i token dei tratti sono soggetti a confusione: i bianchi bonus
      // (lezioni) restano garantiti e si aggiungono dopo, senza essere
      // randomizzati.
      const { w, b } = randomTraitTokens(traitsWhites);
      setBagW(Math.max(0, w + bonusWhitesClamped));
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
    // puoi rischiare solo dopo aver completato le estrazioni base
    if (riskActive) return;
    if (drawn.length !== baseMaxDraw) return;
    if (totalInBag <= 0) return;
    setRiskActive(true); // ora puoi arrivare a 5 totali, stesso sacchetto
  }

  function resetTest() {
    archiveCurrentTest();
    setBagW(inputWhites);
    setBagB(inputBlacks);
    setDrawn([]);
    setConfusionThisTest(false);
    setRiskActive(false);
    setRevealBag(false);
  }

  function resetAll() {
    setTraitsInPlay(3);
    setBlacksValue(DIFFICULTY_BLACKS.normale);
    setMaxDraw(4);
    setBonusWhites(0);
    setBonusMaxDraw(0);
    setAdrenalineActive(false);

    setRiskActive(false);
    setRevealBag(false);

    setConfusionNext(false);
    setConfusionThisTest(false);

    setBagW(3);
    setBagB(3);
    setDrawn([]);
  }

  const bagIsSecret = confusionThisTest && !revealBag;

  const canRisk = !riskActive && drawn.length === baseMaxDraw && totalInBag > 0;

  return {
    difficultyOptions,
    traitsInPlay,
    setTraitsInPlay,
    blacksValue,
    setBlacksValue,
    maxDraw,
    setMaxDraw,
    bonusWhites,
    setBonusWhites,
    bonusMaxDraw,
    setBonusMaxDraw,
    revealBag,
    setRevealBag,
    adrenalineActive,
    setAdrenalineActive,
    confusionNext,
    setConfusionNext,
    confusionThisTest,
    bagW,
    bagB,
    drawn,
    history,
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
