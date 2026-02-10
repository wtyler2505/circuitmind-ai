import React, { memo } from 'react';
import { motion } from 'framer-motion';
import type { Quest } from '../../types';

export interface QuestCardProps {
  quest: Quest;
  status: 'available' | 'locked' | 'active' | 'completed';
  onStart?: () => void;
}

const CATEGORY_COLORS: Record<Quest['category'], { bg: string; text: string; border: string }> = {
  basics: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/40' },
  circuits: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/40' },
  programming: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/40' },
  advanced: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/40' },
};

const DIFFICULTY_STARS: Record<Quest['difficulty'], number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

function DifficultyStars({ difficulty }: { difficulty: Quest['difficulty'] }) {
  const count = DIFFICULTY_STARS[difficulty];
  return (
    <div className="flex items-center gap-0.5" aria-label={`Difficulty: ${difficulty}`}>
      {[1, 2, 3].map((i) => (
        <svg
          key={i}
          className={`h-3.5 w-3.5 ${i <= count ? 'text-amber-400' : 'text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function LockIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

const QuestCard: React.FC<QuestCardProps> = memo(function QuestCard({ quest, status, onStart }) {
  const categoryStyle = CATEGORY_COLORS[quest.category];
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isActive = status === 'active';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={[
        'relative rounded-xl border p-4 backdrop-blur-sm transition-colors',
        isLocked
          ? 'border-gray-700/50 bg-gray-900/60 opacity-60'
          : isCompleted
            ? 'border-green-500/30 bg-gray-900/50'
            : isActive
              ? 'border-cyan-400/60 bg-gray-800/70 shadow-lg shadow-cyan-500/20'
              : 'border-cyan-500/30 bg-gray-800/50 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10',
      ].join(' ')}
    >
      {/* Completed overlay */}
      {isCompleted && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-gray-900/40">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-green-400">
            <CheckIcon />
          </div>
        </div>
      )}

      {/* Active pulsing border indicator */}
      {isActive && (
        <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-cyan-400/40 animate-pulse" />
      )}

      {/* Header row: category badge + difficulty */}
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
        >
          {quest.category}
        </span>
        <DifficultyStars difficulty={quest.difficulty} />
      </div>

      {/* Title */}
      <h3 className="mb-1 font-sans text-base font-semibold text-gray-100">
        {isLocked && (
          <span className="mr-1.5 inline-block align-middle text-gray-500">
            <LockIcon />
          </span>
        )}
        {quest.title}
      </h3>

      {/* Description */}
      <p className="mb-3 text-sm leading-relaxed text-gray-400">{quest.description}</p>

      {/* Metadata row */}
      <div className="mb-3 flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1 font-mono">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          ~{quest.estimatedMinutes}m
        </span>
        <span className="flex items-center gap-1 font-mono">
          <svg className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
              clipRule="evenodd"
            />
          </svg>
          {quest.pointsReward} XP
        </span>
        {quest.badge && (
          <span className="flex items-center gap-1 font-mono text-purple-400">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Badge
          </span>
        )}
      </div>

      {/* Locked prerequisite info */}
      {isLocked && quest.prerequisites.length > 0 && (
        <p className="mb-3 text-xs italic text-gray-500">
          Requires: {quest.prerequisites.join(', ')}
        </p>
      )}

      {/* Action button */}
      {status === 'available' && onStart && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="w-full rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-cyan-400"
        >
          Start Quest
        </motion.button>
      )}

      {isActive && (
        <div className="mt-1 text-center text-xs font-medium text-cyan-400">In Progress</div>
      )}
    </motion.div>
  );
});

export default QuestCard;
