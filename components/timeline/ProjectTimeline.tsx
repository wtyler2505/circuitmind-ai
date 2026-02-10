/**
 * ProjectTimeline
 *
 * Horizontal scrollable timeline showing diagram version history.
 *
 * Features:
 *   - Each node represents a saved diagram snapshot (from isomorphic-git commits)
 *   - Displays timestamp, optional label, and component-count delta
 *   - Click a node to load that version in a preview pane
 *   - Select two nodes to enter diff mode (side-by-side comparison)
 *   - Current (HEAD) version is visually highlighted
 *   - Cyberpunk theme: bg-cyber-dark, text-neon-cyan, border accents
 *
 * The component is stateless regarding the actual diagram data -- callers
 * provide the version list and callbacks.  This keeps it testable and
 * decoupled from the git layer.
 */

import React, { useCallback, useRef, useMemo, useState, useEffect } from 'react';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** Metadata for a single version node on the timeline. */
export interface TimelineVersion {
  /** Git commit SHA or unique version id. */
  id: string;
  /** Unix-ms timestamp of the save. */
  timestamp: number;
  /** Optional human-readable label (commit message / user note). */
  label?: string;
  /** Number of components in this version's diagram. */
  componentCount: number;
  /** True if this is the current (HEAD) version. */
  isCurrent?: boolean;
}

export interface ProjectTimelineProps {
  /** Ordered list of versions (oldest first). */
  versions: TimelineVersion[];
  /** Called when the user clicks a single version node. */
  onSelectVersion: (versionId: string) => void;
  /**
   * Called when the user selects a second version for diff mode.
   * Passes [baseId, compareId] (base = earlier, compare = later).
   */
  onCompareVersions?: (baseId: string, compareId: string) => void;
  /** ID of the currently-selected single version (highlight). */
  selectedVersionId?: string;
  /** Whether a version is currently loading (shows spinner on that node). */
  loadingVersionId?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimestamp(ms: number): string {
  const d = new Date(ms);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
}

function deltaLabel(current: number, previous: number | null): string {
  if (previous === null) return `${current}`;
  const d = current - previous;
  if (d === 0) return '\u00B10';
  return d > 0 ? `+${d}` : `${d}`;
}

function deltaColor(current: number, previous: number | null): string {
  if (previous === null) return 'text-slate-400';
  const d = current - previous;
  if (d > 0) return 'text-neon-green';
  if (d < 0) return 'text-red-400';
  return 'text-slate-400';
}

// ---------------------------------------------------------------------------
// Node sub-component
// ---------------------------------------------------------------------------

interface TimelineNodeProps {
  version: TimelineVersion;
  previousComponentCount: number | null;
  isSelected: boolean;
  isCompareBase: boolean;
  isCompareTarget: boolean;
  isLoading: boolean;
  onClick: () => void;
  onShiftClick: () => void;
}

const TimelineNode: React.FC<TimelineNodeProps> = React.memo(
  ({
    version,
    previousComponentCount,
    isSelected,
    isCompareBase,
    isCompareTarget,
    isLoading,
    onClick,
    onShiftClick,
  }) => {
    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        if (e.shiftKey) {
          onShiftClick();
        } else {
          onClick();
        }
      },
      [onClick, onShiftClick],
    );

    // Ring colour
    let ringClass = 'border-cyber-card';
    if (version.isCurrent) ringClass = 'border-neon-cyan';
    else if (isCompareBase) ringClass = 'border-neon-amber';
    else if (isCompareTarget) ringClass = 'border-neon-purple';
    else if (isSelected) ringClass = 'border-neon-cyan/60';

    // Dot colour
    let dotClass = 'bg-slate-600';
    if (version.isCurrent) dotClass = 'bg-neon-cyan';
    else if (isCompareBase) dotClass = 'bg-neon-amber';
    else if (isCompareTarget) dotClass = 'bg-neon-purple';
    else if (isSelected) dotClass = 'bg-neon-cyan/60';

    const delta = deltaLabel(version.componentCount, previousComponentCount);
    const dColor = deltaColor(version.componentCount, previousComponentCount);

