import { useEffect, useState } from "react";
import AutoriScreen from "./components/AutoriScreen.jsx";
import EstrazioneScreen from "./components/EstrazioneScreen.jsx";
import ImpostazioniScreen from "./components/ImpostazioniScreen.jsx";
import Landing from "./components/Landing.jsx";
import NavMenu from "./components/NavMenu.jsx";
import RoomScreen from "./components/RoomScreen.jsx";
import SetupScreen from "./components/SetupScreen.jsx";
import useTokenBag from "./hooks/useTokenBag.js";

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [menuOpen, setMenuOpen] = useState(false);
  const bag = useTokenBag();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  function navigate(next) {
    setScreen(next);
    setMenuOpen(false);
  }

  const menu = (
    <NavMenu
      open={menuOpen}
      current={screen}
      onNavigate={navigate}
      onClose={() => setMenuOpen(false)}
    />
  );

  if (screen === "setup") {
    return (
      <>
        <SetupScreen
          bag={bag}
          onMenuClick={() => setMenuOpen(true)}
          onEstrai={() => navigate("estrazione")}
          onNavigate={navigate}
        />
        {menu}
      </>
    );
  }

  if (screen === "estrazione") {
    return (
      <>
        <EstrazioneScreen
          bag={bag}
          onMenuClick={() => setMenuOpen(true)}
          onNavigate={navigate}
        />
        {menu}
      </>
    );
  }

  if (screen === "autori") {
    return (
      <>
        <AutoriScreen
          onMenuClick={() => setMenuOpen(true)}
          onNavigate={navigate}
        />
        {menu}
      </>
    );
  }

  if (screen === "impostazioni") {
    return (
      <>
        <ImpostazioniScreen
          onMenuClick={() => setMenuOpen(true)}
          onNavigate={navigate}
        />
        {menu}
      </>
    );
  }

  if (screen === "stanza") {
    return (
      <>
        <RoomScreen onMenuClick={() => setMenuOpen(true)} onNavigate={navigate} />
        {menu}
      </>
    );
  }

  return <Landing onStart={() => navigate("setup")} onNavigate={navigate} />;
}
