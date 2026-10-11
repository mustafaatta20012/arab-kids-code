import React from 'react';
import { ShieldCheck, Lock, EyeOff, FileText } from 'lucide-react';
import { Seo } from '../components/common/Seo';

export const PrivacyPage: React.FC = () => {
  return (
    <>
      <Seo
        title="سياسة الخصوصية وحماية بيانات الأطفال"
        description="سياسة الخصوصية والأمان في منصة كود أطفال العرب لحماية خصوصية الأطفال وبيانات أولياء الأمور بما يتوافق مع المعايير الدولية لأمان الأطفال."
        keywords="سياسة الخصوصية, حماية بيانات الأطفال, أمان الأطفال على الإنترنت, كود أطفال العرب, COPPA"
        canonicalPath="/privacy"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> حماية وأمان بيانات الطفل (COPPA Compliant)
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">سياسة الخصوصية وحماية بيانات الأطفال</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">تاريخ التحديث: أكتوبر 2026 — الإصدار v1.0</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-sky-600 dark:text-sky-400" /> 1. الحد الأدنى من البيانات المجمعة
          </h3>
          <p>
            نلتزم في منصة "كود أطفال العرب" بجمع الحد الأدنى المطلوبة فقط لإدارة العملية التعليمية. تقتصر بيانات الطفل على اسم العرض، سنة الميلاد، وتقدمه في الدروس. لا نطلب من الطفل أبداً بريده الإلكتروني أو عنوان سكنه.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-sky-600 dark:text-sky-400" /> 2. عدم وجود محادثات مفتوحة بين الأطفال
          </h3>
          <p>
            لحماية أطفالنا من أي تواصل غير مرغوب فيه، المنصة خالية تماماً من غرف الدردشة أو الرسائل الشخصية بين الطلاب. يتم التواصل وتلقي التقييمات حصرياً من المعلم فقط.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600 dark:text-sky-400" /> 3. موافقة ولي الأمر وحق الحذف
          </h3>
          <p>
            يحق لولي الأمر في أي وقت طلب تصدير كافة البيانات المتعلقة بأطفاله أو طلب مسح حساب الطفل بالكامل من قواعد بياناتنا عبر التواصل المباشر مع المعلم.
          </p>
        </section>
      </div>
    </div>
    </>
  );
};
