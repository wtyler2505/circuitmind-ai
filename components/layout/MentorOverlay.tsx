import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutorial } from '../../contexts/TutorialContext';

export const MentorOverlay: React.FC = () => {
  const { activeQuest, currentStepIndex } = useTutorial();

  if (!activeQuest) return null;

  const currentStep = activeQuest.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / activeQuest.steps.length) * 100;

  return (
    <div className="fixed bottom-24 right-6 w-80 z-40 pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className="pointer-events-auto panel-surface border border-neon-cyan/30 cut-corner-md p-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col gap-3 overflow-hidden relative"
        >
          {/* Progress bar at top */}
          <div className="absolute top-0 left-0 h-1 bg-neon-cyan/20 w-full">
            <motion.div 
              className="h-full bg-neon-cyan shadow-[0_0_8px_#00f3ff]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] font-bold text-neon-cyan uppercase tracking-[0.2em]">
              Quest: {activeQuest.title}
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {currentStepIndex + 1} / {activeQuest.steps.length}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {currentStep.title}
            </h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {currentStep.instructions}
            </p>
          </div>

          {currentStep.mentorTip && (
            <div className="mt-2 p-2 bg-neon-purple/5 border-l-2 border-neon-purple/50 text-[10px] text-neon-purple/80 italic leading-snug">
              <span className="font-bold not-italic mr-1">MENTOR:</span>
              {currentStep.mentorTip}
            </div>
          )}

          <div className="flex justify-end mt-2">
            <div className="loading-tech scale-50 opacity-40"></div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
