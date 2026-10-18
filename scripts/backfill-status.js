/**
 * scripts/backfill-status.js
 *
 * One-time backfill: sets `status` field for all existing Firestore users.
 *
 * Rules:
 *   - approved: true OR approvalStatus: "approved"  → status: "active"
 *   - approvalStatus: "rejected"                    → status: "suspended"
 *   - everything else                               → status: "pending"
 *   - Never overwrites a doc that already has `status` set.
 *
 * Prerequisites:
 *   1. Download Service Account key from Firebase Console → Project Settings → Service Accounts
 *   2. Save as: scripts/service-account.json  (already in .gitignore)
 *   3. Install: npm install firebase-admin --prefix scripts
 *   4. Run:     node scripts/backfill-status.js
 *
 * This is safe to run multiple times (idempotent — skips docs with status set).
 */

'use strict';

const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function backfill() {
  console.log('🔍  Reading all users from Firestore...\n');

  const snap = await db.collection('users').get();
  const batch = db.batch();

  let willSet   = 0;
  let alreadyOk = 0;
  let total     = snap.size;

  snap.docs.forEach((docSnap) => {
    const data = docSnap.data();

    // Skip if already migrated
    if (data.status) {
      alreadyOk++;
      return;
    }

    let status = 'pending';
    if (data.approved === true || data.approvalStatus === 'approved') {
      status = 'active';
    } else if (data.approvalStatus === 'rejected') {
      status = 'suspended';
    }

    batch.update(docSnap.ref, { status });
    console.log(`  → ${docSnap.id}  (${data.name ?? 'unknown'})  ${data.approvalStatus ?? 'no-status'}  →  status: "${status}"`);
    willSet++;
  });

  if (willSet === 0) {
    console.log('\n✅  All documents already have `status` — nothing to update.\n');
    return;
  }

  console.log(`\n── Preview ─────────────────────────────────────────`);
  console.log(`   Total docs:        ${total}`);
  console.log(`   Already migrated:  ${alreadyOk}`);
  console.log(`   Will set status:   ${willSet}`);
  console.log(`────────────────────────────────────────────────────`);

  // Safety: require explicit confirmation
  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await new Promise((resolve) => {
    rl.question('\nProceed? Type "yes" to commit: ', (answer) => {
      rl.close();
      resolve(answer);
    });
  }).then(async (answer) => {
    if (answer !== 'yes') {
      console.log('Aborted.');
      return;
    }
    await batch.commit();
    console.log(`\n✅  Done! ${willSet} documents updated.\n`);
  });
}

backfill().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
