import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import express from 'express';
import multer from 'multer';

import catalogRoutes from '../routes/catalog.ts';
import inventoryRoutes from '../routes/inventory.ts';
import identifyRoutes from '../routes/identify.ts';
import sttRoutes from '../routes/stt.ts';
import { close as closeDb } from '../db/database.ts';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/catalog', catalogRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use(
  '/api/identify',
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'voiceNote', maxCount: 1 },
  ]),
  identifyRoutes
);
app.use('/api/stt', upload.single('audio'), sttRoutes);

let baseUrl = '';
let server: ReturnType<typeof app.listen>;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => {
    server.on('listening', () => {
      const address = server.address();
      if (address && typeof address === 'object') {
        baseUrl = `http://127.0.0.1:${address.port}`;
      }
      resolve();
    });
  });
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });

  closeDb();
});

describe('server route validation behavior', () => {
  it('returns 400 for invalid provider on /api/identify', async () => {
    const response = await fetch(`${baseUrl}/api/identify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'invalid-provider' }),
    });

    assert.equal(response.status, 400);
    const body = (await response.json()) as { error?: string };
    assert.equal(body.error, 'Validation failed');
  });

  it('returns 400 for invalid provider on /api/stt', async () => {
    const response = await fetch(`${baseUrl}/api/stt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'invalid-provider' }),
    });

    assert.equal(response.status, 400);
    const body = (await response.json()) as { error?: string };
    assert.equal(body.error, 'Validation failed');
  });

  it('returns 400 for invalid UUID on /api/catalog/:id', async () => {
    const response = await fetch(`${baseUrl}/api/catalog/not-a-uuid`);

    assert.equal(response.status, 400);
    const body = (await response.json()) as { error?: string };
    assert.equal(body.error, 'Validation failed');
  });

  it('returns 400 for invalid UUID on /api/inventory/:id', async () => {
    const response = await fetch(`${baseUrl}/api/inventory/not-a-uuid`);

    assert.equal(response.status, 400);
    const body = (await response.json()) as { error?: string };
    assert.equal(body.error, 'Validation failed');
  });
});
