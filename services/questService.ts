import { Quest, UserProgress, Tutorial } from '../types';
import { STARTER_QUESTS } from '../data/quests';
import { GUIDED_TUTORIALS } from '../data/guidedTutorials';

const STORAGE_KEY = 'cm_quest_progress';

function createDefaultProgress(): UserProgress {
  return {
    completedQuests: [],
    currentQuestId: null,
    skillLevel: 1,
    totalPoints: 0,
    badgesEarned: [],
    tutorialsCompleted: [],
    startedAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
  };
}

/**
 * Quest system service — manages quest/tutorial data and user progress
 * via localStorage persistence.
 */
export const questService = {
  /** Load user progress from localStorage, or return defaults. */
  getProgress(): UserProgress {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as UserProgress;
      }
    } catch {
      // Corrupt data — fall through to defaults
    }
    return createDefaultProgress();
  },

  /** Persist user progress to localStorage. */
  saveProgress(progress: UserProgress): void {
    const updated: UserProgress = {
      ...progress,
      lastActivityAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  /** Mark a quest as started (sets currentQuestId). */
  startQuest(questId: string): UserProgress {
    const quest = STARTER_QUESTS.find((q) => q.id === questId);
    if (!quest) {
      throw new Error(`Quest not found: ${questId}`);
    }

    const progress = this.getProgress();

    // Verify prerequisites are met
    const unmetPrereqs = quest.prerequisites.filter(
      (prereq) => !progress.completedQuests.includes(prereq)
    );
    if (unmetPrereqs.length > 0) {
      throw new Error(
        `Prerequisites not met: ${unmetPrereqs.join(', ')}`
      );
    }

    progress.currentQuestId = questId;
    this.saveProgress(progress);
    return progress;
  },

  /** Mark a quest as completed, award points and badge. */
  completeQuest(questId: string): UserProgress {
    const quest = STARTER_QUESTS.find((q) => q.id === questId);
    if (!quest) {
      throw new Error(`Quest not found: ${questId}`);
    }

    const progress = this.getProgress();

    // Idempotent — don't double-count
    if (progress.completedQuests.includes(questId)) {
      return progress;
    }

    progress.completedQuests.push(questId);
    progress.totalPoints += quest.pointsReward;

    if (quest.badge && !progress.badgesEarned.includes(quest.badge)) {
      progress.badgesEarned.push(quest.badge);
    }

    // Advance skill level every 3 completed quests
    progress.skillLevel = Math.floor(progress.completedQuests.length / 3) + 1;

    // Clear currentQuestId if it was the one just completed
    if (progress.currentQuestId === questId) {
      progress.currentQuestId = null;
    }

    this.saveProgress(progress);
    return progress;
  },

  /** Mark a tutorial as completed. */
  completeTutorial(tutorialId: string): UserProgress {
    const tutorial = GUIDED_TUTORIALS.find((t) => t.id === tutorialId);
    if (!tutorial) {
      throw new Error(`Tutorial not found: ${tutorialId}`);
    }

    const progress = this.getProgress();

    // Idempotent
    if (progress.tutorialsCompleted.includes(tutorialId)) {
      return progress;
    }

    progress.tutorialsCompleted.push(tutorialId);
    this.saveProgress(progress);
    return progress;
  },

  /**
   * Return quests whose prerequisites are all satisfied by the user's
   * completed quests (i.e., quests the user is eligible to start).
   */
  getAvailableQuests(): Quest[] {
    const progress = this.getProgress();
    return STARTER_QUESTS.filter((quest) => {
      // Already completed — not "available"
      if (progress.completedQuests.includes(quest.id)) {
        return false;
      }
      // All prerequisites must be completed
      return quest.prerequisites.every((prereq) =>
        progress.completedQuests.includes(prereq)
      );
    });
  },

  /** Return all quests. */
  getAllQuests(): Quest[] {
    return STARTER_QUESTS;
  },

  /** Return all tutorials. */
  getAllTutorials(): Tutorial[] {
    return GUIDED_TUTORIALS;
  },

  /** Return tutorials available based on prerequisite quests. */
  getAvailableTutorials(): Tutorial[] {
    const progress = this.getProgress();
    return GUIDED_TUTORIALS.filter((tutorial) => {
      if (!tutorial.prerequisiteQuest) {
        return true;
      }
      return progress.completedQuests.includes(tutorial.prerequisiteQuest);
    });
  },

  /** Reset all progress to defaults. */
  resetProgress(): UserProgress {
    const fresh = createDefaultProgress();
    this.saveProgress(fresh);
    return fresh;
  },
};
