import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { User, Student, Parent, Course, Lesson, Review, Submission } from '../models';

export const importData = async () => {
  try {
    const backupFile = process.argv[2];
    if (!backupFile) {
      console.error('\n❌ [Data Import Error] Please provide the path to your backup JSON file.');
      console.error('Usage:');
      console.error('  npx ts-node-dev src/scripts/import-data.ts /path/to/backup.json\n');
      process.exit(1);
    }

    const resolvedPath = path.resolve(process.cwd(), backupFile);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`\n❌ [Data Import Error] File not found: ${resolvedPath}\n`);
      process.exit(1);
    }

    console.log(`📦 [Data Import] Reading backup file: ${resolvedPath}...`);
    const rawData = fs.readFileSync(resolvedPath, 'utf-8');
    const data = JSON.parse(rawData);

    console.log(`🍃 [Data Import] Connecting to target database: ${env.MONGODB_URI}...`);
    await mongoose.connect(env.MONGODB_URI);

    if (data.users && data.users.length > 0) {
      console.log(`👤 Importing ${data.users.length} users...`);
      for (const u of data.users) {
        await User.updateOne({ _id: u._id }, { $set: u }, { upsert: true });
      }
    }

    if (data.courses && data.courses.length > 0) {
      console.log(`📚 Importing ${data.courses.length} courses...`);
      for (const c of data.courses) {
        await Course.updateOne({ _id: c._id }, { $set: c }, { upsert: true });
      }
    }

    if (data.lessons && data.lessons.length > 0) {
      console.log(`🎬 Importing ${data.lessons.length} lessons...`);
      for (const l of data.lessons) {
        await Lesson.updateOne({ _id: l._id }, { $set: l }, { upsert: true });
      }
    }

    if (data.students && data.students.length > 0) {
      console.log(`🎓 Importing ${data.students.length} students...`);
      for (const s of data.students) {
        await Student.updateOne({ _id: s._id }, { $set: s }, { upsert: true });
      }
    }

    if (data.parents && data.parents.length > 0) {
      console.log(`👨‍👩‍👧 Importing ${data.parents.length} parents...`);
      for (const p of data.parents) {
        await Parent.updateOne({ _id: p._id }, { $set: p }, { upsert: true });
      }
    }

    if (data.reviews && data.reviews.length > 0) {
      console.log(`⭐ Importing ${data.reviews.length} reviews...`);
      for (const r of data.reviews) {
        await Review.updateOne({ _id: r._id }, { $set: r }, { upsert: true });
      }
    }

    if (data.submissions && data.submissions.length > 0) {
      console.log(`📝 Importing ${data.submissions.length} submissions...`);
      for (const sub of data.submissions) {
        await Submission.updateOne({ _id: sub._id }, { $set: sub }, { upsert: true });
      }
    }

    console.log('✅ [Data Import] Database import completed successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ [Data Import Failed]:', err);
    process.exit(1);
  }
};

importData();
