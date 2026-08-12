import { createContext, useContext, useEffect, useState } from "react";
import { THEMES } from "../lib/theme.js";

const STORAGE_KEY = "nte-theme";
const DEFAULT_THEME = "rosso";
const VALID_THEMES = THEMES.map((t) => t.id);

function detectInitialTheme() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return VALID_THEMES.includes(stored) ? stored : DEFAULT_THEME;
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(detectInitialTheme);

  function setTheme(id) {
    if (!VALID_THEMES.includes(id)) return;
    setThemeState(id);
    window.localStorage.setItem(STORAGE_KEY, id);
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
