import React, { useEffect, useState, useCallback, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import { Tutorial, TutorialStep } from '../../types';

export interface TutorialOverlayProps {
  tutorial: Tutorial;
  currentStepIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const SPOTLIGHT_PADDING = 8;
const TOOLTIP_GAP = 12;
const TOOLTIP_WIDTH = 360;

/**
 * Finds the target element for a tutorial step using either
 * targetSelector (CSS selector) or targetElementId.
 */
function findTargetElement(step: TutorialStep): Element | null {
  if (step.targetSelector) {
    return document.querySelector(step.targetSelector);
  }
  if (step.targetElementId) {
    return document.getElementById(step.targetElementId);
  }
  return null;
}

/**
 * Calculates tooltip position relative to the target element
 * based on the step's placement directive.
 */
function calculateTooltipPosition(
  targetRect: TargetRect | null,
  placement: TutorialStep['placement'],
  tooltipWidth: number,
  tooltipHeight: number
): { top: number; left: number } {
  // No target or center placement -- center on screen
  if (!targetRect || placement === 'center') {
    return {
      top: Math.max(16, (window.innerHeight - tooltipHeight) / 2),
      left: Math.max(16, (window.innerWidth - tooltipWidth) / 2),
    };
  }

  const centerX = targetRect.left + targetRect.width / 2;
  const centerY = targetRect.top + targetRect.height / 2;

  let top = 0;
  let left = 0;

  switch (placement) {
    case 'top':
      top = targetRect.top - SPOTLIGHT_PADDING - TOOLTIP_GAP - tooltipHeight;
      left = centerX - tooltipWidth / 2;
      break;
    case 'bottom':
      top = targetRect.top + targetRect.height + SPOTLIGHT_PADDING + TOOLTIP_GAP;
      left = centerX - tooltipWidth / 2;
      break;
    case 'left':
      top = centerY - tooltipHeight / 2;
      left = targetRect.left - SPOTLIGHT_PADDING - TOOLTIP_GAP - tooltipWidth;
      break;
    case 'right':
      top = centerY - tooltipHeight / 2;
      left = targetRect.left + targetRect.width + SPOTLIGHT_PADDING + TOOLTIP_GAP;
      break;
  }

  // Clamp to viewport bounds
  const margin = 16;
  top = Math.max(margin, Math.min(top, window.innerHeight - tooltipHeight - margin));
  left = Math.max(margin, Math.min(left, window.innerWidth - tooltipWidth - margin));

  return { top, left };
}

/**
 * Returns a human-readable hint for the current action type.
 */
function getActionHint(action?: TutorialStep['action']): string | null {
  switch (action) {
    case 'click':
      return 'Click to continue';
    case 'drag':
      return 'Drag to continue';
    case 'type':
      return 'Type to continue';
    case 'observe':
      return 'Take a look, then proceed';
    default:
      return null;
  }
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = memo(function TutorialOverlay({
  tutorial,
  currentStepIndex,
  onNext,
  onPrev,
  onSkip,
  onComplete,
}) {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [tooltipHeight, setTooltipHeight] = useState(200);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = tutorial.steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === tutorial.steps.length - 1;
  const totalSteps = tutorial.steps.length;

  /**
   * Measures the target element and updates the spotlight rect.
   */
  const measureTarget = useCallback(() => {
    if (!step) {
      setTargetRect(null);
      return;
    }

    const el = findTargetElement(step);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setTargetRect(null);
    }
  }, [step]);

  // Measure on step change and window resize
  useEffect(() => {
    measureTarget();

    window.addEventListener('resize', measureTarget);
    window.addEventListener('scroll', measureTarget, true);

    // Re-measure periodically in case of layout shifts (e.g., animations settling)
    const interval = setInterval(measureTarget, 500);

    return () => {
      window.removeEventListener('resize', measureTarget);
      window.removeEventListener('scroll', measureTarget, true);
      clearInterval(interval);
    };
  }, [measureTarget]);

  // Track tooltip height for accurate positioning
  useEffect(() => {
    if (tooltipRef.current) {
      const measured = tooltipRef.current.getBoundingClientRect().height;
      if (measured > 0 && measured !== tooltipHeight) {
        setTooltipHeight(measured);
      }
    }
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (isLastStep) {
          onComplete();
        } else {
          onNext();
        }
      } else if (e.key === 'ArrowLeft') {
        if (!isFirstStep) {
          onPrev();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFirstStep, isLastStep, onNext, onPrev, onSkip, onComplete]);

  if (!step) return null;

  const tooltipPos = calculateTooltipPosition(
    targetRect,
    step.placement,
    TOOLTIP_WIDTH,
    tooltipHeight
  );

  const actionHint = getActionHint(step.action);

  // Build the SVG mask for the spotlight cutout
  const spotlightMask = targetRect ? (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 9998 }}
      aria-hidden="true"
    >
      <defs>
        <mask id="tutorial-spotlight-mask">
          {/* White = visible (the dark overlay) */}
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          {/* Black = transparent (the cutout) */}
          <rect
            x={targetRect.left - SPOTLIGHT_PADDING}
            y={targetRect.top - SPOTLIGHT_PADDING}
            width={targetRect.width + SPOTLIGHT_PADDING * 2}
            height={targetRect.height + SPOTLIGHT_PADDING * 2}
            rx="6"
            ry="6"
            fill="black"
          />
        </mask>
      </defs>
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="rgba(0,0,0,0.75)"
        mask="url(#tutorial-spotlight-mask)"
      />
      {/* Spotlight border glow */}
      <rect
        x={targetRect.left - SPOTLIGHT_PADDING}
        y={targetRect.top - SPOTLIGHT_PADDING}
        width={targetRect.width + SPOTLIGHT_PADDING * 2}
        height={targetRect.height + SPOTLIGHT_PADDING * 2}
        rx="6"
        ry="6"
        fill="none"
        stroke="rgba(0,229,255,0.4)"
        strokeWidth="2"
      />
    </svg>
  ) : (
    // No target -- full dark overlay
    <div
      className="fixed inset-0"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 9998 }}
      aria-hidden="true"
    />
  );

  // Prevent clicks on the backdrop from propagating
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const overlay = (
    <>
      {/* Backdrop with spotlight cutout */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 9997 }}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      {spotlightMask}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        role="dialog"
        aria-label={`Tutorial: ${tutorial.title}`}
        aria-describedby="tutorial-step-description"
        className="fixed bg-gray-900 border border-cyan-500/50 rounded-lg shadow-lg p-5"
        style={{
          zIndex: 9999,
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: TOOLTIP_WIDTH,
          maxWidth: 'calc(100vw - 32px)',
          boxShadow: '0 4px 24px rgba(0, 229, 255, 0.2), 0 0 0 1px rgba(0, 229, 255, 0.1)',
        }}
      >
        {/* Step counter */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-cyan-400 text-xs font-mono tracking-wide">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
          <button
            type="button"
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-200 text-xs transition-colors"
            aria-label="Skip tutorial"
          >
            Skip
          </button>
        </div>

        {/* Title */}
        <h3 className="text-white text-base font-bold mb-2 leading-snug">
          {step.title}
        </h3>

        {/* Description */}
        <p
          id="tutorial-step-description"
          className="text-gray-300 text-sm leading-relaxed mb-3"
        >
          {step.description}
        </p>

        {/* Instructions (if different from description) */}
        {step.instructions && step.instructions !== step.description && (
          <p className="text-gray-400 text-sm italic mb-3">{step.instructions}</p>
        )}

        {/* Action hint */}
        {actionHint && (
          <div className="flex items-center gap-1.5 mb-3">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-300 text-xs font-mono">{actionHint}</span>
          </div>
        )}

        {/* Mentor tip */}
        {step.mentorTip && (
          <div className="bg-cyan-950/40 border border-cyan-800/30 rounded px-3 py-2 mb-3">
            <span className="text-cyan-300 text-xs font-mono block mb-0.5">Mentor Tip</span>
            <p className="text-cyan-100 text-xs leading-relaxed">{step.mentorTip}</p>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mb-4" aria-hidden="true">
          {tutorial.steps.map((s, i) => (
            <span
              key={s.id}
              className={`inline-block w-2 h-2 rounded-full transition-all duration-200 ${
                i === currentStepIndex
                  ? 'bg-cyan-400 scale-125'
                  : i < currentStepIndex
                    ? 'bg-cyan-700'
                    : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onPrev}
            disabled={isFirstStep}
            className={`px-3 py-1.5 text-sm rounded font-medium transition-colors ${
              isFirstStep
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            aria-label="Previous step"
          >
            Previous
          </button>

          <button
            type="button"
            onClick={isLastStep ? onComplete : onNext}
            className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold rounded transition-colors"
            aria-label={isLastStep ? 'Complete tutorial' : 'Next step'}
          >
            {isLastStep ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(overlay, document.body);
});

export default TutorialOverlay;
