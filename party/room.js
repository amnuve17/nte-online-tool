import { DurableObject } from "cloudflare:workers";
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

// Archivia la prova corrente in cronologia prima che venga sovrascritta o
// azzerata (nuova selezione, cambio setup, reset o disconnessione del
// giocatore attivo). Ignora le prove senza estrazioni.
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

function initialState() {
  return {
    masterId: null,
    players: {},
    setup: { ...DEFAULT_ROOM_SETUP },
    activePlayerId: null,
    test: null,
    history: [],
  };
}

const STORAGE_KEY = "state";

// Durable Object nativo Cloudflare (sostituisce la classe Party.Server di
// PartyKit): stessa logica di gioco, ma gestiamo noi la connessione
// WebSocket, l'id di ogni client e la persistenza dello stato tra un
// "risveglio" e l'altro dell'oggetto (con PartyKit questo era automatico).
export class Room extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.state = initialState();
    ctx.blockConcurrencyWhile(async () => {
      const stored = await ctx.storage.get(STORAGE_KEY);
      if (stored) this.state = stored;
    });
  }

  async persist() {
    await this.ctx.storage.put(STORAGE_KEY, this.state);
  }

  broadcast() {
    const payload = JSON.stringify({ type: "state", state: this.state });
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(payload);
      } catch {
        // connessione morta, verrà ripulita da webSocketClose/Error
      }
    }
  }

  async fetch(request) {
    const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader !== "websocket") {
      return new Response("Expected websocket", { status: 426 });
    }

    // partysocket genera il proprio id lato client e lo manda come query
    // param `_pk` sull'URL di connessione (vedi node_modules/partysocket
    // /dist/index.js:163-164) — lo riusiamo come id di connessione così
    // combacia sempre con `socket.id` letto dal client (RoomContext.jsx),
    // da cui dipende il riconoscimento di master/giocatore attivo.
    const id = new URL(request.url).searchParams.get("_pk") || crypto.randomUUID();

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.serializeAttachment({ id });
    this.ctx.acceptWebSocket(server);
    server.send(JSON.stringify({ type: "state", state: this.state }));

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, message) {
    const { id: senderId } = ws.deserializeAttachment();
    let msg;
    try {
      msg = JSON.parse(message);
    } catch {
      return;
    }

    const isMaster = senderId === this.state.masterId;
    const isActivePlayer = senderId === this.state.activePlayerId;

    switch (msg.type) {
      case "join": {
        const nickname = String(msg.nickname || "?").slice(0, 24);
        const avatar = typeof msg.avatar === "string" ? msg.avatar : null;
        this.state.players[senderId] = { nickname, avatar };
        if (msg.role === "master" && !this.state.masterId) {
          this.state.masterId = senderId;
        }
        break;
      }

      case "setSetup": {
        if (!isMaster) return;
        archiveTest(this.state);
        this.state.setup = sanitizeSetup(msg.setup || {}, this.state.setup);
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

    await this.persist();
    this.broadcast();
  }

  async handleDisconnect(ws) {
    const attachment = ws.deserializeAttachment();
    if (!attachment) return;
    const { id: senderId } = attachment;

    delete this.state.players[senderId];
    if (this.state.masterId === senderId) this.state.masterId = null;
    if (this.state.activePlayerId === senderId) {
      archiveTest(this.state);
      this.state.activePlayerId = null;
      this.state.test = null;
    }

    await this.persist();
    this.broadcast();
  }

  async webSocketClose(ws) {
    await this.handleDisconnect(ws);
  }

  async webSocketError(ws) {
    await this.handleDisconnect(ws);
  }
}

// Worker "router": PartyKit instradava automaticamente /parties/:party/:room
// alla Durable Object giusta in base al nome stanza — qui lo facciamo a mano,
// mantenendo lo stesso schema di URL così il client (usePartySocket) non
// richiede alcuna modifica, solo un host diverso a cui puntare.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/parties\/[^/]+\/([^/]+)/);
    if (!match) {
      return new Response("Not found", { status: 404 });
    }
    const roomCode = match[1];
    const id = env.ROOMS.idFromName(roomCode);
    const stub = env.ROOMS.get(id);
    return stub.fetch(request);
  },
};
