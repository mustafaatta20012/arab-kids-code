import React from 'react';
import { CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { Seo } from '../components/common/Seo';

export const PricingPage: React.FC = () => {
  return (
    <>
      <Seo
        title="أسعار وباقات الاشتراك في كورس البرمجة للأطفال"
        description="خطة اشتراك شاملة لكورس سكراتش للأطفال (30 درساً) مع وصول كامل للمشاريع ومتابعة شخصية من المهندس مصطفى عطا وتفعيل فوري عبر واتساب."
        keywords="سعر كورس البرمجة للأطفال, اشتراك كورس سكراتش, باقات كود أطفال العرب, مصطفى عطا, تعلم البرمجة للأطفال"
        canonicalPath="/pricing"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" /> خطة الاشتراك في الكورس الشامل
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
          استثمار ممتع ومستمر في مستقبل طفلك
        </h1>
        <p className="text-slate-600 dark:text-slate-300 font-medium text-base sm:text-lg">
          احصل على وصول كامل ومفتوح مدى الحياة للـ 30 درساً والمشروعات مع متابعة المعلم مصطفى عطا.
        </p>
      </div>

      <div className="max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border-2 border-sky-500 shadow-2xl shadow-sky-500/10 relative">
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-xs font-extrabold shadow-md">
          ⭐ الخيار الأفضل والأكثر طلباً
        </div>

        <div className="text-center space-y-4 pb-8 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">اشتراك الكورس الكامل (30 درساً)</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs">شامل كافة الدروس والاختبارات والتطبيقات العملية والمتابعة</p>

          <div className="pt-2 flex items-baseline justify-center gap-2">
            <span className="text-5xl font-black text-slate-900 dark:text-white">450</span>
            <span className="text-xl font-bold text-slate-600 dark:text-slate-300">جنيه مصري</span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">دفعة واحدة فقط لفتح كافة الدروس مدى الحياة</p>
        </div>

        <div className="py-8 space-y-4">
          {[
            'وصول كامل لمشاهدة الـ 30 درساً كاملاً بجودة عالية HD.',
            'تطبيق عملي مباشر على بيئة سكراتش وتصميم 50+ لعبة.',
            'متابعة وملاحظات شخصية من م. مصطفى عطا على مشروعات الطفل.',
            'حساب خاص لولي الأمر لمتابعة تقدم أطفاله وتفعيل الاشتراكات.',
            'تأكيد الدفع والتفعيل الفوري المباشر عبر واتساب (فودافون كاش / انستاباي / تحويل).',
          ].map((feat, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 space-y-3">
          <a
            href="https://wa.me/201101587881?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D9%85.%20%D9%85%D8%B5%D8%B7%D9%81%D9%89%20%D8%B9%D8%B7%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D9%88%D8%AA%D8%A3%D9%83%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D9%81%D9%8A%20%D9%83%D9%88%D8%B1%D8%B3%20%D8%A7%D9%84%D8%A8%D8%B1%D9%85%D8%AC%D8%A9"
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-lg shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <span>اشترك الآن وتأكيد التفعيل عبر واتساب 💬</span>
            <Zap className="w-5 h-5 fill-white" />
          </a>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-semibold">
            سيتم تفعيل جميع الحصص فورياً لجميع أطفالك فور التواصل معنا عبر الواتساب.
          </p>
        </div>
      </div>
    </div>
    </>
  );
};
