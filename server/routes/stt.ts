import { Router } from 'express';
import { z } from 'zod';
import { readFileSync } from 'fs';
import { transcribeAudio } from '../services/transcriber.js';

const router = Router();

const sttBodySchema = z.object({
  provider: z.enum(['gemini', 'claude']).optional().default('gemini'),
});

// POST /api/stt — Speech-to-text (multipart: audio)
router.post('/', async (req, res) => {
  try {
    const bodyResult = sttBodySchema.safeParse(req.body ?? {});
    if (!bodyResult.success) {
      res.status(400).json({ error: 'Validation failed', details: bodyResult.error.issues });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'Audio file is required' });
      return;
    }

    const { provider } = bodyResult.data;
    const audioBuffer = readFileSync(file.path);
    const text = await transcribeAudio(audioBuffer, provider);

    res.json({ text, provider });
  } catch (err) {
    console.error('[stt] error:', err);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

export default router;
