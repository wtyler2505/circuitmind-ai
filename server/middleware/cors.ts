import cors from 'cors';

/**
 * CORS configuration. This is a personal project so we allow all origins.
 * In production, lock this down to the specific frontend domain.
 */
export const corsMiddleware = cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
