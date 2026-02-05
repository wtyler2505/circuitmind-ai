/**
 * Wiring Validator Skeleton
 * - Loads wiring_ruleset.json
 * - Validates a "plan" (like Tier5 complete_circuits entries)
 *
 * This is intentionally conservative: it catches the common “this will fry your GPIO / brown-out your board” cases.
 */
import fs from "node:fs";
import path from "node:path";

export type PinRef = { component: string; pin: string };
export type Connection = { from: PinRef; to: PinRef; wire?: string };

export type CircuitPlan = {
  name: string;
  components: string[];          // inventory component IDs when possible
  total_current_ma?: number;
  power_source?: "usb" | "external" | "vin" | string;
  connections: Connection[];
  notes?: string;
};

export type Issue = {
  rule_id: string;
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  solution?: string;
};

export type Ruleset = {
  pin_allocation_rules: any;
  wiring_validation_rules: { rules: Array<any> };
  protection_requirements: any;
  wire_color_standards: any;
  power_budget_calculator: any;
  breadboard_zone_rules: any;
};

export function loadRuleset(rulesetPath: string): Ruleset {
  const raw = fs.readFileSync(rulesetPath, "utf-8");
  return JSON.parse(raw);
}

/**
 * Minimal helpers
 */
function includesAny(haystack: string, needles: string[]) {
  const h = haystack.toLowerCase();
  return needles.some(n => h.includes(n.toLowerCase()));
}

/**
 * Heuristic: Determine if a plan contains a 3.3V MCU vs 5V MCU.
 * You can improve this by mapping plan.component IDs to inventory component data.
 */
function inferMcuLogicVoltage(plan: CircuitPlan): 3.3 | 5 | null {
  const joined = plan.components.join(" ").toLowerCase();
  if (includesAny(joined, ["esp32", "esp8266", "nodemcu"])) return 3.3;
  if (includesAny(joined, ["arduino-uno", "arduino-mega", "atmega"])) return 5;
  return null;
}

/**
 * Heuristic: detect dangerous 5V echo (HC-SR04 echo) into ESP32/ESP8266 pins.
 * If plan says ESP32 + HC-SR04 and has a connection involving ECHO -> GPIO, flag it.
 */
function checkHcsr04EchoTo33v(plan: CircuitPlan, mcuLogic: 3.3 | 5 | null): Issue[] {
  if (mcuLogic !== 3.3) return [];
  const hasHcsr04 = includesAny(plan.components.join(" "), ["hcsr04", "hc-sr04"]);
  if (!hasHcsr04) return [];
  const echoConns = plan.connections.filter(c =>
    (c.from.component.toLowerCase().includes("hc") && c.from.pin.toUpperCase() === "ECHO") ||
    (c.to.component.toLowerCase().includes("hc") && c.to.pin.toUpperCase() === "ECHO")
  );
  if (echoConns.length === 0) return [];

  return [{
    rule_id: "VR002-ish",
    severity: "critical",
    message: "HC-SR04 ECHO is a 5V signal. Feeding it into a 3.3V MCU GPIO can destroy the pin.",
    solution: "Use a voltage divider (1KΩ + 2KΩ) or a proper level shifter on ECHO (or use a 3.3V-safe ultrasonic sensor)."
  }];
}

/**
 * Check total current against a default USB limit (500mA).
 * If you want per-board limits, map to inventory MCU power_supply_limits.
 */
function checkUsbCurrent(plan: CircuitPlan): Issue[] {
  if (!plan.total_current_ma) return [];
  const isUsb = (plan.power_source || "").toLowerCase() === "usb";
  if (!isUsb) return [];
  if (plan.total_current_ma > 500) {
    return [{
      rule_id: "VR004-ish",
      severity: "error",
      message: `Total current ${plan.total_current_ma}mA exceeds typical USB 500mA limit.`,
      solution: "Use an external 5V supply for high-current loads. Tie grounds together."
    }];
  }
  return [];
}

/**
 * Servo direct power warning.
 */
function checkServoPower(plan: CircuitPlan): Issue[] {
  const hasServo = includesAny(plan.components.join(" "), ["sg90", "servo"]);
  if (!hasServo) return [];
  const isUsb = (plan.power_source || "").toLowerCase() === "usb";
  if (!isUsb) return [];
  return [{
    rule_id: "VR005-ish",
    severity: "warning",
    message: "Servos powered from the MCU/USB rail can cause brownouts and random resets.",
    solution: "Power the servo from an external 5V source and share ground with the MCU."
  }];
}

export function validatePlan(plan: CircuitPlan, ruleset?: Ruleset): Issue[] {
  const issues: Issue[] = [];
  const mcuLogic = inferMcuLogicVoltage(plan);

  issues.push(...checkUsbCurrent(plan));
  issues.push(...checkServoPower(plan));
  issues.push(...checkHcsr04EchoTo33v(plan, mcuLogic));

  // Future: interpret ruleset.wiring_validation_rules.rules DSL.
  // For now, the ruleset is shipped for humans + future parser work.
  return issues;
}

// CLI (optional)
if (require.main === module) {
  const planPath = process.argv[2];
  if (!planPath) {
    console.error("Usage: node wiring-validator.js <plan.json>");
    process.exit(1);
  }
  const plan = JSON.parse(fs.readFileSync(planPath, "utf-8")) as CircuitPlan;
  const issues = validatePlan(plan);
  console.log(JSON.stringify({ plan: plan.name, issues }, null, 2));
}
