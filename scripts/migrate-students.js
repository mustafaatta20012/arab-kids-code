const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, '_');
}

async function migrateLegacyStudents() {
  console.log('🚀 Starting legacy student migration to Firebase Auth...');

  try {
    const snap = await db.collection('academy').doc('data').get();
    if (!snap.exists) {
      console.log('⚠️ Document academy/data not found.');
      return;
    }

    const legacyData = snap.data();
    const students = legacyData.students || [];

    console.log(`📋 Found ${students.length} legacy student records.`);

    let countSuccess = 0;
    let countSkipped = 0;

    for (const student of students) {
      const studentName = (student.name || '').trim();
      const password = (student.passPlain || student.pass || '123456').trim();
      const parentName = (student.parentName || studentName).trim();

      if (!studentName) continue;

      const slug = sanitizeString(studentName);
      const syntheticEmail = `student_${slug}@student.arabkidscode.local`;

      try {
        let userRecord;
        try {
          userRecord = await auth.getUserByEmail(syntheticEmail);
          console.log(`ℹ️ Auth user already exists for: ${studentName} (${syntheticEmail})`);
          countSkipped++;
        } catch (notFound) {
          // Create Firebase Auth user
          userRecord = await auth.createUser({
            email: syntheticEmail,
            password: password.length >= 6 ? password : `${password}2026`,
            displayName: studentName,
          });
          console.log(`✅ Created Firebase Auth user: ${studentName} -> UID: ${userRecord.uid}`);
          countSuccess++;
        }

        // Write to new Firestore students/{uid} collection
        await db.collection('students').doc(userRecord.uid).set({
          uid: userRecord.uid,
          studentName: studentName,
          syntheticEmail: syntheticEmail,
          parentName: parentName,
          unlockedLessons: student.unlockedLessons || [1],
          passPlain: password,
          migratedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

      } catch (err) {
        console.error(`❌ Failed migrating student (${studentName}):`, err.message);
      }
    }

    console.log(`\n🎉 Migration finished: ${countSuccess} created, ${countSkipped} skipped.`);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

migrateLegacyStudents();
