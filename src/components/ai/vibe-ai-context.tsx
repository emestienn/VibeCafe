"use client";

import { createContext, useContext, useState } from "react";

type VibeAiContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  pendingMessage: string | null;
  ask: (text: string) => void;
  consumePending: () => string | null;
};

const VibeAiContext = createContext<VibeAiContextValue | null>(null);

export function VibeAiProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const ask = (text: string) => {
    setPendingMessage(text);
    setOpen(true);
  };

  const consumePending = () => {
    const msg = pendingMessage;
    setPendingMessage(null);
    return msg;
  };

  return (
    <VibeAiContext.Provider value={{ open, setOpen, pendingMessage, ask, consumePending }}>
      {children}
    </VibeAiContext.Provider>
  );
}

export function useVibeAi() {
  const ctx = useContext(VibeAiContext);
  if (!ctx) throw new Error("useVibeAi must be used within VibeAiProvider");
  return ctx;
}
