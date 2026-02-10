import type {
  Quest,
  QuestValidationRule,
  WiringDiagram,
  ElectronicComponent,
  WireConnection,
} from '../types';

// ============================================
// Return Types
// ============================================

export interface RuleResult {
  rule: QuestValidationRule;
  passed: boolean;
  details?: string;
}

export interface QuestValidationResult {
  questId: string;
  passed: boolean;
  completedRules: number;
  totalRules: number;
  completionPercent: number; // 0-100
  ruleResults: RuleResult[];
}

// ============================================
// Individual Rule Validators
// ============================================

/**
 * Check if the diagram contains a component whose `type` or `name`
 * (case-insensitive substring) matches `rule.target`.
 *
 * When `rule.count` is provided, at least that many matches are required.
 */
function validateComponentPlaced(
  rule: QuestValidationRule,
  diagram: WiringDiagram
): { passed: boolean; details?: string } {
  if (!rule.target) {
    return { passed: false, details: 'Rule is missing a target' };
  }

  const target = rule.target.toLowerCase();
  const requiredCount = rule.count ?? 1;

  const matchingComponents = diagram.components.filter(
    (c) =>
      c.type.toLowerCase() === target ||
      c.name.toLowerCase().includes(target)
  );

  const found = matchingComponents.length;
  const passed = found >= requiredCount;

  return {
    passed,
    details:
      found === 0
        ? `No components matching "${rule.target}" found`
        : `Found ${found} of ${requiredCount} required "${rule.target}" component${requiredCount !== 1 ? 's' : ''}`,
  };
}

/**
 * Check that the diagram has at least `rule.count` (default 1) wire
 * connections.
 */
function validateWireConnected(
  rule: QuestValidationRule,
  diagram: WiringDiagram
): { passed: boolean; details?: string } {
  const requiredCount = rule.count ?? 1;
  const actual = diagram.connections.length;
  const passed = actual >= requiredCount;

  return {
    passed,
    details: `${actual} of ${requiredCount} required connection${requiredCount !== 1 ? 's' : ''} present`,
  };
}

/**
 * Simulation-run validation is externally driven.  The caller must supply
 * `flags.simulationRun = true` for this rule to pass.
 */
function validateSimulationRun(
  _rule: QuestValidationRule,
  _diagram: WiringDiagram,
  flags: { simulationRun?: boolean }
): { passed: boolean; details?: string } {
  const passed = flags.simulationRun === true;
  return {
    passed,
    details: passed ? 'Simulation has been run' : 'Simulation has not been run yet',
  };
}

/**
 * Check that the diagram contains at least `rule.count` components total
 * (regardless of type).
 */
function validateComponentCount(
  rule: QuestValidationRule,
  diagram: WiringDiagram
): { passed: boolean; details?: string } {
  const requiredCount = rule.count ?? 1;
  const actual = diagram.components.length;
  const passed = actual >= requiredCount;

  return {
    passed,
    details: `${actual} of ${requiredCount} required component${requiredCount !== 1 ? 's' : ''} on canvas`,
  };
}

/**
 * Parse a specific-connection target string and verify that a matching
 * connection exists in the diagram.
 *
 * **Structured format** (preferred):
 *   `"fromComponentType:fromPin->toComponentType:toPin"`
 *
 * Each side is `componentType:pinName`.  The match is *bidirectional* —
 * a connection from A->B also satisfies B->A.
 *
 * **Shorthand format** (legacy/simple):
 *   `"sensor-to-mcu"` — a dash-separated pair of component type keywords.
 *   We look for a connection where one end sits on a component whose type
 *   contains the first keyword and the other end on a component whose type
 *   contains the second keyword.
 */
