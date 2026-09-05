"use client";

import React, { createContext, useContext, useState } from "react";

interface SiteChatContextProps {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
}

const SiteChatContext = createContext<SiteChatContextProps | undefined>(undefined);

export const SiteChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);

  return (
    <SiteChatContext.Provider value={{ isOpen, openChat, closeChat }}>
      {children}
    </SiteChatContext.Provider>
  );
};

export const useSiteChat = () => {
  const ctx = useContext(SiteChatContext);
  if (!ctx) {
    throw new Error("useSiteChat must be used within a SiteChatProvider");
  }
  return ctx;
};
