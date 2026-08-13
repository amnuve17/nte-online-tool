import {
  DEFAULT_ROOM_SETUP,
  DIFFICULTY_BLACKS,
  clampInt,
  drawOneFromCounts,
  randomTraitTokens,
} from "../src/lib/bagMath.js";

function sanitizeSetup(input, prev) {
  const s = { ...prev, ...input };
  return {
    traitsInPlay: clampInt(s.traitsInPlay, 0, 12),
    difficultyId: DIFFICULTY_BLACKS[s.difficultyId] ? s.difficultyId : "normale",
    blacksOverride: clampInt(s.blacksOverride, 0, 99),
    maxDraw: clampInt(s.maxDraw, 1, 4),
    adrenalineActive: !!s.adrenalineActive,
    confusionNext: !!s.confusionNext,
  };
}

function inputCounts(setup) {
  const inputWhites = clampInt(setup.traitsInPlay, 0, 12);
  const inputBlacks =
    setup.blacksOverride > 0
      ? clampInt(setup.blacksOverride, 0, 99)
      : DIFFICULTY_BLACKS[setup.difficultyId] ?? DIFFICULTY_BLACKS.normale;
  return { inputWhites, inputBlacks };
}

function baseMaxDrawOf(setup) {
  return setup.adrenalineActive ? 4 : clampInt(setup.maxDraw, 1, 4);
}

function startNewTest(state) {
  const { inputWhites, inputBlacks } = inputCounts(state.setup);
  if (state.setup.confusionNext) {
    const { w, b } = randomTraitTokens(inputWhites);
    state.test = {
      bagW: w,
      bagB: inputBlacks + b,
      drawn: [],
      riskActive: false,
      confusionThisTest: true,
    };
    state.setup = { ...state.setup, confusionNext: false };
    return;
  }
  state.test = {
    bagW: inputWhites,
    bagB: inputBlacks,
    drawn: [],
    riskActive: false,
    confusionThisTest: false,
  };
}

function resetTestState(state) {
  if (!state.test) return;
  const { inputWhites, inputBlacks } = inputCounts(state.setup);
  state.test = {
    bagW: inputWhites,
    bagB: inputBlacks,
    drawn: [],
    riskActive: false,
    confusionThisTest: false,
  };
}

function drawOne(state) {
  const test = state.test;
  if (!test) return;
  const baseMaxDraw = baseMaxDrawOf(state.setup);
  const effectiveMaxDraw = test.riskActive ? 5 : baseMaxDraw;
  const totalInBag = test.bagW + test.bagB;
  const canDrawMore = test.drawn.length < effectiveMaxDraw && totalInBag > 0;
  if (!canDrawMore) return;

  const token = drawOneFromCounts(test.bagW, test.bagB);
  if (!token) return;

  test.drawn.push(token);
  if (token === "W") test.bagW -= 1;
  else test.bagB -= 1;
}

function riskOne(state) {
  const test = state.test;
  if (!test || test.riskActive) return;
  const baseMaxDraw = baseMaxDrawOf(state.setup);
  const totalInBag = test.bagW + test.bagB;
  if (test.drawn.length !== baseMaxDraw) return;
  if (baseMaxDraw >= 5) return;
  if (totalInBag <= 0) return;
  test.riskActive = true;
}

const HISTORY_LIMIT = 30;

// Archivia la prova corrente nella cronologia della stanza prima che venga
// sovrascritta/azzerata (nuova selezione, cambio setup, reset o disconnessione
// del giocatore attivo). Ignora le prove senza estrazioni: non c'è nulla da mostrare.
function archiveTest(state) {
  const test = state.test;
  if (!test || test.drawn.length === 0) return;
  const player = state.activePlayerId ? state.players[state.activePlayerId] : null;
  state.history.unshift({
    id: crypto.randomUUID(),
    nickname: player?.nickname || "?",
    avatar: player?.avatar || null,
    whites: test.drawn.filter((x) => x === "W").length,
    blacks: test.drawn.filter((x) => x === "B").length,
    adrenaline: !!state.setup.adrenalineActive,
    confusion: !!test.confusionThisTest,
    risked: !!test.riskActive,
  });
  if (state.history.length > HISTORY_LIMIT) state.history.length = HISTORY_LIMIT;
}

export default class RoomServer {
  static options = { hibernate: true };

  constructor(room) {
    this.room = room;
    this.state = {
      masterId: null,
      players: {},
      setup: { ...DEFAULT_ROOM_SETUP },
      activePlayerId: null,
      test: null,
      history: [],
    };
  }

  send(conn) {
    conn.send(JSON.stringify({ type: "state", state: this.state }));
  }

  broadcast() {
    this.room.broadcast(JSON.stringify({ type: "state", state: this.state }));
  }

  onConnect(connection) {
    this.send(connection);
  }

  onClose(connection) {
    delete this.state.players[connection.id];
    if (this.state.masterId === connection.id) this.state.masterId = null;
    if (this.state.activePlayerId === connection.id) {
      archiveTest(this.state);
      this.state.activePlayerId = null;
      this.state.test = null;
    }
    this.broadcast();
  }

  onMessage(message, sender) {
    let msg;
    try {
      msg = JSON.parse(message);
    } catch {
      return;
    }

    const isMaster = sender.id === this.state.masterId;
    const isActivePlayer = sender.id === this.state.activePlayerId;

    switch (msg.type) {
      case "join": {
        const nickname = String(msg.nickname || "?").slice(0, 24);
        const avatar = typeof msg.avatar === "string" ? msg.avatar : null;
        this.state.players[sender.id] = { nickname, avatar };
        if (msg.role === "master" && !this.state.masterId) {
          this.state.masterId = sender.id;
        }
        break;
      }

      case "setSetup": {
        if (!isMaster) return;
        archiveTest(this.state);
        this.state.setup = sanitizeSetup(msg.setup || {}, this.state.setup);
        // Cambiare il setup invalida la selezione corrente: il giocatore
        // attivo va ri-selezionato esplicitamente per partire con la prova
        // aggiornata, ed evita che una prova in corso cambi parametri sotto i piedi.
        this.state.activePlayerId = null;
        this.state.test = null;
        break;
      }

      case "selectActivePlayer": {
        if (!isMaster) return;
        if (!this.state.players[msg.playerId]) return;
        archiveTest(this.state);
        this.state.activePlayerId = msg.playerId;
        startNewTest(this.state);
        break;
      }

      case "draw": {
        if (!isActivePlayer) return;
        drawOne(this.state);
        break;
      }

      case "risk": {
        if (!isActivePlayer) return;
        riskOne(this.state);
        break;
      }

      case "resetTest": {
        if (!isMaster) return;
        archiveTest(this.state);
        resetTestState(this.state);
        break;
      }

      default:
        return;
    }

    this.broadcast();
  }
}
