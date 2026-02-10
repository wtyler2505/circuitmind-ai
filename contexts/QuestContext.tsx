import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Quest, UserProgress } from '../types';
import { questService } from '../services/questService';
import { STARTER_QUESTS } from '../data/quests';

interface QuestContextValue {
  // State
  userProgress: UserProgress;
  availableQuests: Quest[];
  allQuests: Quest[];
  activeQuest: Quest | null;

  // Actions
  startQuest: (questId: string) => void;
  completeQuest: (questId: string) => void;
  completeTutorial: (tutorialId: string) => void;
  resetProgress: () => void;
  refreshProgress: () => void;
}

const QuestContext = createContext<QuestContextValue | null>(null);

function deriveActiveQuest(progress: UserProgress): Quest | null {
  if (!progress.currentQuestId) return null;
  return STARTER_QUESTS.find((q) => q.id === progress.currentQuestId) ?? null;
}

export const QuestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProgress, setUserProgress] = useState<UserProgress>(() => questService.getProgress());
  const [availableQuests, setAvailableQuests] = useState<Quest[]>(() => questService.getAvailableQuests());
  const [allQuests] = useState<Quest[]>(() => questService.getAllQuests());
  const [activeQuest, setActiveQuest] = useState<Quest | null>(() => deriveActiveQuest(questService.getProgress()));

  /** Re-read all derived state from the service (which reads localStorage). */
  const refreshProgress = useCallback(() => {
    const progress = questService.getProgress();
    setUserProgress(progress);
    setAvailableQuests(questService.getAvailableQuests());
    setActiveQuest(deriveActiveQuest(progress));
  }, []);

  /** Refresh derived state from a known progress object (avoids extra localStorage read). */
  const refreshFromProgress = useCallback((progress: UserProgress) => {
    setUserProgress(progress);
    setAvailableQuests(questService.getAvailableQuests());
    setActiveQuest(deriveActiveQuest(progress));
  }, []);

  const startQuest = useCallback(
    (questId: string) => {
      const updated = questService.startQuest(questId);
      refreshFromProgress(updated);
    },
    [refreshFromProgress]
  );

  const completeQuest = useCallback(
    (questId: string) => {
      const updated = questService.completeQuest(questId);
      refreshFromProgress(updated);
    },
    [refreshFromProgress]
  );

  const completeTutorial = useCallback(
    (tutorialId: string) => {
      const updated = questService.completeTutorial(tutorialId);
      refreshFromProgress(updated);
    },
    [refreshFromProgress]
  );

  const resetProgress = useCallback(() => {
    const fresh = questService.resetProgress();
    refreshFromProgress(fresh);
  }, [refreshFromProgress]);

  // Sync if localStorage changes externally (e.g. another tab)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'cm_quest_progress') {
        refreshProgress();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [refreshProgress]);

  return (
    <QuestContext.Provider
      value={{
        userProgress,
        availableQuests,
        allQuests,
        activeQuest,
        startQuest,
        completeQuest,
        completeTutorial,
        resetProgress,
        refreshProgress,
      }}
    >
      {children}
    </QuestContext.Provider>
  );
};

export function useQuest(): QuestContextValue {
  const context = useContext(QuestContext);
  if (context === null) {
    throw new Error('useQuest must be used within a QuestProvider');
  }
  return context;
}
