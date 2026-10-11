import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { User, Student, Parent, Course, Lesson, Review, Submission } from '../models';

export const exportData = async () => {
  try {
    console.log('📦 [Data Export] Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);

    const exportPayload = {
      timestamp: new Date().toISOString(),
      users: await User.find({}).select('+passwordHash').lean(),
      students: await Student.find({}).lean(),
      parents: await Parent.find({}).lean(),
      courses: await Course.find({}).lean(),
      lessons: await Lesson.find({}).lean(),
      reviews: await Review.find({}).lean(),
      submissions: await Submission.find({}).lean(),
    };

    const outDir = path.resolve(__dirname, '../../../../backups');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filePath = path.join(outDir, filename);

    fs.writeFileSync(filePath, JSON.stringify(exportPayload, null, 2), 'utf-8');

    console.log(`✅ [Data Export] Data exported successfully to: ${filePath}`);
    console.log(`📊 Statistics:
  - Users: ${exportPayload.users.length}
  - Students: ${exportPayload.students.length}
  - Parents: ${exportPayload.parents.length}
  - Lessons: ${exportPayload.lessons.length}
  - Reviews: ${exportPayload.reviews.length}
  - Submissions: ${exportPayload.submissions.length}
    `);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ [Data Export Failed]:', err);
    process.exit(1);
  }
};

exportData();
