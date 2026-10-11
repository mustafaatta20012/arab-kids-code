const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function rollbackToBackup(backupFileName) {
  if (!backupFileName) {
    console.error('❌ Please specify a backup file name in backups/ directory.');
    console.log('Usage: node scripts/rollback.js <backup-file-name.json>');
    return;
  }

  const backupFilePath = path.join(__dirname, '..', 'backups', backupFileName);
  if (!fs.existsSync(backupFilePath)) {
    console.error(`❌ Backup file not found at: ${backupFilePath}`);
    return;
  }

  try {
    console.log(`⚠️ Restoring data from ${backupFilePath}...`);
    const rawData = fs.readFileSync(backupFilePath, 'utf8');
    const data = JSON.parse(rawData);

    await db.collection('academy').doc('data').set(data);
    console.log('✅ Rollback successfully completed! Legacy academy/data document restored.');
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
  }
}

const targetBackup = process.argv[2];
rollbackToBackup(targetBackup);
