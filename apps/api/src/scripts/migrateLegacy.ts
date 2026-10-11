import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { User, Course, Lesson, Review } from '../models';
import { UserRole, ReviewStatus } from '@arab-kids-code/shared';

export const migrateLegacyPrototypeData = async () => {
  try {
    console.log('🚀 Starting Legacy Prototype Data Migration...');
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(env.MONGODB_URI);
    }

    // 1. Migrate Legacy Testimonials
    const legacyReviews = [
      {
        authorName: 'أم زياد ومريم (الرياض)',
        authorType: 'parent' as const,
        rating: 5,
        text: 'منصة ممتازة جداً وممتعة! ابني زياد (8 سنوات) تعلّم التفكير المنطقي وسكراتش وأصبح ينفذ ألعابه بنفسه بكل شغف.',
        status: ReviewStatus.APPROVED,
      },
      {
        authorName: 'أبو عبدالرحمن (دبي)',
        authorType: 'parent' as const,
        rating: 5,
        text: 'الشرح مبسط ومباشر. م. مصطفى عطا قدّم المنهج بأسلوب مشجع جداً للأطفال وربط التعليم بالترفيه.',
        status: ReviewStatus.APPROVED,
      },
      {
        authorName: 'د. فاطمة (الكويت)',
        authorType: 'parent' as const,
        rating: 5,
        text: 'أفضل استثمار لوقت أطفالي! المنصة سهلة الاستخدام وموزعة بشكل تدريجي رائع يناسب الفئات العمرية من 6 إلى 14 سنة.',
        status: ReviewStatus.APPROVED,
      },
    ];

    let reviewsMigrated = 0;
    for (const r of legacyReviews) {
      const exists = await Review.findOne({ authorName: r.authorName });
      if (!exists) {
        await Review.create(r);
        reviewsMigrated++;
      }
    }
    console.log(`✅ Migrated ${reviewsMigrated} legacy testimonials.`);

    // 2. Ensure Main Course Exists
    let course = await Course.findOne({ slug: 'scratch-game-design' });
    if (!course) {
      course = await Course.create({
        slug: 'scratch-game-design',
        title: {
          ar: 'كورس البرمجة وتصميم الألعاب للأطفال (سكراتش)',
          en: 'Scratch Coding & Game Design for Kids',
        },
        description: {
          ar: 'كورس ممتع وتفاعلي لتعليم الأطفال التفكير المنطقي وبناء الألعاب الحقيقية باستخدام لغة سكراتش',
          en: 'Fun and interactive course teaching kids logical thinking and game design with Scratch',
        },
        ageRange: '6-14',
        isPublished: true,
        totalLessons: 30,
      });
      console.log('✅ Created main course in migration.');
    }

    // 3. Ensure Lesson 1 is marked as Free
    const lesson1 = await Lesson.findOne({ courseId: course._id, order: 1 });
    if (lesson1 && !lesson1.isFree) {
      lesson1.isFree = true;
      await lesson1.save();
      console.log('✅ Lesson 1 confirmed as free.');
    }

    // 4. Ensure Teacher Account exists
    const teacher = await User.findOne({ role: UserRole.TEACHER });
    if (!teacher) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('TeacherPass123!', salt);
      await User.create({
        name: 'م. مصطفى عطا',
        email: 'teacher@arabkidscode.com',
        phone: '01101587881',
        username: 'teacher',
        passwordHash: hash,
        role: UserRole.TEACHER,
        status: 'active',
        mustChangePassword: true,
      });
      console.log('✅ Created default teacher account.');
    }

    console.log('🎉 Migration completed successfully!');
    return { success: true, reviewsMigrated };
  } catch (error) {
    console.error('❌ Migration Error:', error);
    throw error;
  }
};

if (require.main === module) {
  migrateLegacyPrototypeData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
