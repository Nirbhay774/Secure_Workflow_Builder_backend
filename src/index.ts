import createApp from './app';
import database from './config/database';
import config from './config/config';

const startServer = async (): Promise<void> => {
  // 1. Connect to MongoDB before accepting traffic
  console.log('📡 Connecting to database...');
  await database.connect();

  // 2. Create Express app
  const app = createApp();

  // 3. Start listening
  const server = app.listen(config.server.port, () => {
    console.log(
      `🚀  Server running in ${config.server.nodeEnv} mode on port ${config.server.port}`,
    );
    console.log(`   Health: http://localhost:${config.server.port}/health`);
    console.log(`   API:    http://localhost:${config.server.port}/api`);
  });

  // ── Graceful shutdown ────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received – shutting down gracefully...`);
    server.close(async () => {
      await database.disconnect();
      console.log('Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  // Catch unhandled promise rejections
  process.on('unhandledRejection', (reason: unknown) => {
    console.error('Unhandled Rejection:', reason);
    server.close(() => process.exit(1));
  });
};

startServer().catch((err) => {
  console.error('Fatal error during startup:', err);
  process.exit(1);
});
