/**
 * scripts/backfill-users-to-firestore.js
 *
 * One-time local script: reads all Firebase Authentication users
 * and creates missing `users/{uid}` Firestore documents.
 * - Never overwrites existing documents (uses { merge: false } via setDoc only when doc doesn't exist)
 * - Never changes anyone's role
 *
 * Usage:
 *   1. Download service account key:
 *      Firebase Console → Project Settings → Service Accounts → Generate new private key
 *   2. Save as: scripts/service-account.json  (already in .gitignore)
 *   3. Run:
 *      node scripts/backfill-users-to-firestore.js
 */

'use strict';

const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
const db   = admin.firestore();

async function backfill() {
  console.log('🔍 Fetching all Firebase Auth users...\n');

  let nextPageToken;
  let created = 0;
  let skipped = 0;
  let errors  = 0;

  do {
    const listResult = await auth.listUsers(1000, nextPageToken);

    for (const authUser of listResult.users) {
      const uid = authUser.uid;
      const ref = db.collection('users').doc(uid);

      try {
        const snap = await ref.get();

        if (snap.exists) {
          // Document already exists — only update lastLoginAt if missing
          const data = snap.data();
          if (!data.lastLoginAt && authUser.metadata.lastSignInTime) {
            await ref.update({
              lastLoginAt: admin.firestore.Timestamp.fromDate(
                new Date(authUser.metadata.lastSignInTime)
              ),
            });
            console.log(`  ↻ Updated lastLoginAt for: ${authUser.email ?? uid}`);
          } else {
            skipped++;
          }
          continue;
        }

        // Document is MISSING — create it with defaults
        const phone = authUser.email?.replace('@arabkids.app', '') ?? '';

        await ref.set({
          uid,
          name:              authUser.displayName ?? 'مستخدم',
          email:             authUser.email ?? '',
          phone:             phone.match(/^\d+$/) ? phone : '', // only numeric = phone
          role:              'parent',         // default role (NEVER overwrite existing)
          approved:          false,
          approvalStatus:    'pending',
          subscriptionStart: null,
          subscriptionEnd:   null,
          createdAt:         admin.firestore.Timestamp.fromDate(
            new Date(authUser.metadata.creationTime)
          ),
          lastLoginAt:       authUser.metadata.lastSignInTime
            ? admin.firestore.Timestamp.fromDate(new Date(authUser.metadata.lastSignInTime))
            : null,
        });

        created++;
        console.log(`  ✅ Created: ${authUser.email ?? uid}`);

      } catch (err) {
        errors++;
        console.error(`  ❌ Error for ${uid}:`, err.message);
      }
    }

    nextPageToken = listResult.pageToken;
  } while (nextPageToken);

  console.log('\n── Backfill complete ──────────────────');
  console.log(`  Created:  ${created}`);
  console.log(`  Skipped:  ${skipped} (already existed)`);
  console.log(`  Errors:   ${errors}`);
}

backfill().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
