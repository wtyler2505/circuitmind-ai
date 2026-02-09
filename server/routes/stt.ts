import { Router } from 'express';
import { readFileSync } from 'fs';
import { transcribeAudio } from '../services/transcriber.js';

const router = Router();

const VALID_PROVIDERS = ['gemini', 'claude'] as const;

// POST /api/stt — Speech-to-text (multipart: audio)
router.post('/', async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'Audio file is required' });
      return;
    }

    const rawProvider = (req.body?.provider as string) || 'gemini';
    const provider = (VALID_PROVIDERS as readonly string[]).includes(rawProvider)
      ? (rawProvider as 'gemini' | 'claude')
      : 'gemini';
    const audioBuffer = readFileSync(file.path);
    const text = await transcribeAudio(audioBuffer, provider);

    res.json({ text, provider });
  } catch (err) {
    console.error('[stt] error:', err);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

export default router;
