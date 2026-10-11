const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Service account initialization or default app
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function exportBackup() {
  console.log('🔄 Starting full Firestore backup...');
  
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `backup-academy-${timestamp}.json`);

  try {
    const snap = await db.collection('academy').doc('data').get();
    const data = snap.exists ? snap.data() : {};

    fs.writeFileSync(backupFile, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ Backup successfully created at: ${backupFile}`);
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
  }
}

exportBackup();
