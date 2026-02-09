import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { readFileSync } from 'fs';
import db from '../db/database.js';
import type { AIProvider, IdentificationResult } from '../services/aiIdentifier.js';
import { GeminiVisionProvider } from '../services/geminiVision.js';
import { ClaudeVisionProvider } from '../services/claudeVision.js';
import { transcribeAudio } from '../services/transcriber.js';

const router = Router();

function getProvider(name: string): AIProvider {
  switch (name) {
    case 'claude':
      return new ClaudeVisionProvider();
    case 'gemini':
    default:
      return new GeminiVisionProvider();
  }
}

// Transaction: create catalog + lot + stock move in one atomic op
const createIdentifiedComponent = db.transaction(
  (
    result: IdentificationResult,
    providerName: string,
    imageUrls: string[],
    voiceNoteUrl: string
  ) => {
    const catalogId = uuid();
    const lotId = uuid();
    const moveId = uuid();

    db.prepare(
      `INSERT INTO catalog_item
       (id, name, type, description, manufacturer, mpn, package_type, datasheet_url, image_url, pins, specs, ai_confidence, ai_provider, needs_review)
       VALUES (?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?, ?, ?, ?)`
    ).run(
      catalogId,
      result.name,
      result.type,
      result.description,
      result.manufacturer,
      result.mpn,
      result.packageType,
      imageUrls[0] || '',
      JSON.stringify(result.pins),
      JSON.stringify(result.specs),
      result.confidence,
      providerName,
      result.confidence < 0.7 ? 1 : 0
    );

    db.prepare(
      `INSERT INTO inventory_lot (id, catalog_id, quantity, voice_note_url, notes)
       VALUES (?, ?, 1, ?, 'AI-identified component')`
    ).run(lotId, catalogId, voiceNoteUrl);

    db.prepare(
      'INSERT INTO stock_move (id, lot_id, delta, reason, note) VALUES (?, ?, 1, ?, ?)'
    ).run(moveId, lotId, 'identification', `AI-identified as ${result.name}`);

    return { catalogId, lotId };
  }
);

const VALID_PROVIDERS = ['gemini', 'claude'] as const;
type ValidProvider = typeof VALID_PROVIDERS[number];

function isValidProvider(name: string): name is ValidProvider {
  return (VALID_PROVIDERS as readonly string[]).includes(name);
}

// POST /api/identify — Multipart: images[], provider?, voiceNote?
router.post('/', async (req, res) => {
  try {
    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | Express.Multer.File[]
      | undefined;

      // Extract image files
      let imageFiles: Express.Multer.File[] = [];
      if (Array.isArray(files)) {
        imageFiles = files.filter((f) => f.fieldname === 'images');
      } else if (files && 'images' in files) {
        imageFiles = files.images;
      }

      if (imageFiles.length === 0) {
        res.status(400).json({ error: 'At least one image is required' });
        return;
      }

      // Read image buffers
      const imageBuffers = imageFiles.map((f) => readFileSync(f.path));
      const imageUrls = imageFiles.map((f) => `/uploads/${f.filename}`);

      // Handle voice note
      let hints: string | undefined;
      let voiceNoteUrl = '';
      let voiceNoteFile: Express.Multer.File | undefined;

      if (Array.isArray(files)) {
        voiceNoteFile = files.find((f) => f.fieldname === 'voiceNote');
      } else if (files && 'voiceNote' in files) {
        voiceNoteFile = files.voiceNote[0];
      }

      const rawProvider = (req.body?.provider as string) || 'gemini';
      const providerName = isValidProvider(rawProvider) ? rawProvider : 'gemini';

      if (voiceNoteFile) {
        voiceNoteUrl = `/uploads/${voiceNoteFile.filename}`;
        const audioBuffer = readFileSync(voiceNoteFile.path);
        hints = await transcribeAudio(audioBuffer, providerName);
        console.log(`[identify] Transcribed voice note: "${hints}"`);
      }

      // AI identification
      const provider = getProvider(providerName);
      console.log(`[identify] Using provider: ${providerName}, images: ${imageFiles.length}`);
      const result = await provider.identify(imageBuffers, hints);
      console.log(
        `[identify] Result: ${result.name} (confidence: ${result.confidence})`
      );

      // Store in DB
      const { catalogId, lotId } = createIdentifiedComponent(
        result,
        providerName,
        imageUrls,
        voiceNoteUrl
      );

      res.status(201).json({
        catalog_id: catalogId,
        lot_id: lotId,
        identification: result,
        images: imageUrls,
        voice_note: voiceNoteUrl || null,
        needs_review: result.confidence < 0.7,
      });
  } catch (err) {
    console.error('[identify] error:', err);
    res.status(500).json({ error: 'Identification failed' });
  }
});

export default router;
