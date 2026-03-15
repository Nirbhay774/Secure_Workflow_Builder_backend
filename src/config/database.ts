import mongoose from 'mongoose';
import config from './config';

class Database {
  private static instance: Database;
  private isConnected = false;

  private constructor() { }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      const conn = await mongoose.connect(config.db.uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.isConnected = true;
      console.log(`✅  MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
      const error = err as NodeJS.ErrnoException & { name?: string };
      const message = error.message ?? String(err);
      console.log("err", err)
      // ── Friendly diagnostics for Atlas ───────────────────
      if (error.code === 'ECONNREFUSED' && message.includes('querySrv')) {
        console.error('\n❌  Cannot reach MongoDB Atlas.');
        console.error('   Possible causes:');
        console.error('   1. Your current IP is not whitelisted in Atlas → Network Access → Add IP');
        console.error('   2. The Atlas cluster is paused → Resume it from https://cloud.mongodb.com');
        console.error(`   URI used: ${config.db.uri}\n`);
      } else if (error.name === 'MongoParseError') {
        console.error('\n❌  Invalid MongoDB URI in .env');
        console.error('   MONGODB_URI must start with "mongodb://" or "mongodb+srv://"');
        console.error(`   Value received: "${config.db.uri}"\n`);
      } else {
        console.error('❌  MongoDB connection error:', err);
      }

      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    await mongoose.disconnect();
    this.isConnected = false;
    console.log('MongoDB disconnected');
  }
}

export default Database.getInstance();
