import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, HelpCircle, ArrowRight, Sparkles, ExternalLink, Lock } from 'lucide-react';
import { Seo } from '../components/common/Seo';

export const FreeLessonPage: React.FC = () => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'الدرس الأول: كيف يفكر الكمبيوتر؟ والنظام الثنائي (0 و 1)',
    description: 'شاهد الدرس الأول مجاناً من كورس البرمجة وسكراتش للأطفال مع المهندس مصطفى عطا. مقدمة في النظام الثنائي (Binary) وكيف تنفذ الحواسيب الأوامر مع تطبيق عملي في سكراتش.',
    thumbnailUrl: ['https://arabkidscode.com/images/binary_explainer_poster.jpg'],
    uploadDate: '2026-01-01T08:00:00+02:00',
    duration: 'PT12M',
    contentUrl: 'https://arabkidscode.com/images/النظام_الثنائي.mp4',
    author: {
      '@type': 'Person',
      name: 'المهندس مصطفى عطا',
    },
  };

  const quizQuestions = [
    {
      text: 'ما هي اللغة الأساسية التي يفهمها الكمبيوتر داخل المعالج؟',
      options: ['اللغة العربية والإنجليزية', 'النظام الثنائي (الأصفار والآحاد 0 و 1)', 'لغة الصور فقط'],
      correctIndex: 1,
      explanation: 'ممتاز! المعالج يتعامل مع النبضات الكهربائية المقابلة للصفر والواحد (Binary Code).',
    },
    {
      text: 'ماذا يمثل الرقم 1 والرقم 0 في الدوائر الكهربائية للحاسوب؟',
      options: ['1 يعني وجود كهرباء ON، و 0 يعني إغلاق OFF', 'لا يوجد فرق بينهما', '1 تعني خطأ و 0 تعني صواب'],
      correctIndex: 0,
      explanation: 'أحسنت! 1 تعني مرور التيار الكهربائي و 0 تعني توقفه.',
    },
  ];

  const handleSelectOption = (qIdx: number, oIdx: number) => {
    setSelectedAnswers({ ...selectedAnswers, [qIdx]: oIdx });
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) score++;
    });
    return score;
  };

  return (
    <>
      <Seo
        title="الدرس الأول مجاناً: كيف يفكر الكمبيوتر؟ والنظام الثنائي (0 و 1)"
        description="شاهد الدرس الأول مجاناً من كورس البرمجة وسكراتش للأطفال مع المهندس مصطفى عطا. مقدمة ممتعة في النظام الثنائي ولغة الحاسوب مع تطبيق عملي مباشر في سكراتش."
        keywords="الدرس الأول مجاناً, كورس سكراتش مجاني, النظام الثنائي للأطفال, كيف يفكر الكمبيوتر, المهندس مصطفى عطا, كود أطفال العرب"
        canonicalPath="/lessons/free"
        ogImage="https://arabkidscode.com/images/binary_explainer_poster.jpg"
        jsonLd={jsonLd}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs sm:text-sm font-extrabold tracking-wide inline-flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" /> الدرس 1 من 30 — مجاني بالكامل
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
            الدرس الأول: كيف يفكر الكمبيوتر؟ (النظام الثنائي 0 و 1)
          </h1>
          <p className="text-sky-100 text-base sm:text-lg leading-relaxed">
            مرحباً بك يا بطل! في هذا الدرس الممتع ستتعلم مع المهندس مصطفى عطا كيف يفكر حاسوبك وكيف تحول أفكارك إلى لغة تفهمها الآلة.
          </p>
        </div>
      </div>

      {/* Video Player & Scratch Sandbox Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Video Player */}
        <div className="lg:col-span-8 bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between">
          <div className="relative aspect-video w-full">
            <video
              controls
              poster="/images/binary_explainer_poster.jpg"
              className="w-full h-full object-cover"
            >
              <source src="/images/النظام_الثنائي.mp4" type="video/mp4" />
              متصفحك لا يدعم تشغيل هذا الفيديو.
            </video>
          </div>
          <div className="p-6 bg-slate-800 text-white flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base">فيديو الشرح التفاعلي</h3>
              <p className="text-slate-400 text-xs">مدة الشرح: 12 دقيقة</p>
            </div>
            <a
              href="https://scratch.mit.edu/projects/editor/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md transition-all"
            >
              <ExternalLink className="w-4 h-4" /> فتح محرر سكراتش للتطبيق
            </a>
          </div>
        </div>

        {/* Scratch Embedded sandbox card */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-xl">
              🐱
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">طبق ما تعلمته في سكراتش!</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              افتح بيئة سكراتش الرسمية وجرب تحريك كائن القط وسماع الأصوات الأولى التي تصنعها بنفسك!
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <a
              href="https://scratch.mit.edu/projects/editor/"
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
            >
              <span>افتح محرر سكراتش الآن</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Interactive Quiz Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">اختبر فهمك للدرس الأول!</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">أجب عن الأسئلة واكسب أول 50 نقطة (XP)</p>
          </div>
        </div>

        <div className="space-y-8">
          {quizQuestions.map((q, qIdx) => (
            <div key={qIdx} className="space-y-4 bg-slate-50/80 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                {qIdx + 1}. {q.text}
              </h4>
              <div className="space-y-2.5">
                {q.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[qIdx] === oIdx;
                  const isCorrect = oIdx === q.correctIndex;
                  let btnStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-sky-400 dark:hover:border-sky-500';

                  if (quizSubmitted) {
                    if (isCorrect) btnStyle = 'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-400 dark:border-emerald-600 text-emerald-900 dark:text-emerald-300 font-bold';
                    else if (isSelected) btnStyle = 'bg-rose-100 dark:bg-rose-950/70 border-rose-400 dark:border-rose-600 text-rose-900 dark:text-rose-300';
                  } else if (isSelected) {
                    btnStyle = 'bg-sky-100 dark:bg-sky-950/80 border-sky-500 dark:border-sky-400 text-sky-900 dark:text-sky-200 font-bold';
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => !quizSubmitted && handleSelectOption(qIdx, oIdx)}
                      className={`w-full text-start px-5 py-3.5 rounded-xl border font-medium text-sm transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {quizSubmitted && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                    </button>
                  );
                })}
              </div>

              {quizSubmitted && (
                <p className="text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 p-3 rounded-xl border border-sky-200 dark:border-sky-800">
                  💡 {q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          {!quizSubmitted ? (
            <button
              onClick={() => setQuizSubmitted(true)}
              disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-extrabold text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-sky-700 hover:to-indigo-700"
            >
              تسليم إجابات الاختبار
            </button>
          ) : (
            <div className="flex items-center gap-4 text-emerald-700 dark:text-emerald-300 font-extrabold text-base bg-emerald-50 dark:bg-emerald-950/50 px-6 py-3 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-6 h-6" /> أحسنت! النتيجة: {calculateScore()} من {quizQuestions.length} (كسبت 50 XP!)
            </div>
          )}
        </div>
      </div>

      {/* Subscription CTA Banner for Next Lessons */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-xs">
            <Lock className="w-3.5 h-3.5" /> 29 درساً وموضوعاً متبقياً في الانتظار!
          </div>
          <h2 className="text-3xl sm:text-4xl font-black">جاهز لفتح باقي المنهج وتصميم الألعاب الكاملة؟</h2>
          <p className="text-slate-300 text-base leading-relaxed">
            اشترك الآن لفتح الـ 30 درساً كاملة والمتابعة المستمرة مع المهندس مصطفى عطا على مشروعات طفلك!
          </p>
          <div className="pt-4">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <span>اشترك الآن وافتح باقي الدروس</span>
              <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
