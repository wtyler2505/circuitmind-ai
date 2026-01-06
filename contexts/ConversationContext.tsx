import React, { createContext, useContext, ReactNode } from 'react';
import { useConversations, UseConversationsReturn } from '../hooks/useConversations';

const ConversationContext = createContext<UseConversationsReturn | undefined>(undefined);

export const ConversationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const conversationState = useConversations();
  return (
    <ConversationContext.Provider value={conversationState}>
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversationContext = () => {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversationContext must be used within a ConversationProvider');
  }
  return context;
};
