#!/usr/bin/env node
/**
 * seed-lessons.js
 *
 * Populates Firestore `lessons` collection with 30 Arabic Scratch lessons.
 *
 * Usage:
 *   1. Download service account key from Firebase Console →
 *      Project Settings → Service Accounts → Generate new private key
 *   2. Save as ./service-account.json (gitignored)
 *   3. node scripts/seed-lessons.js
 *
 * After seeding, update videoUrl for each lesson from the Admin panel.
 */
'use strict';

const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// ── Lesson Data (30 Arabic Scratch Lessons) ────────────────────────────────
const lessons = [
  // ── وحدة 1: مدخل إلى عالم البرمجة (1-5) ──────────────────────────────
  {
    order: 1, isFree: true, isPublic: true,
    title: 'الدرس 1: مرحباً بعالم البرمجة — ما هو سكراتش؟',
    titleAr: 'مرحباً بعالم البرمجة — ما هو سكراتش؟',
    description: 'نتعرف في هذا الدرس على عالم البرمجة ولغة سكراتش التفاعلية، ونستعرض واجهة البرنامج وأدواته الرئيسية.',
    durationMin: 20, xpReward: 50, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['التعرف على واجهة سكراتش', 'فهم مفهوم الكتل البرمجية', 'تشغيل أول مشروع'],
  },
  {
    order: 2, isFree: false, isPublic: false,
    title: 'الدرس 2: النظام الثنائي — كيف يفكر الكمبيوتر؟',
    titleAr: 'النظام الثنائي — كيف يفكر الكمبيوتر؟',
    description: 'نتعلم كيف يعمل الكمبيوتر بالأرقام الثنائية (0 و 1) ونفهم كيف تتحول المعلومات إلى أرقام.',
    durationMin: 20, xpReward: 60, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['فهم النظام الثنائي', 'تحويل الأرقام', 'فهم البيانات في الكمبيوتر'],
  },
  {
    order: 3, isFree: false, isPublic: false,
    title: 'الدرس 3: الكائنات والمراحل — اصنع شخصيتك!',
    titleAr: 'الكائنات والمراحل — اصنع شخصيتك!',
    description: 'نتعلم إضافة الكائنات (Sprites) وتعديل المراحل (Stages) وإنشاء عالمنا البرمجي الخاص.',
    durationMin: 25, xpReward: 70, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['إضافة وتعديل الكائنات', 'تغيير خلفيات المرحلة', 'ضبط حجم الكائنات وموضعها'],
  },
  {
    order: 4, isFree: false, isPublic: false,
    title: 'الدرس 4: الحركة والأحداث — حرّك شخصيتك!',
    titleAr: 'الحركة والأحداث — حرّك شخصيتك!',
    description: 'نتعلم كتل الحركة والأحداث لتحريك الكائنات والاستجابة للأزرار، وننشئ مشروعنا التفاعلي الأول.',
    durationMin: 25, xpReward: 80, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['استخدام كتل الحركة', 'ربط الأحداث بالكائنات', 'التحكم بلوحة المفاتيح'],
  },
  {
    order: 5, isFree: false, isPublic: false,
    title: 'الدرس 5: المظاهر والأزياء — فن الرسوم المتحركة!',
    titleAr: 'المظاهر والأزياء — فن الرسوم المتحركة!',
    description: 'نكتشف كتل المظاهر ونتعلم كيفية إنشاء رسوم متحركة بسيطة باستخدام تغيير الأزياء والمؤثرات البصرية.',
    durationMin: 25, xpReward: 80, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['تغيير الأزياء', 'إنشاء رسوم متحركة', 'استخدام المؤثرات البصرية'],
  },

  // ── وحدة 2: المفاهيم البرمجية الأساسية (6-10) ─────────────────────────
  {
    order: 6, isFree: false, isPublic: false,
    title: 'الدرس 6: التسلسل والتكرار — لا تكرر نفسك!',
    titleAr: 'التسلسل والتكرار — لا تكرر نفسك!',
    description: 'نفهم مفهوم التسلسل في البرمجة ونتعلم كتل التكرار (كرر / كرر دائماً) لتنفيذ الأوامر أكثر من مرة.',
    durationMin: 30, xpReward: 90, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['فهم التسلسل', 'استخدام حلقات التكرار', 'بناء أنماط متكررة'],
  },
  {
    order: 7, isFree: false, isPublic: false,
    title: 'الدرس 7: الشرط والقرار — إذا... فإذن!',
    titleAr: 'الشرط والقرار — إذا... فإذن!',
    description: 'نتعلم اتخاذ القرارات في البرمجة باستخدام كتل الشرط (إذا / إذا وإلا) وننشئ مشاريع تفاعلية ذكية.',
    durationMin: 30, xpReward: 100, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['فهم الشرط والقرار', 'استخدام كتل إذا/إذا وإلا', 'بناء منطق التحكم'],
  },
  {
    order: 8, isFree: false, isPublic: false,
    title: 'الدرس 8: المتغيرات — صناديق المعلومات السحرية!',
    titleAr: 'المتغيرات — صناديق المعلومات السحرية!',
    description: 'نكتشف المتغيرات ونتعلم كيف نخزن المعلومات ونعدلها، وننشئ نظام نقاط لأول لعبة بسيطة.',
    durationMin: 30, xpReward: 100, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['إنشاء المتغيرات', 'تعديل قيم المتغيرات', 'بناء نظام نقاط'],
  },
  {
    order: 9, isFree: false, isPublic: false,
    title: 'الدرس 9: الصوت والموسيقى — أضف الحياة للمشروع!',
    titleAr: 'الصوت والموسيقى — أضف الحياة للمشروع!',
    description: 'نتعلم إضافة الأصوات والمؤثرات الصوتية والموسيقى لتجعل مشروعنا حياً وجذاباً.',
    durationMin: 25, xpReward: 80, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['إضافة الأصوات', 'التحكم في الصوت', 'برمجة ألحان موسيقية'],
  },
  {
    order: 10, isFree: false, isPublic: false,
    title: 'الدرس 10: الرسائل والتنسيق — كائنات تتحدث مع بعضها!',
    titleAr: 'الرسائل والتنسيق — كائنات تتحدث مع بعضها!',
    description: 'نتعلم نظام الرسائل لتنسيق أحداث متعددة بين الكائنات وننشئ مشهداً قصصياً تفاعلياً.',
    durationMin: 30, xpReward: 100, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['إرسال واستقبال الرسائل', 'تنسيق أحداث متعددة', 'بناء قصة تفاعلية'],
  },

  // ── وحدة 3: القصص التفاعلية (11-15) ──────────────────────────────────
  {
    order: 11, isFree: false, isPublic: false,
    title: 'الدرس 11: قصة تفاعلية — اكتب قصتك الأولى!',
    titleAr: 'قصة تفاعلية — اكتب قصتك الأولى!',
    description: 'نبني قصة تفاعلية كاملة بمشاهد متعددة وحوار بين الشخصيات مع اختيار نهايات مختلفة.',
    durationMin: 35, xpReward: 120, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['تصميم قصة متعددة المشاهد', 'برمجة الحوار', 'إنشاء نهايات متفرعة'],
  },
  {
    order: 12, isFree: false, isPublic: false,
    title: 'الدرس 12: القوائم والمتغيرات المتعددة — نظّم بياناتك!',
    titleAr: 'القوائم والمتغيرات المتعددة — نظّم بياناتك!',
    description: 'نتعلم القوائم (Lists) لتخزين مجموعة من القيم ونستخدمها في بناء مشاريع أكثر تعقيداً وذكاءً.',
    durationMin: 30, xpReward: 110, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['إنشاء القوائم', 'إضافة وحذف عناصر', 'استخدام القوائم في الألعاب'],
  },
  {
    order: 13, isFree: false, isPublic: false,
    title: 'الدرس 13: الاستشعار — كائنات تلمس بعضها!',
    titleAr: 'الاستشعار — كائنات تلمس بعضها!',
    description: 'نكتشف كتل الاستشعار لاكتشاف التلامس بين الكائنات وننشئ أول لعبة حقيقية مع نظام خسارة.',
    durationMin: 35, xpReward: 120, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['كشف التلامس بين الكائنات', 'كشف الألوان', 'بناء نظام حياة ولعبة'],
  },
  {
    order: 14, isFree: false, isPublic: false,
    title: 'الدرس 14: المسح الضوئي والكلون — انسخ كائناتك!',
    titleAr: 'المسح الضوئي والكلون — انسخ كائناتك!',
    description: 'نتعلم إنشاء نسخ (Clones) من الكائنات وننشئ ألعاباً ديناميكية بعقبات كثيرة ومتحركة.',
    durationMin: 35, xpReward: 130, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['إنشاء الكلونات', 'التحكم بالكلونات', 'بناء عقبات ديناميكية'],
  },
  {
    order: 15, isFree: false, isPublic: false,
    title: 'الدرس 15: مشروع القصة التفاعلية الكامل — اجمع ما تعلمته!',
    titleAr: 'مشروع القصة التفاعلية الكامل',
    description: 'نجمع كل ما تعلمناه في مشروع قصة تفاعلية احترافية مع صوت وحركة وقرارات ونهايات متعددة.',
    durationMin: 45, xpReward: 150, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['تطبيق جميع المفاهيم السابقة', 'بناء مشروع متكامل', 'تجميل واجهة المشروع'],
  },

  // ── وحدة 4: تصميم الألعاب (16-20) ────────────────────────────────────
  {
    order: 16, isFree: false, isPublic: false,
    title: 'الدرس 16: لعبة الاصطياد — صمم لعبتك الأولى!',
    titleAr: 'لعبة الاصطياد — صمم لعبتك الأولى!',
    description: 'نبني لعبة اصطياد كاملة مع مؤقت ونقاط وأصوات وزيادة صعوبة تلقائية كلما تقدم اللاعب.',
    durationMin: 40, xpReward: 140, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['بناء ميكانيكا الاصطياد', 'إضافة المؤقت والنقاط', 'زيادة الصعوبة تدريجياً'],
  },
  {
    order: 17, isFree: false, isPublic: false,
    title: 'الدرس 17: لعبة المتاهة — ابنِ متاهتك وافلت منها!',
    titleAr: 'لعبة المتاهة — ابنِ متاهتك وافلت منها!',
    description: 'نصمم لعبة متاهة ثنائية الأبعاد مع جدران ونقاط نهاية، ونتعلم كشف الاصطدام بالجدران.',
    durationMin: 40, xpReward: 140, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['رسم المتاهة', 'كشف اصطدام الجدران', 'إنشاء مستويات متعددة'],
  },
  {
    order: 18, isFree: false, isPublic: false,
    title: 'الدرس 18: لعبة المنصات — اقفز واجمع النقاط!',
    titleAr: 'لعبة المنصات — اقفز واجمع النقاط!',
    description: 'نتعلم محاكاة الجاذبية والقفز وننشئ لعبة منصات ثنائية مع بطل يجمع النقاط ويتجنب الأعداء.',
    durationMin: 45, xpReward: 150, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['محاكاة الجاذبية', 'ميكانيكا القفز', 'تصميم مستويات'],
  },
  {
    order: 19, isFree: false, isPublic: false,
    title: 'الدرس 19: لعبة إطلاق النار — دافع عن قاعدتك!',
    titleAr: 'لعبة إطلاق النار — دافع عن قاعدتك!',
    description: 'نبني لعبة تبادل إطلاق نار مع قذائف وأعداء وحياة وانتهاء اللعبة، مع مؤثرات بصرية احترافية.',
    durationMin: 45, xpReward: 150, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['بناء نظام إطلاق النار', 'برمجة الأعداء', 'نظام الحياة والخسارة'],
  },
  {
    order: 20, isFree: false, isPublic: false,
    title: 'الدرس 20: مشروع لعبة متكاملة — اختر لعبتك!',
    titleAr: 'مشروع لعبة متكاملة — اختر لعبتك!',
    description: 'مشروع حر: الطالب يختار نوع اللعبة ويطبق كل ما تعلمه في مشروع متكامل باحترافية.',
    durationMin: 50, xpReward: 180, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['تصميم لعبة مستقلة', 'تطبيق جميع المهارات', 'اختبار وتحسين اللعبة'],
  },

  // ── وحدة 5: ألعاب متقدمة (21-25) ─────────────────────────────────────
  {
    order: 21, isFree: false, isPublic: false,
    title: 'الدرس 21: الذكاء الاصطناعي البسيط — أعداء أذكياء!',
    titleAr: 'الذكاء الاصطناعي البسيط — أعداء أذكياء!',
    description: 'نضيف ذكاءً اصطناعياً بسيطاً للأعداء ليتتبعوا اللاعب وننشئ لعبة خفة وهروب.',
    durationMin: 45, xpReward: 160, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['برمجة AI بسيط', 'تتبع اللاعب', 'بناء نظام صعوبة ذكي'],
  },
  {
    order: 22, isFree: false, isPublic: false,
    title: 'الدرس 22: الفيزياء في الألعاب — الجاذبية والارتداد!',
    titleAr: 'الفيزياء في الألعاب — الجاذبية والارتداد!',
    description: 'نتعلم محاكاة قوانين الفيزياء البسيطة كالجاذبية والارتداد وننشئ لعبة كرة مرنة.',
    durationMin: 45, xpReward: 160, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['محاكاة الجاذبية', 'ميكانيكا الارتداد', 'تطبيق قوانين الفيزياء'],
  },
  {
    order: 23, isFree: false, isPublic: false,
    title: 'الدرس 23: لعبة ذاكرة — اختبر نفسك!',
    titleAr: 'لعبة ذاكرة — اختبر نفسك!',
    description: 'نبني لعبة ذاكرة تفاعلية مع بطاقات تُقلب، وتوقيت، ونظام تسجيل عالٍ.',
    durationMin: 40, xpReward: 150, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['بناء نظام البطاقات', 'تتبع الأزواج المتطابقة', 'قياس الوقت والنتيجة'],
  },
  {
    order: 24, isFree: false, isPublic: false,
    title: 'الدرس 24: لوحة المتصدرين — سجّل أعلى نقاطك!',
    titleAr: 'لوحة المتصدرين — سجّل أعلى نقاطك!',
    description: 'نضيف لوحة متصدرين (Leaderboard) لحفظ أعلى النقاط وعرضها بطريقة احترافية.',
    durationMin: 35, xpReward: 130, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['حفظ أعلى نقاط', 'عرض المتصدرين', 'مقارنة النتائج'],
  },
  {
    order: 25, isFree: false, isPublic: false,
    title: 'الدرس 25: واجهة المستخدم — احترف التصميم!',
    titleAr: 'واجهة المستخدم — احترف التصميم!',
    description: 'نتعلم تصميم واجهات مستخدم جميلة: شاشة بداية، شاشة Game Over، قوائم، وأزرار تفاعلية.',
    durationMin: 40, xpReward: 140, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['تصميم شاشات اللعبة', 'إنشاء القوائم', 'تحسين تجربة المستخدم'],
  },

  // ── وحدة 6: مشروع التخرج (26-30) ─────────────────────────────────────
  {
    order: 26, isFree: false, isPublic: false,
    title: 'الدرس 26: التخطيط لمشروع التخرج — فكّر قبل أن تبدأ!',
    titleAr: 'التخطيط لمشروع التخرج',
    description: 'نتعلم كيفية التخطيط لمشروع كبير: رسم المخطط البياني، اختيار الميكانيكا، وتوزيع العمل.',
    durationMin: 30, xpReward: 120, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['رسم مخطط المشروع', 'تقسيم المشروع لمهام', 'التخطيط الزمني'],
  },
  {
    order: 27, isFree: false, isPublic: false,
    title: 'الدرس 27: مشروع التخرج — الجزء الأول: البناء والتأسيس',
    titleAr: 'مشروع التخرج — الجزء الأول',
    description: 'نبدأ تنفيذ مشروع التخرج: بناء الأساسيات والهيكل العام وأول مستوى قابل للعب.',
    durationMin: 50, xpReward: 200, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['بناء هيكل المشروع', 'تنفيذ الميكانيكا الأساسية', 'اختبار أول مستوى'],
  },
  {
    order: 28, isFree: false, isPublic: false,
    title: 'الدرس 28: مشروع التخرج — الجزء الثاني: التفاصيل والصقل',
    titleAr: 'مشروع التخرج — الجزء الثاني',
    description: 'نضيف التفاصيل: مستويات إضافية، أصوات، مؤثرات، وتحسين تجربة اللاعب.',
    durationMin: 50, xpReward: 200, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['إضافة محتوى ومستويات', 'تحسين الأداء', 'صقل تجربة اللاعب'],
  },
  {
    order: 29, isFree: false, isPublic: false,
    title: 'الدرس 29: مشروع التخرج — الجزء الثالث: الاختبار والإصلاح',
    titleAr: 'مشروع التخرج — الجزء الثالث',
    description: 'نختبر المشروع بشكل شامل ونكتشف الأخطاء ونصلحها، ونتعلم مفهوم Bug Fixing.',
    durationMin: 45, xpReward: 180, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['اختبار المشروع', 'اكتشاف وإصلاح الأخطاء', 'تحسين الأداء'],
  },
  {
    order: 30, isFree: false, isPublic: false,
    title: 'الدرس 30: يوم التخرج 🎓 — شارك لعبتك مع العالم!',
    titleAr: 'يوم التخرج 🎓 — شارك لعبتك مع العالم!',
    description: 'يوم الاحتفال! نشر المشروع على Scratch، مشاركته مع الأهل، وتكريم كل بطل أكمل رحلته البرمجية.',
    durationMin: 30, xpReward: 300, videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
    objectives: ['نشر المشروع', 'تقديم العرض النهائي', 'الاحتفال بإنجاز الكورس'],
  },
];

