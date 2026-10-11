import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Play,
  Sparkles,
  Award,
  Gamepad2,
  Users,
  CheckCircle2,
  Star,
  ChevronDown,
  ArrowRight,
  Brain,
  Video,
  Code2,
  Trophy,
} from 'lucide-react';

import { fetchApi } from '../lib/api';
import { Seo } from '../components/common/Seo';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  useEffect(() => {
    fetchApi('/public/reviews')
      .then((res) => {
        if (res.success && res.data) {
          setReviews(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'كود أطفال العرب - Arab Kids Code',
      url: 'https://arabkidscode.com',
      logo: 'https://arabkidscode.com/images/logo.png',
      description: 'أفضل منصة عربية لتعليم البرمجة وسكراتش للأطفال والناشئين من سن 6 إلى 14 سنة بإشراف م. مصطفى عطا.',
      sameAs: [
        'https://www.facebook.com/profile.php?id=61592477134761',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'المهندس مصطفى عطا',
      jobTitle: 'مهندس برمجيات ومحاضر كورس البرمجة للأطفال',
      worksFor: {
        '@type': 'Organization',
        name: 'كود أطفال العرب',
      },
      image: 'https://arabkidscode.com/images/engMustafa.jpg',
      sameAs: [
        'https://www.facebook.com/profile.php?id=61592477134761',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'كورس البرمجة وسكراتش للأطفال (6 - 14 سنة)',
      description: 'كورس برمجة تفاعلي شامل باللغة العربية لتعليم أساسيات البرمجة، الخوارزميات، وتصميم الألعاب في بيئة سكراتش خطوة بخطوة للأطفال.',
      provider: {
        '@type': 'Organization',
        name: 'كود أطفال العرب',
        sameAs: 'https://arabkidscode.com',
      },
      instructor: {
        '@type': 'Person',
        name: 'المهندس مصطفى عطا',
      },
      inLanguage: 'ar',
      offers: {
        '@type': 'Offer',
        price: '450',
        priceCurrency: 'EGP',
        availability: 'https://schema.org/InStock',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'ما هو السن المناسب لتعلم البرمجة في المنصة؟',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'المنصة مصممة ومناسبة للأطفال والناشئين من سن 6 إلى 14 سنة، مع تدرج شيق وبسيط خطوة بخطوة.',
          },
        },
        {
          '@type': 'Question',
          name: 'هل يحتاج طفلي إلى خبرة مسبقة في الحاسوب؟',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'لا، يبدأ الكورس من الصفر تماماً بالصوت والصورة والتطبيق العملي في بيئة سكراتش.',
          },
        },
        {
          '@type': 'Question',
          name: 'هل يمكن للطفل تجربة درس مجاني قبل الاشتراك؟',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'نعم، يتوفر درس تمهيدي مجاني بالكامل يشرح لغة الحاسوب والنظام الثنائي مع تطبيق عملي مباشر.',
          },
        },
        {
          '@type': 'Question',
          name: 'كيف تتم متابعة مشروعات وألعاب الطفل وتجديد الاشتراك؟',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'يرسل الطالب أعماله ويقوم المهندس مصطفى عطا بتقييمها وتقديم ملاحظات تشجيعية، مع تنبيهات بمواعيد الاشتراك في حسابه.',
          },
        },
      ],
    },
  ];

  return (
    <>
      <Seo
        title="كود أطفال العرب | أفضل منصة لتعليم البرمجة وسكراتش للأطفال 6-14 سنة"
        description="تعلم البرمجة وسكراتش (Scratch) للأطفال والناشئين من سن 6 إلى 14 سنة مع م. مصطفى عطا. 30 درساً عملياً، أكثر من 50 لعبة تفاعلية، دعم مستمر وشهادات معتمدة."
        keywords="تعليم البرمجة للأطفال, سكراتش للأطفال, كورس سكراتش, المهندس مصطفى عطا, Scratch for kids, كود أطفال العرب, برمجة ألعاب للأطفال"
        canonicalPath="/"
        jsonLd={jsonLd}
      />

      <div className="space-y-24 pb-20 overflow-hidden">
        {/* 1. HERO SECTION */}
        <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-sky-50/80 via-white to-slate-50 dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-950 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-start"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100/80 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-xs sm:text-sm font-extrabold shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{t('hero.badge')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight">
                {t('hero.title')}
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {t('hero.subtitle')}
              </p>

              {/* Call To Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/lessons/free"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-lg shadow-xl shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700 hover:scale-105 active:scale-95 transition-all"
                >
                  <span>{t('hero.tryFreeBtn')}</span>
                  <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                </Link>

                <Link
                  to="/pricing"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200 font-extrabold text-lg shadow-md hover:bg-sky-50 dark:hover:bg-slate-800 hover:border-sky-300 transition-all"
                >
                  <span>{t('hero.subscribeBtn')}</span>
                </Link>
              </div>

              {/* Instructor Trust Tag */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800/80">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> م. مصطفى عطا (محاضر الكورس)
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> متابعة وملاحظات على المشروعات
                </span>
              </div>
            </motion.div>

            {/* Right Hero Video Explainer Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-sky-900/15 border-4 border-white dark:border-slate-800 bg-slate-900 aspect-video group cursor-pointer"
                   onClick={() => setVideoModalOpen(true)}>
                <img
                  src="/images/binary_explainer_poster.jpg"
                  alt="مقدمة النظام الثنائي للأطفال"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent flex flex-col justify-between p-6">
                  <span className="self-start px-3 py-1 bg-rose-500 text-white rounded-full text-xs font-extrabold flex items-center gap-1">
                    <Video className="w-3.5 h-3.5" /> درس مجاني توضيحي
                  </span>

                  <div className="flex items-center justify-center my-auto">
                    <div className="w-20 h-20 rounded-full bg-white/90 text-sky-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 ml-1 fill-sky-600" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-extrabold text-lg">الدرس 1: كيف يفكر الكمبيوتر؟</h3>
                    <p className="text-slate-300 text-xs">شاهد الفكرة التفاعلية بصوت م. مصطفى عطا</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. STAT COUNTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { count: '30+', label: t('hero.stats.lessons'), icon: BookOpenIcon, color: 'from-sky-500 to-blue-600' },
            { count: '50+', label: t('hero.stats.projects'), icon: Gamepad2, color: 'from-purple-500 to-indigo-600' },
            { count: '100%', label: t('hero.stats.arabic'), icon: Brain, color: 'from-emerald-500 to-teal-600' },
            { count: '6–14', label: t('hero.stats.ages'), icon: Users, color: 'from-amber-500 to-orange-600' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl shadow-slate-100/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center space-y-3 hover:-translate-y-1 transition-all"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${stat.color} text-white flex items-center justify-center shadow-md`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{stat.count}</span>
              <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. VALUE PROPS / WHY ARAB KIDS CODE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            لماذا يختار آلاف أولياء الأمور منصة "كود أطفال العرب"؟
          </h2>
          <p className="text-slate-600 dark:text-slate-300 font-medium text-base">
            صُمم هذا الكورس خصيصاً ليحول وقت طفلك أمام الشاشة من مجرد استهلاك للألعاب إلى بناء وتصنيع حقيقي لها!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'تنمية التفكير المنطقي وحل المشكلات',
              desc: 'يتعلم الطفل كيف يحلل الأفكار الصعبة ويحولها إلى خطوات برمجية بسيطة خطوة بخطوة.',
              icon: Brain,
              gradient: 'from-sky-500 to-blue-500',
            },
            {
              title: 'بناء 50+ لعبة حقيقية في سكراتش',
              desc: 'لا توجد دروس نظرية جافة! كل درس يصمم فيه الطفل لعبة كاملة تفاعلية مثل متاهة الكنز وسباق السيارات.',
              icon: Gamepad2,
              gradient: 'from-purple-500 to-pink-500',
            },
            {
              title: 'متابعة وتقييم شخصي من المعلم',
              desc: 'يرسل الطفل مشروعاته لسكراتش ويحصل على تقييم تشجيعي ونجمات وملاحظات بصوت المهندس مصطفى عطا.',
              icon: Award,
              gradient: 'from-emerald-500 to-teal-500',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-4 hover:shadow-2xl transition-all"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${item.gradient} text-white flex items-center justify-center shadow-lg`}>
                <item.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3.5. COMPREHENSIVE CURRICULUM & SCRATCH LEARNING JOURNEY (SEO & VALUE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-sky-50 via-indigo-50/40 to-white dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 rounded-3xl p-8 sm:p-12 border border-sky-100 dark:border-slate-800 shadow-xl space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 text-xs font-black">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>منهج متكامل لتعليم البرمجة للأطفال من سن 6 إلى 14 سنة</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              رحلة التعلم مع المهندس مصطفى عطا في بيئة سكراتش (Scratch)
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
              نأخذ بيد طفلك خطوة بخطوة من الصفر بدون أي تعقيد. يتعلم مبادئ علوم الحاسوب والتفكير المنطقي عبر كتل برمجية مرئية ممتعة، ويبني بنفسه ألعاباً وقصصاً متحركة مذهلة!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">مفاهيم البرمجة الأساسية</h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                الحلقات التكرارية (Loops)، الشروط المنطقية (If-Else)، والمتغيرات (Variables) بطريقة عملية وسهلة الفهم.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500 text-white flex items-center justify-center font-bold">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">صناعة أكثر من 50 لعبة</h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                متاهة الكنز، تفادي الحواجز، جمع الفواكه، سباق السيارات، وتحديات تفاعلية يشاركها الطفل مع أصدقائه.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">إشراف وتوجيه المعلم</h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                مراجعة مشروعات الطالب وتقييمها من م. مصطفى عطا مع نصائح لتطوير التفكير وحل المشكلات البرمجية.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">شهادة إتمام معتمدة</h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                يحصل الطفل على شهادة تكريم وإنجاز معتمدة عند إكمال الدروس وتسليم مشروع التخرج النهائي.
              </p>
            </div>
          </div>

          <div className="text-center pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/curriculum"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md transition-all"
            >
              <span>استعرض فهرس الـ 30 درساً بالتفصيل</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
            <Link
              to="/instructor"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-sm transition-all"
            >
              <span>تعرف على المهندس مصطفى عطا</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. TESTIMONIALS SECTION */}
      <section className="bg-slate-900 dark:bg-slate-950 text-white py-20 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black">{t('reviews.title')}</h2>
            <p className="text-slate-400 text-base">{t('reviews.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(reviews.length > 0 ? reviews : defaultTestimonials).map((rev, idx) => (
              <div
                key={idx}
                className="bg-slate-800/90 dark:bg-slate-900 border border-slate-700/80 dark:border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed italic">"{rev.text}"</p>
                </div>
                <div className="pt-4 border-t border-slate-700/60 dark:border-slate-800 font-bold text-sky-400 text-sm">
                  {rev.authorName}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{t('faq.title')}</h2>
          <p className="text-slate-600 dark:text-slate-300 text-base">إجابات عن أكثر التساؤلات شيوعاً لدى أولياء الأمور</p>
        </div>

        <div className="space-y-4">
          {[
            { q: t('faq.q1'), a: t('faq.a1') },
            { q: t('faq.q2'), a: t('faq.a2') },
            { q: t('faq.q3'), a: t('faq.a3') },
            { q: t('faq.q4'), a: t('faq.a4') },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all shadow-sm"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full text-start p-6 font-extrabold text-slate-900 dark:text-white flex items-center justify-between gap-4 text-base sm:text-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown className={`w-5 h-5 text-sky-600 dark:text-sky-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-6 text-slate-600 dark:text-slate-300 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4 bg-slate-50/50 dark:bg-slate-800/40">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* VIDEO EXPLAINER MODAL */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center font-black hover:bg-white/40 transition-colors"
            >
              ✕
            </button>
            <video controls autoPlay className="w-full aspect-video rounded-3xl">
              <source src="/images/النظام_الثنائي.mp4" type="video/mp4" />
              متصفحك لا يدعم تشغيل الفيديو.
            </video>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

const BookOpenIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const defaultTestimonials = [
  {
    authorName: 'د. مروة الشريف (والدة حمزة)',
    rating: 5,
    text: 'الكورس رائع جداً والمهندس مصطفى عطا يشرح بطريقة ممتعة جداً جعلت ابني يعشق البرمجة ويصمم ألعابه بنفسه!',
  },
  {
    authorName: 'المهندس كريم محمود (والد عمر)',
    rating: 5,
    text: 'أفضل استثمار في طفلي. المحتوى منظم والتتابع من الدرس الأول مجاناً حتى المشروع النهائي ممتاز.',
  },
  {
    authorName: 'ياسين أحمد (10 سنوات)',
    rating: 5,
    text: 'أنا صممت لعبة المتاهة ولعبة التفاح الممتعة! الكورس حلو أوي وشكراً لـ م. مصطفى عطا',
  },
];
