import React from 'react';
import { Phone, MessageSquare, CheckCircle, Sparkles, Facebook } from 'lucide-react';
import { Seo } from '../components/common/Seo';

export const InstructorPage: React.FC = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'المهندس مصطفى عطا',
    alternateName: 'Eng. Mustafa Atta',
    jobTitle: 'Software Engineer & Kids Coding Instructor',
    description: 'مهندس سوفت وير ومحاضر متخصص في تبسيط علوم الكمبيوتر والبرمجة للأطفال والناشئين باستخدام لغة Scratch وبناء الألعاب.',
    image: 'https://arabkidscode.com/images/engMustafa.jpg',
    sameAs: [
      'https://www.facebook.com/profile.php?id=61592477134761',
    ],
  };

  return (
    <>
      <Seo
        title="المهندس مصطفى عطا - مدرب ومحاضر البرمجة للأطفال"
        description="تعرف على المهندس مصطفى عطا (Eng. Mustafa Atta)، مهندس برمجيات ومدرب كودينج للأطفال والناشئين، ومؤسس منصة كود أطفال العرب."
        keywords="المهندس مصطفى عطا, مدرب برمجة أطفال, مدرس سكراتش, تعليم البرمجة للأطفال, كود أطفال العرب"
        canonicalPath="/instructor"
        ogImage="https://arabkidscode.com/images/engMustafa.jpg"
        jsonLd={jsonLd}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* Circular Professional Teacher Photo */}
          <div className="md:col-span-5 text-center flex flex-col items-center space-y-4">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 aspect-square rounded-full p-1.5 bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 shadow-2xl ring-4 ring-sky-500/20 dark:ring-sky-400/10">
              <img
                src="/images/engMustafa.jpg"
                alt="صورة المهندس مصطفى عطا - محاضر ومؤسس منصة كود أطفال العرب"
                loading="lazy"
                width={224}
                height={224}
                className="w-full h-full rounded-full object-cover object-top shadow-inner"
              />
            </div>
            <div>
              <span className="font-black text-xl text-slate-900 dark:text-white block">م. مصطفى عطا</span>
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400">مهندس برمجيات ومحاضر كودينج للأطفال</span>
            </div>
          </div>

          <div className="md:col-span-7 space-y-6 text-start">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-xs font-extrabold">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" /> محاضر الكورس ومؤسس المنصة
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              المهندس مصطفى عطا (Eng. Mustafa Atta)
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
              مهندس سوفت وير ومحاضر متمرس في تبسيط علوم الكمبيوتر والبرمجة للأطفال والناشئين. نجح في تعليم مئات الأطفال كيفية استخدام التفكير المنطقي ولغة سكراتش لصناعة ألعاب برمجية حقيقية بجودة احترافية وأسلوب مشوق.
            </p>

            <div className="space-y-3 pt-2">
              {[
                'خبرة واسعة في تدريس البرمجة للأطفال من عمر 6 إلى 14 سنة.',
                'متابعة ومراجعة شخصية لكافة المشروعات والتطبيقات العملية التي يقدمها الطلاب.',
                'أسلوب ممتع ومحفز يركز على التطبيق العملي وبناء أكثر من 50 لعبة تفاعلية.',
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4">
              <a
                href="https://wa.me/201101587881"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
              >
                <MessageSquare className="w-4 h-4" /> تواصل عبر واتساب (+201101587881)
              </a>

              <a
                href="https://www.facebook.com/profile.php?id=61592477134761"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="صفحة الفيسبوك الرسمية للمهندس مصطفى عطا"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
              >
                <Facebook className="w-4 h-4 fill-current" /> صفحة الفيسبوك الرسمية
              </a>

              <a
                href="tel:+201101587881"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-sm transition-colors"
              >
                <Phone className="w-4 h-4 text-sky-600 dark:text-sky-400" /> اتصل هاتفياً
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
