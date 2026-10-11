import dns from 'dns';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { User, Course, Lesson } from '../models';
import { UserRole } from '@arab-kids-code/shared';

if (env.MONGODB_URI.startsWith('mongodb+srv://')) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (err) {}
}

export const seedProductionAdmin = async () => {
  try {
    console.log('🚀 [Seed Admin] Connecting to database...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('🍃 [Seed Admin] Connected to MongoDB.');

    const adminEmail = env.ADMIN_EMAIL || process.env.ADMIN_EMAIL;
    const adminPassword = env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
    const adminName = env.ADMIN_NAME || process.env.ADMIN_NAME || 'م. مصطفى عطا';
    const adminPhone = env.ADMIN_PHONE || process.env.ADMIN_PHONE || '+201101587881';

    if (!adminEmail || !adminPassword) {
      console.error('\n❌ [Seed Admin Error] Missing required credentials:');
      console.error('Please provide ADMIN_EMAIL and ADMIN_PASSWORD in your environment variables.');
      console.error('Example:');
      console.error('  ADMIN_EMAIL="teacher@arabkidscode.com" ADMIN_PASSWORD="StrongTeacherPassword123!" npm run seed:admin\n');
      process.exit(1);
    }

    if (adminPassword.length < 8) {
      console.error('\n❌ [Seed Admin Error] ADMIN_PASSWORD must be at least 8 characters long.\n');
      process.exit(1);
    }

    console.log(`🔐 [Seed Admin] Hashing password with bcrypt (cost factor: 12)...`);
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    // 1. Check if an admin/teacher account already exists with this email or username
    let user = await User.findOne({
      $or: [
        { email: adminEmail.toLowerCase() },
        { phone: adminPhone },
        { role: UserRole.TEACHER },
      ],
    });

    if (user) {
      console.log(`ℹ️ [Seed Admin] Existing Teacher/Admin user found (${user.email || user.name}). Updating credentials...`);
      user.name = adminName;
      user.email = adminEmail.toLowerCase();
      user.phone = adminPhone;
      user.passwordHash = passwordHash;
      user.role = UserRole.TEACHER;
      user.status = 'active';
      user.approved = true;
      user.approvalStatus = 'approved';
      user.failedLogins = 0;
      user.lockedUntil = undefined;
      await user.save();
      console.log(`✅ [Seed Admin] Teacher account updated successfully: ${user.email}`);
    } else {
      user = await User.create({
        name: adminName,
        email: adminEmail.toLowerCase(),
        phone: adminPhone,
        username: adminEmail.split('@')[0],
        passwordHash,
        role: UserRole.TEACHER,
        status: 'active',
        approved: true,
        approvalStatus: 'approved',
        mustChangePassword: false,
        failedLogins: 0,
      });
      console.log(`✅ [Seed Admin] Teacher account created successfully: ${user.email}`);
    }

    // 2. Ensure initial Course exists (do NOT delete existing ones)
    let course = await Course.findOne({ slug: 'scratch-game-design' });
    if (!course) {
      course = await Course.create({
        slug: 'scratch-game-design',
        title: {
          ar: 'كورس البرمجة وتصميم الألعاب للأطفال (سكراتش)',
          en: 'Scratch Coding & Game Design for Kids',
        },
        description: {
          ar: 'كورس ممتع وتفاعلي لتعليم الأطفال التفكير المنطقي وبناء الألعاب الحقيقية باستخدام لغة سكراتش من سن 6 إلى 14 سنة',
          en: 'Fun and interactive course teaching kids logical thinking and game design with Scratch',
        },
        ageRange: '6-14',
        isPublished: true,
        totalLessons: 30,
      });
      console.log(`📚 [Seed Admin] Created main course: ${course.slug}`);
    } else {
      console.log(`📚 [Seed Admin] Main course already exists: ${course.slug}`);
    }

    // 3. Ensure 30 Lesson documents exist
    const lessonCount = await Lesson.countDocuments({ courseId: course._id });
    if (lessonCount === 0) {
      console.log(`🎬 [Seed Admin] Initializing 30 course lesson stubs...`);
      const lessonTitles = [
        'الدرس 1: كيف يفكر الكمبيوتر؟ (النظام الثنائي 0 و 1)',
        'الدرس 2: التعرف على واجهة سكراتش وخلفيات المسرح',
        'الدرس 3: تحريك الكائنات والتحكم في الاتجاهات',
        'الدرس 4: إضافة الأصوات والمؤثرات الممتعة',
        'الدرس 5: رسم وتصميم الشخصيات بنفسك (Costumes)',
        'الدرس 6: لعبة المتاهة البسيطة (تحديد المسارات)',
        'الدرس 7: استخدام الحلقات التكرارية (Repeat Loops)',
        'الدرس 8: الشروط المنطقية (If Then) وتفادي العوائق',
        'الدرس 9: المتغيرات وصناعة عداد النقاط (Variables & Score)',
        'الدرس 10: لعبة جمع التفاح المتساقط (Catch the Fruit)',
        'الدرس 11: المؤقت الزمني والتحدي السريع (Timer)',
        'الدرس 12: استخدام الاستنساخ ومضاعفة الكائنات (Cloning)',
        'الدرس 13: لعبة إطلاق الصواريخ وحماية القلعة',
        'الدرس 14: التفاعل مع مؤشر الفأرة (Mouse Trails)',
        'الدرس 15: تصميم لعبة الرسام التفاعلي (Pen Tool)',
        'الدرس 16: لعبة القفز فوق الحواجز (Dino Jump Game)',
        'الدرس 17: تأثيرات الجاذبية الأرضية في الألعاب',
        'الدرس 18: التراسل بين الكائنات (Broadcasting Messages)',
        'الدرس 19: شاشة البداية وشاشة Game Over الاحترافية',
        'الدرس 20: لعبة بنج بونج الكلاسيكية (Pong Game)',
        'الدرس 21: لعبة سباق السيارات ذات اللاعبين الاثنين',
        'الدرس 22: المؤثرات الصوتية وتسجيل صوتك في اللعبة',
        'الدرس 23: لعبة الذاكرة ومطابقة البطاقات (Memory Match)',
        'الدرس 24: صناعة حوار وقصة تفاعلية متحركة',
        'الدرس 25: استشعار الفيديو واستخدام كاميرا الويب',
        'الدرس 26: لعبة صيد الأسماك في المحيط',
        'الدرس 27: صناعة لعبة منصات متعددة المستويات (Platformer)',
        'الدرس 28: تصميم لعبة لغز الكلمات والأسئلة (Trivia Quiz)',
        'الدرس 29: تحسين الكود واكتشاف الأخطاء البرمجية (Debugging)',
        'الدرس 30: مشروع التخرج النهائي وتجهيز شهادة الإنجاز',
      ];

      for (let i = 0; i < 30; i++) {
        await Lesson.create({
          courseId: course._id,
          order: i + 1,
          slug: `lesson-${i + 1}`,
          title: {
            ar: lessonTitles[i],
            en: `Lesson ${i + 1}: Interactive Game Design & Scratch Practice`,
          },
          summary: {
            ar: `في هذا الدرس يصمم الطفل لعبة ممتعة ويتعلم مفاهيم البرمجة والتفكير المنطقي خطوة بخطوة بصوت م. مصطفى عطا.`,
            en: `In this lesson, kids build games and master coding logic with Scratch.`,
          },
          videoUrl: i === 0 ? '/images/النظام_الثنائي.mp4' : undefined,
          isFree: i === 0,
          durationSeconds: 15 * 60,
          xpReward: 50,
          isPublished: true,
        });
      }
      console.log(`✅ [Seed Admin] Created 30 lessons successfully.`);
    } else {
      console.log(`🎬 [Seed Admin] Lessons already populated (${lessonCount} lessons found).`);
    }

    console.log('\n🎉 [Seed Admin Completed Successfully]');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ [Seed Admin Error]:', error);
    process.exit(1);
  }
};

seedProductionAdmin();
