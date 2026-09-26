'use client';
import { createContext, useContext } from 'react';

const TranslationContext = createContext<any>(null);

export function TranslationProvider({ messages, children }: { messages: any, children: React.ReactNode }) {
  return <TranslationContext.Provider value={messages}>{children}</TranslationContext.Provider>;
}

export function useTranslation(namespace: string) {
  const messages = useContext(TranslationContext);
  if (!messages) return (key: string) => key;
  const scoped = messages[namespace] || {};
  return (key: string) => scoped[key] || key;
}
