import { DOCS_BUNDLE } from './knowledgeService';
import { embedText } from './geminiService'; // Added import

// Define the shape of our knowledge chunks
export interface KnowledgeChunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    title: string;
  };
  embedding?: number[];
}

const DB_NAME = 'cm_vector_store';

export const ragService = {
  
  // In-memory cache of chunks
  chunks: [] as KnowledgeChunk[],
  
  async init() {
    // Load from IndexedDB or LocalStorage
    const stored = localStorage.getItem(DB_NAME);
    if (stored) {
      this.chunks = JSON.parse(stored);
    } else {
      // Bootstrap from DOCS_BUNDLE
      await this.bootstrapKnowledge();
    }
  },

  async bootstrapKnowledge() {
    console.log("Bootstrapping Knowledge Base...");
    
    // Chunk strategy: Split by double newline (paragraphs) or headers
    for (const doc of DOCS_BUNDLE) {
       // Simple chunking
       const chunks = doc.content.split('\n#').map(c => c.trim()).filter(c => c.length > 20);
       
       for (let i = 0; i < chunks.length; i++) {
           const chunkContent = chunks[i].startsWith('#') ? chunks[i] : `# ${chunks[i]}`; // Add back header hash if missing
           await this.addDocument(
               `${doc.title}-${i}`,
               chunkContent,
               { source: 'DOCS_BUNDLE', title: doc.title }
           );
       }
    }
  },
  
  async addDocument(id: string, content: string, metadata: KnowledgeChunk['metadata']) {
    // Generate embedding
    const embedding = await embedText(content);
    
    const chunk: KnowledgeChunk = {
      id,
      content,
      metadata,
      embedding
    };
    
    this.chunks.push(chunk);
    this.save();
  },
  
  async search(query: string, limit = 3): Promise<KnowledgeChunk[]> {
    if (this.chunks.length === 0) return [];
    
    const queryEmbedding = await embedText(query);
    
    // Calculate Cosine Similarity
    const scored = this.chunks.map(chunk => {
      if (!chunk.embedding) return { chunk, score: -1 };
      const score = cosineSimilarity(queryEmbedding, chunk.embedding);
      return { chunk, score };
    });
    
    // Sort and slice
    const results = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.chunk);
      
    return results;
  },
  
  save() {
    localStorage.setItem(DB_NAME, JSON.stringify(this.chunks));
  }
};

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}