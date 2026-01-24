# Spec: Security Auditing (Hardware Guard)

## Goal
Protect the user's local machine and physical hardware by automatically identifying security vulnerabilities in AI-generated code and unsafe electrical configurations in wiring diagrams.

## Background
CircuitMind AI allows the execution of AI-generated Three.js code and facilitates complex electronics design. Without auditing, these could lead to "sandboxing escapes" (accessing private files) or physical hardware damage (overvoltage).

## Architecture
- **Static Analysis (SAST):** Scans all generated code strings for forbidden JavaScript globals (`fetch`, `window`, `process`).
- **Dynamic Electrical Rules:** A set of logical checks that run against the `WiringDiagram` to detect physical safety issues like short circuits.
- **AI Sentinel:** Uses Gemini to perform "Semantic Auditing" on component datasheets to ensure pin usage matches manufacturer safety specs.

## Data Model
```typescript
interface SecurityViolation {
  id: string;
  type: 'code_injection' | 'electrical_safety' | 'privacy_risk' | 'api_exposure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string; // e.g., "threeCode" or "diagram.connections[5]"
  message: string;
  remedy: string;
}

interface AuditReport {
  timestamp: number;
  violations: SecurityViolation[];
  score: number; // 0 to 100
}
```

## Security & Privacy
- Auditing logic is 100% local.
- No code or diagram data is sent to external security servers.
- AI-based reviews use the existing user-controlled Gemini API key.
