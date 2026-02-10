import React, { memo, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuest } from '../../contexts/QuestContext';
import { useDiagram } from '../../contexts/DiagramContext';
import { validateQuest } from '../../services/questValidation';
import { questService } from '../../services/questService';

/**
 * ActiveQuestChecklist -- Floating overlay on the diagram canvas that
 * shows the active quest's validation rules as a live checklist.
 *
 * Auto-updates when the diagram changes. Only renders when there is
 * an active quest.
 */
const ActiveQuestChecklist: React.FC = memo(function ActiveQuestChecklist() {
  const { activeQuest, refreshProgress } = useQuest();
  const { diagram } = useDiagram();

  // Validate all rules against the current diagram
  const validationResult = useMemo(() => {
    if (!activeQuest || !diagram) return null;
    return validateQuest(activeQuest, diagram);
  }, [activeQuest, diagram]);

  // Abandon the current quest (set currentQuestId to null)
  const handleAbandon = useCallback(() => {
    const progress = questService.getProgress();
    progress.currentQuestId = null;
    questService.saveProgress(progress);
    refreshProgress();
  }, [refreshProgress]);

  return (
    <AnimatePresence>
      {activeQuest && validationResult && (
        <motion.div
          key="quest-checklist"
          initial={{ opacity: 0, x: 20, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 20, y: 20 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 right-6 z-40 w-72 rounded-xl border border-cyan-500/30 bg-gray-900/90 shadow-lg shadow-cyan-500/10 backdrop-blur-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-700/50 px-4 py-3">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-sans text-sm font-semibold text-gray-100">
                {activeQuest.title}
              </h3>
              <p className="text-xs text-gray-500">
                {validationResult.completedRules} / {validationResult.totalRules} tasks
              </p>
            </div>
            <button
              onClick={handleAbandon}
              className="ml-2 rounded-md px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-700/50 hover:text-gray-300"
              title="Abandon quest"
            >
              Abandon
            </button>
          </div>

          {/* Checklist */}
          <ul className="space-y-1 px-4 py-3">
            {validationResult.ruleResults.map((result, index) => (
              <motion.li
                key={index}
                initial={false}
                animate={result.passed ? { opacity: 1 } : { opacity: 1 }}
                className="flex items-start gap-2 text-xs"
              >
                {/* Status icon */}
                <span className="mt-0.5 flex-shrink-0">
                  {result.passed ? (
                    <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                  )}
                </span>

                {/* Rule text */}
                <span
                  className={
                    result.passed ? 'text-gray-400 line-through' : 'text-gray-300'
                  }
                >
                  {result.rule.description}
                </span>
              </motion.li>
            ))}
          </ul>

          {/* Progress bar */}
          <div className="px-4 pb-3">
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-700/60">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-green-400"
                initial={{ width: 0 }}
                animate={{ width: `${validationResult.completionPercent}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
            <p className="mt-1 text-right text-xs font-mono text-gray-500">
              {validationResult.completionPercent}%
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default ActiveQuestChecklist;
