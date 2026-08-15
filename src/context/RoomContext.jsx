import { createContext, useContext, useMemo, useState } from "react";
import { usePartySocket } from "partysocket/react";

// In sviluppo punta al server locale avviato con `npm run party`
// (wrangler dev, porta 8787). Dopo `wrangler deploy`, imposta
// VITE_PARTYKIT_HOST all'host del dominio collegato al Worker.
const ROOM_HOST = import.meta.env.VITE_PARTYKIT_HOST || "127.0.0.1:8787";

const RoomContext = createContext(null);

export function RoomProvider({ roomCode, role, identity, children }) {
  const [state, setState] = useState(null);
  const [connected, setConnected] = useState(false);

  const socket = usePartySocket({
    host: ROOM_HOST,
    room: roomCode,
    onOpen() {
      setConnected(true);
      socket.send(
        JSON.stringify({
          type: "join",
          role,
          nickname: identity.nickname,
          avatar: identity.avatar,
        })
      );
    },
    onMessage(event) {
      const msg = JSON.parse(event.data);
      if (msg.type === "state") setState(msg.state);
    },
    onClose() {
      setConnected(false);
    },
  });

  const myId = socket.id;
  const isMaster = !!state && state.masterId === myId;

  const actions = useMemo(
    () => ({
      setSetup(setup) {
        socket.send(JSON.stringify({ type: "setSetup", setup }));
      },
      selectActivePlayer(playerId) {
        socket.send(JSON.stringify({ type: "selectActivePlayer", playerId }));
      },
      draw() {
        socket.send(JSON.stringify({ type: "draw" }));
      },
      risk() {
        socket.send(JSON.stringify({ type: "risk" }));
      },
      resetTest() {
        socket.send(JSON.stringify({ type: "resetTest" }));
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [socket]
  );

  return (
    <RoomContext.Provider value={{ state, connected, myId, isMaster, actions }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const ctx = useContext(RoomContext);
  if (!ctx) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return ctx;
}
