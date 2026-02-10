import React, { memo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Quest } from '../../types';

export interface QuestCompletionModalProps {
  quest: Quest;
  onClose: () => void;
  onNextQuest?: () => void;
}

/**
 * QuestCompletionModal -- Celebration modal rendered as a portal
 * when a quest is completed.
 *
 * Features: confetti particles (pure CSS), badge display, animated
 * XP counter, next-quest and dashboard buttons.
 */
const QuestCompletionModal: React.FC<QuestCompletionModalProps> = memo(
  function QuestCompletionModal({ quest, onClose, onNextQuest }) {
    // Animated XP counter
    const [displayedXP, setDisplayedXP] = useState(0);

    useEffect(() => {
      const target = quest.pointsReward;
      const duration = 1200; // ms
      const steps = 30;
      const increment = target / steps;
      const interval = duration / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setDisplayedXP(target);
          clearInterval(timer);
        } else {
          setDisplayedXP(Math.round(current));
        }
      }, interval);

      return () => clearInterval(timer);
    }, [quest.pointsReward]);

    const content = (
      <AnimatePresence>
        {/* Inject confetti keyframe animation */}
        <style>{`
          @keyframes quest-confetti-fall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
          }
          .quest-confetti-particle {
            width: 8px;
            height: 8px;
            border-radius: 2px;
            top: -10px;
            animation-name: quest-confetti-fall;
            animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
            animation-fill-mode: forwards;
            animation-iteration-count: 1;
          }
        `}</style>
        <motion.div
          key="quest-completion-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Confetti particles */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="quest-confetti-particle absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 1.5}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  backgroundColor: ['#0ff', '#a855f7', '#22c55e', '#f59e0b', '#ec4899'][
                    i % 5
                  ],
                }}
              />
            ))}
          </div>

          {/* Modal card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative z-10 mx-4 w-full max-w-sm rounded-2xl border border-cyan-500/30 bg-gray-900 p-8 text-center shadow-2xl shadow-cyan-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Trophy / celebration icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.15 }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
            >
              <svg className="h-10 w-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </motion.div>

            {/* Title */}
            <h2 className="mb-2 font-sans text-xl font-bold text-gray-100">Quest Complete!</h2>
            <p className="mb-6 text-sm text-gray-400">{quest.title}</p>

            {/* XP earned */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-4 rounded-lg bg-gray-800/60 px-4 py-3"
            >
              <p className="text-xs text-gray-500">XP Earned</p>
              <p className="font-mono text-3xl font-bold text-amber-400">+{displayedXP}</p>
            </motion.div>

            {/* Badge earned */}
            {quest.badge && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', damping: 15 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2"
              >
                <svg className="h-5 w-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-purple-300">
                  Badge: {quest.badge}
                </span>
              </motion.div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              {onNextQuest && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onNextQuest}
                  className="w-full rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-cyan-400"
                >
                  Next Quest
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="w-full rounded-lg border border-gray-600 bg-transparent px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:border-gray-500 hover:bg-gray-800/50"
              >
                Back to Dashboard
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );

    return createPortal(content, document.body);
  }
);

export default QuestCompletionModal;
