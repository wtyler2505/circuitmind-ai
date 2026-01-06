export type ExperienceLevel = 'beginner' | 'intermediate' | 'expert';

export interface UserFact {
  id: string;
  content: string; // "User prefers through-hole components"
  timestamp: number;
  confidence: number; // 0-1
}

export interface UserProfile {
  id: string;
  name: string;
  experienceLevel: ExperienceLevel;
  preferences: {
    verboseMode: boolean; // Does user want long explanations?
    autoSave: boolean;
    theme: 'cyber' | 'light' | 'dark';
    preferredUnit: 'metric' | 'imperial';
  };
  learningProgress: {
    topicsMastered: string[]; // ["Ohm's Law", "Microcontrollers"]
    currentFocus: string;
  };
  facts: UserFact[];
}

const STORAGE_KEY = 'cm_user_profile';

export const userProfileService = {
  getProfile: (): UserProfile => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) { console.error(e); }
    
    // Default Profile
    return {
      id: 'default_user',
      name: 'User',
      experienceLevel: 'intermediate', // Default to middle
      preferences: {
        verboseMode: true,
        autoSave: true,
        theme: 'cyber',
        preferredUnit: 'metric'
      },
      learningProgress: {
        topicsMastered: [],
        currentFocus: 'General Electronics'
      },
      facts: []
    };
  },

  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  },

  updateExperience: (level: ExperienceLevel) => {
    const profile = userProfileService.getProfile();
    profile.experienceLevel = level;
    userProfileService.saveProfile(profile);
  },

  addFact: (content: string) => {
    const profile = userProfileService.getProfile();
    profile.facts.push({
      id: crypto.randomUUID(),
      content,
      timestamp: Date.now(),
      confidence: 1.0
    });
    userProfileService.saveProfile(profile);
  },

  // "Teacher" Logic: Detect level based on query complexity
  detectAndSetLevelFromQuery: (query: string) => {
    const profile = userProfileService.getProfile();
    const lower = query.toLowerCase();
    
    // Simple heuristics (can be replaced by AI classifier later)
    if (lower.includes('what is') || lower.includes('how do i connect') || lower.includes('help')) {
        // Leaning towards beginner, but don't downgrade expert immediately
        // Only adjust if we see a pattern (TODO: implement pattern tracking)
    } 
    
    if (lower.includes('impedance') || lower.includes('datasheet') || lower.includes('i2c address')) {
        if (profile.experienceLevel === 'beginner') {
             profile.experienceLevel = 'intermediate';
             userProfileService.saveProfile(profile);
        }
    }
  }
};
