import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuest } from '../../contexts/QuestContext';
import type { Quest } from '../../types';
import QuestCard from './QuestCard';

/**
 * QuestDashboard -- Grid layout showing all quests organized by status.
 *
 * Sections: Available, Locked, Completed.
 * Header displays user level, XP, badges, and an XP progress bar.
 */
const QuestDashboard: React.FC = memo(function QuestDashboard() {
  const { userProgress, availableQuests, allQuests, activeQuest, startQuest } = useQuest();

  // Partition quests into buckets
  const { available, locked, completed } = useMemo(() => {
    const completedIds = new Set(userProgress.completedQuests);
    const availableIds = new Set(availableQuests.map((q) => q.id));

    const result: { available: Quest[]; locked: Quest[]; completed: Quest[] } = {
      available: [],
      locked: [],
      completed: [],
    };

    for (const quest of allQuests) {
      if (completedIds.has(quest.id)) {
        result.completed.push(quest);
      } else if (availableIds.has(quest.id)) {
        result.available.push(quest);
      } else {
        result.locked.push(quest);
      }
    }

    return result;
  }, [allQuests, availableQuests, userProgress.completedQuests]);

  // XP progress toward next level (every 3 quests = 1 level)
  const completedCount = userProgress.completedQuests.length;
  const questsInCurrentLevel = completedCount % 3;
  const xpProgressPercent = Math.round((questsInCurrentLevel / 3) * 100);

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-gray-900/80 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="mb-4 font-sans text-2xl font-bold text-gray-100">Quest Board</h1>

        {/* User stats row */}
        <div className="mb-4 flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 font-mono text-sm font-bold text-cyan-400">
              {userProgress.skillLevel}
            </span>
            <span className="text-gray-400">Level</span>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <span className="text-amber-400">{userProgress.totalPoints}</span>
            <span className="text-gray-500">XP</span>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <svg className="h-4 w-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-purple-400">{userProgress.badgesEarned.length}</span>
            <span className="text-gray-500">Badges</span>
          </div>
        </div>

        {/* XP progress bar */}
        <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
          <span>Level {userProgress.skillLevel}</span>
          <span>Level {userProgress.skillLevel + 1}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-700/60">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgressPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {questsInCurrentLevel} / 3 quests to next level
        </p>
      </motion.div>

      {/* Available Quests */}
      {available.length > 0 && (
        <Section title="Available Quests" count={available.length}>
          {available.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              status={activeQuest?.id === quest.id ? 'active' : 'available'}
              onStart={() => startQuest(quest.id)}
            />
          ))}
        </Section>
      )}

      {/* Locked Quests */}
      {locked.length > 0 && (
        <Section title="Locked Quests" count={locked.length}>
          {locked.map((quest) => (
            <QuestCard key={quest.id} quest={quest} status="locked" />
          ))}
        </Section>
      )}

      {/* Completed Quests */}
      {completed.length > 0 && (
        <Section title="Completed Quests" count={completed.length}>
          {completed.map((quest) => (
            <QuestCard key={quest.id} quest={quest} status="completed" />
          ))}
        </Section>
      )}

      {/* Empty state */}
      {allQuests.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">No quests available yet.</p>
        </div>
      )}
    </div>
  );
});

/**
 * Reusable section wrapper with title and grid layout.
 */
function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-gray-400">
          {title}
        </h2>
        <span className="rounded-full bg-gray-700/60 px-2 py-0.5 text-xs font-mono text-gray-400">
          {count}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}

export default QuestDashboard;
