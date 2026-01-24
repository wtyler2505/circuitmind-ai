export interface InteractionLesson {
  id: string;
  contextType: 'wiring' | 'chat' | '3d';
  userPrompt: string;
  originalResponse: string;
  correction: string;
  tags: string[];
  timestamp: number;
}

const STORAGE_KEY = 'cm_lessons';

class CorrectionService {
  private lessons: InteractionLesson[] = [];

  constructor() {
    this.loadLessons();
  }

  private loadLessons() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) this.lessons = JSON.parse(saved);
    } catch {
      this.lessons = [];
    }
  }

  private saveLessons() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.lessons));
  }

  addLesson(lesson: Omit<InteractionLesson, 'id' | 'timestamp'>) {
    const newLesson: InteractionLesson = {
      ...lesson,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    this.lessons.push(newLesson);
    this.saveLessons();
  }

  getRelevantLessons(query: string, limit = 3): InteractionLesson[] {
    const queryLower = query.toLowerCase();
    
    return this.lessons
      .map(l => ({
        lesson: l,
        score: this.calculateRelevance(l, queryLower)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.lesson);
  }

  private calculateRelevance(lesson: InteractionLesson, query: string): number {
    let score = 0;
    // Simple keyword matching for now
    if (query.includes(lesson.userPrompt.toLowerCase())) score += 5;
    
    lesson.tags.forEach(tag => {
      if (query.includes(tag.toLowerCase())) score += 2;
    });

    return score;
  }

  exportDataset(): string {
    return this.lessons.map(l => JSON.stringify({
      messages: [
        { role: 'user', content: l.userPrompt },
        { role: 'assistant', content: l.correction }
      ]
    })).join('\n');
  }
}

export const correctionService = new CorrectionService();
