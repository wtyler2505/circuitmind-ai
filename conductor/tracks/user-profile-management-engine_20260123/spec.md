# Spec: User Profile Management (Engineering Persona)

## Goal
Personalize the CircuitMind AI experience by allowing the system to learn and adapt to the user's technical expertise, UI preferences, and "Engineering Style".

## Background
Currently, the AI assumes a generic persona and the UI resets many preferences on reload. A formal User Profile system allows the AI to stay in character (Eve) while adjusting technical depth and allows the UI to stay consistent.

## Architecture
- **Local Persistence:** Profiles are stored in IndexedDB to support larger metadata sets (like project history summary).
- **Context Injection:** The active profile is always part of the AI context, ensuring every response is tailored.
- **Reactive UI:** Changes to the profile (like color themes) are applied using a CSS variable injection system.

## Data Model
```typescript
interface UserProfile {
  id: string;
  name: string;
  expertise: 'beginner' | 'intermediate' | 'pro';
  preferences: {
    theme: 'cyber' | 'industrial' | 'minimal';
    wiringColors: Record<string, string>; // e.g., { "VCC": "#ff0000" }
    aiTone: 'sass' | 'technical' | 'concise';
  };
  stats: {
    projectsCreated: number;
    componentsMastered: string[];
  };
}
```

## Security & Privacy
- Profiles remain 100% local.
- No PII (Personally Identifiable Information) is required.
- Persona data is only sent to Gemini to improve response quality.
