import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import config from './config/config';
import routes from './routes/index';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

const createApp = (): Application => {
  const app = express();

  // ── Security headers ─────────────────────────────────────
  app.use(helmet());

  // ── CORS ─────────────────────────────────────────────────
  app.use(
    cors({
      origin: config.security.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // ── Body parsers ─────────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());

  // ── HTTP request logger ───────────────────────────────────
  if (config.server.nodeEnv !== 'test') {
    app.use(morgan(config.server.nodeEnv === 'development' ? 'dev' : 'combined'));
  }

  // ── Health check ─────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── API routes ────────────────────────────────────────────
  app.use('/api', routes);

  // ── 404 + Global error handler (must be last) ─────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
