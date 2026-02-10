/**
 * Command-pattern undo/redo system for CircuitMind AI.
 *
 * Replaces the previous snapshot-based approach where every diagram update
 * stored a full copy of WiringDiagram in unbounded past[]/future[] arrays.
 *
 * This implementation still stores before/after snapshots per command (delta
 * storage is a future optimisation), but caps history at MAX_HISTORY_SIZE
 * entries and provides a structured Command interface that can later be
 * extended with granular diffs.
 */

import { WiringDiagram } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Command {
  /** Unique identifier for this command instance. */
  id: string;
  /** Machine-readable command kind, e.g. 'addComponent', 'moveComponent'. */
  type: string;
  /** Human-readable description suitable for tooltip / history panel. */
  description: string;
  /** When the command was first executed (epoch ms). */
  timestamp: number;
  /**
   * Apply the command. Returns the resulting diagram state, or null if the
   * command produced no meaningful change.
   */
  execute: () => WiringDiagram | null;
  /**
   * Reverse the command. Returns the diagram state that existed before the
   * command was executed, or null if reversal is not possible.
   */
  undo: () => WiringDiagram | null;
}

export interface CommandHistoryState {
  /** Commands that can be undone (oldest first). */
  past: Command[];
  /** Commands that can be redone (most-recently-undone first). */
  future: Command[];
}

// ---------------------------------------------------------------------------
// Default configuration
// ---------------------------------------------------------------------------

const DEFAULT_MAX_HISTORY_SIZE = 50;

// ---------------------------------------------------------------------------
// CommandHistoryManager
// ---------------------------------------------------------------------------

export class CommandHistoryManager {
  private past: Command[] = [];
  private future: Command[] = [];
  private readonly maxSize: number;

  constructor(maxSize: number = DEFAULT_MAX_HISTORY_SIZE) {
    this.maxSize = maxSize;
  }

  // ---- Mutators -----------------------------------------------------------

  /**
   * Execute a command. The command's `execute()` callback is **not** invoked
   * here — the caller is responsible for applying the state change. This
   * method only records the command in the undo stack and clears the redo
   * stack (standard behaviour: a new action invalidates the redo timeline).
   */
  execute(command: Command): void {
    this.past.push(command);

    // Trim oldest entries when we exceed the cap.
    while (this.past.length > this.maxSize) {
      this.past.shift();
    }

    // New command invalidates redo timeline.
    this.future = [];
  }

  /**
   * Undo the most recent command. Returns the diagram state produced by
   * `command.undo()`, or null if there is nothing to undo.
   */
  undo(): WiringDiagram | null {
    if (this.past.length === 0) return null;

    const command = this.past.pop()!;
    const result = command.undo();

    // Move the command to the redo stack regardless of whether undo()
    // returned null — the user should still be able to redo it.
    this.future.unshift(command);

    return result;
  }

  /**
   * Redo the most recently undone command. Returns the diagram state produced
   * by `command.execute()`, or null if there is nothing to redo.
   */
  redo(): WiringDiagram | null {
    if (this.future.length === 0) return null;

    const command = this.future.shift()!;
    const result = command.execute();

    this.past.push(command);

    return result;
  }

  // ---- Queries ------------------------------------------------------------

  get canUndo(): boolean {
    return this.past.length > 0;
  }

  get canRedo(): boolean {
    return this.future.length > 0;
  }

  /** Return a shallow copy of the undo stack (oldest first). */
  getHistory(): Command[] {
    return [...this.past];
  }

  /** Return a shallow copy of the redo stack. */
  getFuture(): Command[] {
    return [...this.future];
  }

  /** Return a snapshot of the current state (useful for React state sync). */
  getState(): CommandHistoryState {
    return {
      past: [...this.past],
      future: [...this.future],
    };
  }

  /** Total number of undoable commands currently stored. */
  get size(): number {
    return this.past.length;
  }

  // ---- Reset --------------------------------------------------------------

  /** Clear both undo and redo stacks. */
  clear(): void {
    this.past = [];
    this.future = [];
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let commandCounter = 0;

/**
 * Convenience factory for creating a Command that captures before/after
 * diagram snapshots. This is the simplest (and current) strategy — every
 * command stores two full WiringDiagram references. A future optimisation
 * could store structural diffs instead.
 */
export function createSnapshotCommand(
  type: string,
  description: string,
  before: WiringDiagram | null,
  after: WiringDiagram | null,
): Command {
  commandCounter += 1;
  return {
    id: `cmd-${Date.now()}-${commandCounter}`,
    type,
    description,
    timestamp: Date.now(),
    execute: () => after,
    undo: () => before,
  };
}
