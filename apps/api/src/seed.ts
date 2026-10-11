import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from './config/env';
import {
  User,
  Parent,
  Student,
  Course,
  Lesson,
  Subscription,
  Review,
  Quiz,
} from './models';
import { UserRole, SubscriptionStatus, ReviewStatus } from '@arab-kids-code/shared';

export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting Database Seeding...');
    await mongoose.connect(env.MONGODB_URI);

    // Clear existing data in dev
    await User.deleteMany({});
    await Parent.deleteMany({});
    await Student.deleteMany({});
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Subscription.deleteMany({});
    await Review.deleteMany({});
    await Quiz.deleteMany({});

    console.log('🧹 Existing database collections cleared.');

    // 1. Create Teacher / Super Admin Account
    const teacherSalt = await bcrypt.genSalt(10);
    const teacherHash = await bcrypt.hash('TeacherPass123!', teacherSalt);

    const teacherUser = await User.create({
      name: 'م. مصطفى عطا',
      email: 'teacher@arabkidscode.com',
      phone: '01101587881',
      username: 'teacher',
      passwordHash: teacherHash,
      role: UserRole.TEACHER,
      status: 'active',
      approved: true,
      approvalStatus: 'approved',
      mustChangePassword: true, // Enforce password change on first login as per spec
    });

    console.log('👨‍🏫 Teacher Account Created:', teacherUser.email);

    // 2. Create Main Course
    const course = await Course.create({
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

    console.log('📚 Course Created:', course.slug);

    // 3. Create 30 Arabic Lessons Stubs & Quizzes
    const arabicLessonTitles = [
      'الدرس 1: كيف يفكر الكمبيوتر؟ (النظام الثنائي 0 و 1)',
      'الدرس 2: التعرف على واجهة سكراتش وخلفيات المسرح',
      'الدرس 3: تحريك الكائنات والتحكم في الاتجاهات',
      'الدرس 4: إضافة الأصوات والمؤثرات الممتعة',
      'الدرس 5: التكرار والحلقات البرمجية (Loops)',
      'الدرس 6: استخدام الشروط والقرارات (If - Then)',
      'الدرس 7: إنشاء متغير النقاط والنتيجة (Variables)',
      'الدرس 8: تصادم الكائنات والتفاعل بين الجوانب',
      'الدرس 9: تصميم لعبة تجميع التفاح الساقط',
      'الدرس 10: تصميم لعبة متاهة الكنز (Maze Game)',
      'الدرس 11: مفاهيم الإحداثيات (X و Y)',
      'الدرس 12: الرسائل والبث البرمجي (Broadcast)',
      'الدرس 13: القلم والرسم الهندسي بالبرمجة',
      'الدرس 14: التحكم بالماوس ومؤشر الفأرة',
      'الدرس 15: تصميم لعبة الطائر القافز (Flappy Bird)',
      'الدرس 16: تصميم لعبة سباق السيارات (Car Racing)',
      'الدرس 17: استخدام الاستشعار واستجابة المفاتيح',
      'الدرس 18: بناء دالة مخصصة (Custom Blocks / My Blocks)',
      'الدرس 19: القوائم والمصفوفات (Lists)',
      'الدرس 20: الجاذبية والفيزياء في الألعاب',
      'الدرس 21: المؤثرات البصرية وتغيير الألوان',
      'الدرس 22: الاستคลون وإنشاء نسخ الكائنات (Cloning)',
      'الدرس 23: تصميم لعبة إطلاق الصواريخ وحماية الفضاء',
      'الدرس 24: إضافة المستويات المتعددة للعبة',
      'الدرس 25: تصميم واجهة البداية وشاشة الفوز والخسارة',
      'الدرس 26: ألعاب الأسئلة والاختبارات الذكية',
      'الدرس 27: دمج الصوت والقصص التفاعلية',
      'الدرس 28: تصميم لعبة كرة السلة أو المضرب',
      'الدرس 29: مراجعة شاملة وإصلاح الأخطاء (Debugging)',
      'الدرس 30: مشروع التخرج النهائي واستلام الشهادة',
    ];

    for (let i = 0; i < 30; i++) {
      const order = i + 1;
      const isFree = order === 1;

      const lesson = await Lesson.create({
        courseId: course._id,
        order,
        slug: `lesson-${order}`,
        title: {
          ar: arabicLessonTitles[i],
          en: `Lesson ${order}`,
        },
        summary: {
          ar: `في هذا الدرس الممتع رقم ${order} سنتعلم خطوة بخطوة مفهوم برمجي جديد وتطبيقه بالعملي في سكراتش.`,
          en: `In lesson ${order}, we will learn a new coding concept step by step using Scratch.`,
        },
        videoAssetId: `video_lesson_${order}`,
        videoUrl: isFree ? '/images/النظام_الثنائي.mp4' : undefined,
        scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
        isFree,
        isPublished: true,
        durationMin: 15,
        xpReward: 50,
      });

      // Create sample quiz for lesson
      const quiz = await Quiz.create({
        lessonId: lesson._id,
        title: `اختبار ${arabicLessonTitles[i]}`,
        questions: [
          {
            text: 'ما هو الهدف الرئيسي من مفهوم هذا الدرس؟',
            options: [
              'فهم البرمجة والتفكير المنطقي',
              'حفظ الأرقام فقط',
              'إغلاق الكمبيوتر',
            ],
            correctIndex: 0,
            explanation: 'البرمجة تساعدنا على حل المشكلات والتفكير المنطقي الممتع!',
          },
        ],
      });

      lesson.quizId = quiz._id as any;
      await lesson.save();
    }

    console.log('📖 30 Lessons and Quizzes Created.');

    // 4. Create Demo Parent & 2 Children
    const parentSalt = await bcrypt.genSalt(10);
    const parentHash = await bcrypt.hash('ParentPass123!', parentSalt);

    const parentUser = await User.create({
      name: 'أحمد علي (ولي أمر)',
      email: 'parent@gmail.com',
      phone: '01000000001',
      passwordHash: parentHash,
      role: UserRole.PARENT,
      status: 'active',
    });

    const parentProfile = await Parent.create({
      userId: parentUser._id,
      phone: '01000000001',
      whatsapp: '01000000001',
      children: [],
    });

    // Student 1: Yassin
    const student1Salt = await bcrypt.genSalt(10);
    const student1Hash = await bcrypt.hash('123456', student1Salt);
    const student1User = await User.create({
      name: 'ياسين أحمد',
      username: 'yassin',
      passwordHash: student1Hash,
      role: UserRole.STUDENT,
      status: 'active',
      approved: true,
      approvalStatus: 'approved',
    });

    const student1Profile = await Student.create({
      userId: student1User._id,
      parentId: parentProfile._id,
      displayName: 'ياسين أحمد',
      birthYear: 2014,
      avatar: 'avatar_robot_blue.png',
      level: 2,
      xp: 250,
      streakDays: 3,
      badges: ['بطل الدرس الأول', 'مبتكر الألعاب'],
    });

    // Student 2: Farida
    const student2Salt = await bcrypt.genSalt(10);
    const student2Hash = await bcrypt.hash('123456', student2Salt);
    const student2User = await User.create({
      name: 'فريدة أحمد',
      username: 'farida',
      passwordHash: student2Hash,
      role: UserRole.STUDENT,
      status: 'active',
      approved: false,
      approvalStatus: 'pending',
    });

    const student2Profile = await Student.create({
      userId: student2User._id,
      parentId: parentProfile._id,
      displayName: 'فريدة أحمد',
      birthYear: 2016,
      avatar: 'avatar_cat_pink.png',
      level: 1,
      xp: 50,
      streakDays: 1,
      badges: ['بطل الدرس الأول'],
    });

    // Link children to parent
    parentProfile.children = [student1Profile._id as any, student2Profile._id as any];
    await parentProfile.save();

    console.log('👨‍👩‍👧 Demo Parent & 2 Students Created.');

    // 5. Active Subscription for Student 1
    await Subscription.create({
      studentId: student1Profile._id,
      parentId: parentProfile._id,
      plan: 'full_course_access',
      status: SubscriptionStatus.ACTIVE,
      startsAt: new Date(),
      unlockedUpTo: 30,
    });

    console.log('🎟️ Active Subscription assigned to Student 1.');

    // 6. Create Approved Testimonials
    await Review.create([
      {
        authorName: 'د. مروة الشريف (والدة حمزة)',
        authorType: 'parent',
        rating: 5,
        text: 'الكورس رائع جداً والمهندس مصطفى عطا يشرح بطريقة ممتعة جداً جعلت ابني يعشق البرمجة ويصمم ألعابه بنفسه!',
        status: ReviewStatus.APPROVED,
      },
      {
        authorName: 'المهندس كريم محمود (والد عمر)',
        authorType: 'parent',
        rating: 5,
        text: 'أفضل استثمار في طفلي. المحتوى منظم والتتابع من الدرس الأول مجاناً حتى المشروع النهائي ممتاز.',
        status: ReviewStatus.APPROVED,
      },
      {
        authorName: 'ياسين أحمد (10 سنوات)',
        authorType: 'student',
        rating: 5,
        text: 'أنا صممت لعبة المتاهة ولعبة التفاح الممتعة! الكورس حلو أوي وشكراً لـ م. مصطفى عطا',
        status: ReviewStatus.APPROVED,
      },
    ]);

    console.log('⭐ Approved Testimonials Created.');
    console.log('✅ Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}