    return (
      <button
        type="button"
        onClick={handleClick}
        className={[
          'group relative flex flex-col items-center gap-1.5',
          'min-w-[90px] px-2 py-2 rounded-lg',
          'transition-colors duration-150 cursor-pointer',
          'hover:bg-cyber-card/60',
          isSelected ? 'bg-cyber-card/40' : '',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/40',
        ].join(' ')}
        aria-label={`Version ${version.label ?? version.id.slice(0, 7)} at ${formatTimestamp(version.timestamp)}`}
        aria-current={version.isCurrent ? 'true' : undefined}
        title="Click to preview. Shift+click to compare."
      >
        {/* Dot + ring */}
        <span
          className={[
            'relative flex items-center justify-center',
            'h-7 w-7 rounded-full border-2',
            ringClass,
            'transition-all duration-200',
          ].join(' ')}
        >
          <span
            className={[
              'h-3 w-3 rounded-full',
              dotClass,
              version.isCurrent ? 'animate-pulse' : '',
              isLoading ? 'animate-spin' : '',
            ].join(' ')}
          />
          {/* Compare badge */}
          {isCompareBase && (
            <span className="absolute -top-2 -right-2 text-[9px] font-bold text-neon-amber bg-cyber-dark rounded px-0.5">
              A
            </span>
          )}
          {isCompareTarget && (
            <span className="absolute -top-2 -right-2 text-[9px] font-bold text-neon-purple bg-cyber-dark rounded px-0.5">
              B
            </span>
          )}
        </span>

        {/* Timestamp */}
        <span className="text-[10px] text-slate-500 font-mono leading-none whitespace-nowrap">
          {formatTimestamp(version.timestamp)}
        </span>

        {/* Label (truncated) */}
        {version.label && (
          <span
            className="max-w-[80px] text-[10px] text-slate-300 truncate leading-none"
            title={version.label}
          >
            {version.label}
          </span>
        )}

        {/* Component delta */}
        <span className={`text-[10px] font-mono leading-none ${dColor}`}>
          {delta} comp
        </span>

        {/* Current badge */}
        {version.isCurrent && (
          <span className="text-[8px] uppercase tracking-widest text-neon-cyan font-bold leading-none">
            HEAD
          </span>
        )}
      </button>
    );
  },
);
TimelineNode.displayName = 'TimelineNode';

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const ProjectTimelineInner: React.FC<ProjectTimelineProps> = ({
  versions,
  onSelectVersion,
  onCompareVersions,
  selectedVersionId,
  loadingVersionId,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Compare mode state: user shift-clicks to select a second version
  const [compareBase, setCompareBase] = useState<string | null>(null);
  const [compareTarget, setCompareTarget] = useState<string | null>(null);

  // When selectedVersionId changes externally, clear compare mode
  useEffect(() => {
    setCompareBase(null);
    setCompareTarget(null);
  }, [selectedVersionId]);

  // Scroll to current version on mount
  useEffect(() => {
    if (!scrollRef.current) return;
    const currentIdx = versions.findIndex((v) => v.isCurrent);
    if (currentIdx < 0) return;
    // Each node is ~90px wide + gap
    const offset = currentIdx * 106 - scrollRef.current.clientWidth / 2 + 45;
    scrollRef.current.scrollTo({ left: Math.max(0, offset), behavior: 'smooth' });
  }, [versions]);

  const handleNodeClick = useCallback(
    (versionId: string) => {
      // Reset compare mode on normal click
      setCompareBase(null);
      setCompareTarget(null);
      onSelectVersion(versionId);
    },
    [onSelectVersion],
  );

  const handleNodeShiftClick = useCallback(
    (versionId: string) => {
      if (!onCompareVersions) return;

      if (!compareBase) {
        // First selection: set as base
        setCompareBase(versionId);
        setCompareTarget(null);
      } else if (compareBase === versionId) {
        // Clicking the same node again: deselect
        setCompareBase(null);
        setCompareTarget(null);
      } else {
        // Second selection: set target and fire callback
        setCompareTarget(versionId);

        // Ensure base is always the earlier version
        const baseIdx = versions.findIndex((v) => v.id === compareBase);
        const targetIdx = versions.findIndex((v) => v.id === versionId);
        if (baseIdx >= 0 && targetIdx >= 0) {
          const [earlierId, laterId] =
            baseIdx < targetIdx
              ? [compareBase, versionId]
              : [versionId, compareBase];
          onCompareVersions(earlierId, laterId);
        }
      }
    },
    [compareBase, onCompareVersions, versions],
  );

  // Pre-compute previous component counts for delta display
  const previousCounts = useMemo(() => {
    const counts: (number | null)[] = [];
    for (let i = 0; i < versions.length; i++) {
      counts.push(i > 0 ? versions[i - 1].componentCount : null);
    }
    return counts;
  }, [versions]);

  if (versions.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 bg-cyber-dark/80 border border-cyber-card rounded-lg">
        <p className="text-sm text-slate-500 font-mono">No version history yet</p>
      </div>
    );
  }

  return (
    <div
      className={[
        'relative flex flex-col gap-2',
        'bg-cyber-dark/80 border border-neon-cyan/10 rounded-lg',
        'px-3 py-3',
      ].join(' ')}
      role="region"
      aria-label="Project version timeline"
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono uppercase tracking-widest text-neon-cyan/70">
          Version History
        </h3>
        {compareBase && !compareTarget && (
          <span className="text-[10px] text-neon-amber font-mono animate-pulse">
            Shift+click another version to compare
          </span>
        )}
        {compareBase && compareTarget && (
          <button
            type="button"
            onClick={() => {
              setCompareBase(null);
              setCompareTarget(null);
            }}
            className="text-[10px] text-slate-400 hover:text-slate-200 font-mono underline"
          >
            Clear comparison
          </button>
        )}
      </div>

      {/* Scrollable timeline strip */}
      <div
        ref={scrollRef}
        className="flex items-start gap-1 overflow-x-auto scrollbar-thin scrollbar-track-cyber-dark scrollbar-thumb-cyber-card pb-1"
        role="list"
        aria-label="Version nodes"
      >
        {/* Horizontal connector line (behind nodes) */}
        <div className="absolute left-6 right-6 top-[52px] h-px bg-cyber-card z-0" />

        {versions.map((version, i) => (
          <div key={version.id} role="listitem" className="relative z-10">
            <TimelineNode
              version={version}
              previousComponentCount={previousCounts[i]}
              isSelected={selectedVersionId === version.id}
              isCompareBase={compareBase === version.id}
              isCompareTarget={compareTarget === version.id}
              isLoading={loadingVersionId === version.id}
              onClick={() => handleNodeClick(version.id)}
              onShiftClick={() => handleNodeShiftClick(version.id)}
            />
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[9px] font-mono text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-neon-cyan inline-block" />
          Current
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-neon-amber inline-block" />
          Compare A
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-neon-purple inline-block" />
          Compare B
        </span>
        <span className="ml-auto text-slate-600">
          Shift+click two nodes to diff
        </span>
      </div>
    </div>
  );
};

export const ProjectTimeline = React.memo(ProjectTimelineInner);
export default ProjectTimeline;