// ── Seed to Firestore ───────────────────────────────────────────────────────
async function seedLessons() {
  console.log(`\n📚 Seeding ${lessons.length} lessons to Firestore...\n`);

  // Check if lessons already exist
  const existing = await db.collection('lessons').limit(1).get();
  if (!existing.empty) {
    console.log('⚠️  Lessons already exist in Firestore.');
    const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });
    await new Promise((resolve) => {
      rl.question('Overwrite? Type YES to continue: ', (answer) => {
        rl.close();
        if (answer !== 'YES') { console.log('❌ Aborted.'); process.exit(0); }
        resolve();
      });
    });
    // Delete existing
    const all = await db.collection('lessons').get();
    const batch = db.batch();
    all.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    console.log('🗑️  Deleted existing lessons.\n');
  }

  // Write lessons with explicit IDs (lesson_1, lesson_2, ...)
  const batch = db.batch();
  lessons.forEach((lesson) => {
    const ref = db.collection('lessons').doc(`lesson_${lesson.order}`);
    batch.set(ref, {
      ...lesson,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();

  console.log(`✅ Successfully seeded ${lessons.length} lessons!\n`);
  console.log('📝 Next steps:');
  console.log('   1. Go to Firebase Console → Firestore → lessons collection');
  console.log('   2. Update the videoUrl field for each lesson with your video links');
  console.log('   OR use the Admin Panel → إدارة الدروس to update lesson videos\n');
  process.exit(0);
}

seedLessons().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
