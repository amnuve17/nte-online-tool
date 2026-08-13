import { clampInt } from "./bagMath.js";

// Adatta lo stato di stanza sincronizzato (state.setup + state.test) alla
// stessa forma prodotta da useTokenBag, così DrawRecap/DrawSlot e il flusso
// di rivelazione si riusano identici sia in locale che in stanza.
export function deriveRoomBag(state, actions) {
  const setup = state.setup;
  const test = state.test;
  const baseMaxDraw = setup.adrenalineActive ? 4 : clampInt(setup.maxDraw, 1, 4);

  if (!test) {
    return {
      bagW: 0,
      bagB: 0,
      totalInBag: 0,
      bagIsSecret: false,
      canDrawMore: false,
      drawn: [],
      effectiveMaxDraw: baseMaxDraw,
      drawnW: 0,
      complications: 0,
      canRisk: false,
      riskActive: false,
      draw: actions.draw,
      risk: actions.risk,
      resetTest: actions.resetTest,
    };
  }

  const effectiveMaxDraw = test.riskActive ? 5 : baseMaxDraw;
  const totalInBag = test.bagW + test.bagB;
  const canDrawMore = test.drawn.length < effectiveMaxDraw && totalInBag > 0;
  const drawnW = test.drawn.filter((x) => x === "W").length;
  const complications = test.drawn.filter((x) => x === "B").length;
  const canRisk =
    !test.riskActive &&
    test.drawn.length === baseMaxDraw &&
    baseMaxDraw < 5 &&
    totalInBag > 0;

  return {
    bagW: test.bagW,
    bagB: test.bagB,
    totalInBag,
    bagIsSecret: test.confusionThisTest,
    canDrawMore,
    drawn: test.drawn,
    effectiveMaxDraw,
    drawnW,
    complications,
    canRisk,
    riskActive: test.riskActive,
    draw: actions.draw,
    risk: actions.risk,
    resetTest: actions.resetTest,
  };
}
