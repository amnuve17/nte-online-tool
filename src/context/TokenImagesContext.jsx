import { createContext, useContext, useState } from "react";

const STORAGE_KEY = "nte-token-images";

function loadInitial() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { white: null, black: null };
    const parsed = JSON.parse(raw);
    return { white: parsed.white || null, black: parsed.black || null };
  } catch {
    return { white: null, black: null };
  }
}

const TokenImagesContext = createContext(null);

export function TokenImagesProvider({ children }) {
  const [images, setImages] = useState(loadInitial);

  function setTokenImage(type, dataUrl) {
    setImages((prev) => {
      const next = { ...prev, [type]: dataUrl };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function clearTokenImage(type) {
    setTokenImage(type, null);
  }

  return (
    <TokenImagesContext.Provider
      value={{ images, setTokenImage, clearTokenImage }}
    >
      {children}
    </TokenImagesContext.Provider>
  );
}

export function useTokenImages() {
  const ctx = useContext(TokenImagesContext);
  if (!ctx) {
    throw new Error("useTokenImages must be used within a TokenImagesProvider");
  }
  return ctx;
}
