import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkEncryptedData() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not found');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const workflows = await mongoose.connection.db?.collection('workflows').find({}).toArray();
    
    if (!workflows || workflows.length === 0) {
      console.log('No workflows found in database.');
    } else {
      console.log(`Found ${workflows.length} workflows.`);
      workflows.forEach((w, i) => {
        console.log(`\nWorkflow ${i + 1}: ${w.name}`);
        console.log('Nodes structure (checking data encryption):');
        w.nodes.forEach((n: any) => {
          console.log(` - Node ${n.id}: data = "${n.data}"`);
          const isEncrypted = n.data.includes(':');
          console.log(`   Is Encrypted (contains IV separator ":"): ${isEncrypted}`);
        });
      });
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error checking database:', err);
  }
}

checkEncryptedData();