function validateSpecificConnection(
  rule: QuestValidationRule,
  diagram: WiringDiagram
): { passed: boolean; details?: string } {
  if (!rule.target) {
    return { passed: false, details: 'Rule is missing a target' };
  }

  // Build a quick component-id-to-component lookup
  const compById = new Map<string, ElectronicComponent>();
  for (const c of diagram.components) {
    compById.set(c.id, c);
  }

  // --- Structured format: "type:pin->type:pin" --------------------------
  if (rule.target.includes('->')) {
    const [fromPart, toPart] = rule.target.split('->');
    if (!fromPart || !toPart) {
      return { passed: false, details: `Invalid target format: "${rule.target}"` };
    }

    const [fromType, fromPin] = fromPart.split(':');
    const [toType, toPin] = toPart.split(':');

    if (!fromType || !toType) {
      return { passed: false, details: `Invalid target format: "${rule.target}"` };
    }

    const fromTypeLower = fromType.toLowerCase();
    const toTypeLower = toType.toLowerCase();
    const fromPinLower = fromPin?.toLowerCase();
    const toPinLower = toPin?.toLowerCase();

    const matchesSide = (
      comp: ElectronicComponent | undefined,
      connPin: string,
      expectedType: string,
      expectedPin: string | undefined
    ): boolean => {
      if (!comp) return false;
      const typeMatch =
        comp.type.toLowerCase() === expectedType ||
        comp.name.toLowerCase().includes(expectedType);
      if (!typeMatch) return false;
      if (expectedPin) {
        return connPin.toLowerCase() === expectedPin;
      }
      return true;
    };

    for (const conn of diagram.connections) {
      const fromComp = compById.get(conn.fromComponentId);
      const toComp = compById.get(conn.toComponentId);

      // Check both orientations (A->B and B->A)
      const forwardMatch =
        matchesSide(fromComp, conn.fromPin, fromTypeLower, fromPinLower) &&
        matchesSide(toComp, conn.toPin, toTypeLower, toPinLower);

      const reverseMatch =
        matchesSide(toComp, conn.toPin, fromTypeLower, fromPinLower) &&
        matchesSide(fromComp, conn.fromPin, toTypeLower, toPinLower);

      if (forwardMatch || reverseMatch) {
        return {
          passed: true,
          details: `Found connection matching "${rule.target}"`,
        };
      }
    }

    return {
      passed: false,
      details: `No connection matching "${rule.target}" found`,
    };
  }

  // --- Shorthand format: "keyword-to-keyword" ----------------------------
  const toIndex = rule.target.toLowerCase().indexOf('-to-');
  if (toIndex !== -1) {
    const firstKeyword = rule.target.substring(0, toIndex).toLowerCase();
    const secondKeyword = rule.target.substring(toIndex + 4).toLowerCase();

    const matchesKeyword = (comp: ElectronicComponent | undefined, keyword: string): boolean => {
      if (!comp) return false;
      return (
        comp.type.toLowerCase().includes(keyword) ||
        comp.name.toLowerCase().includes(keyword)
      );
    };

    for (const conn of diagram.connections) {
      const fromComp = compById.get(conn.fromComponentId);
      const toComp = compById.get(conn.toComponentId);

      const forwardMatch =
        matchesKeyword(fromComp, firstKeyword) &&
        matchesKeyword(toComp, secondKeyword);

      const reverseMatch =
        matchesKeyword(toComp, firstKeyword) &&
        matchesKeyword(fromComp, secondKeyword);

      if (forwardMatch || reverseMatch) {
        return {
          passed: true,
          details: `Found connection between "${firstKeyword}" and "${secondKeyword}" components`,
        };
      }
    }

    return {
      passed: false,
      details: `No connection between "${firstKeyword}" and "${secondKeyword}" components found`,
    };
  }

  // Fallback: unrecognized format
  return {
    passed: false,
    details: `Unrecognized specific_connection target format: "${rule.target}"`,
  };
}

// ============================================
// Public API
// ============================================

/**
 * Validate a single quest rule against the current diagram state.
 */
export function validateRule(
  rule: QuestValidationRule,
  diagram: WiringDiagram,
  flags: { simulationRun?: boolean } = {}
): { passed: boolean; details?: string } {
  switch (rule.type) {
    case 'component_placed':
      return validateComponentPlaced(rule, diagram);
    case 'wire_connected':
      return validateWireConnected(rule, diagram);
    case 'simulation_run':
      return validateSimulationRun(rule, diagram, flags);
    case 'component_count':
      return validateComponentCount(rule, diagram);
    case 'specific_connection':
      return validateSpecificConnection(rule, diagram);
    default: {
      // Exhaustive check — TypeScript will error if a case is missed
      const _exhaustive: never = rule.type;
      return { passed: false, details: `Unknown rule type: ${_exhaustive}` };
    }
  }
}

/**
 * Validate all rules for a quest and return a structured result with
 * per-rule outcomes and overall completion percentage.
 */
export function validateQuest(
  quest: Quest,
  diagram: WiringDiagram,
  flags: { simulationRun?: boolean } = {}
): QuestValidationResult {
  const ruleResults: RuleResult[] = quest.validationRules.map((rule) => {
    const { passed, details } = validateRule(rule, diagram, flags);
    return { rule, passed, details };
  });

  const totalRules = ruleResults.length;
  const completedRules = ruleResults.filter((r) => r.passed).length;
  const completionPercent =
    totalRules === 0 ? 0 : Math.round((completedRules / totalRules) * 100);

  return {
    questId: quest.id,
    passed: totalRules > 0 && completedRules === totalRules,
    completedRules,
    totalRules,
    completionPercent,
    ruleResults,
  };
}
