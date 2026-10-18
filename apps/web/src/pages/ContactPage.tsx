import React, { useState } from 'react';
import { MessageSquare, Phone, Send, CheckCircle2, Facebook } from 'lucide-react';
import { Seo } from '../components/common/Seo';
import { submitContact } from '../services/contactService';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitContact(formData);
      setSubmitted(true);
    } catch (_err) {
      alert('فشل إرسال الرسالة، يرجى المحاولة مرة أخرى أو التواصل عبر واتساب.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo
        title="تواصل مع المعلم مصطفى عطا"
        description="تواصل مباشرة مع المهندس مصطفى عطا للاستفسار وتفعيل اشتراكات كورس البرمجة وسكراتش للأطفال عبر الواتساب أو الفيسبوك أو الهاتف."
        keywords="تواصل مع مدرس برمجة, مصطفى عطا, رقم هاتف كود أطفال العرب, واتساب كود أطفال العرب"
        canonicalPath="/contact"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">تواصل مع المعلم مصطفى عطا</h1>
          <p className="text-slate-600 dark:text-slate-300 font-medium text-base">
            نحن هنا للإجابة عن كافة استفساراتكم ومساعدة طفلكم في رحلة تعلم البرمجة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Contact Info Card */}
          <div className="md:col-span-5 bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-8 space-y-6 flex flex-col justify-between shadow-xl border border-slate-800">
            <div className="space-y-6">
              <h3 className="text-xl font-bold">معلومات التواصل المباشر</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <Facebook className="w-5 h-5 text-blue-400 shrink-0" />
                  <a
                    href="https://www.facebook.com/profile.php?id=61592477134761"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="صفحة الفيسبوك الرسمية لمنصة كود أطفال العرب - م. مصطفى عطا"
                    className="hover:underline text-blue-400 font-bold"
                  >
                    صفحة الفيسبوك الرسمية
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-sky-400 shrink-0" />
                  <a href="tel:+201101587881" className="hover:underline">
                    +201101587881
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                  <a
                    href="https://wa.me/201101587881"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="تواصل مع المعلم عبر واتساب"
                    className="hover:underline text-emerald-400 font-bold"
                  >
                    واتساب: +201101587881
                  </a>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 border-t border-slate-800 pt-4">
              الرد متاح طوال الأسبوع من الساعة 10 صباحاً وحتى 10 مساءً.
            </p>
          </div>

        {/* Contact Form */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">تم إرسال رسالتك بنجاح!</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">سيتواصل معك المهندس مصطفى عطا في أقرب وقت.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">اسمك الكريم</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: أحمد علي"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">رقم الهاتف / الواتساب</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01000000000"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">رسالتك أو استفسارك</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="اكتب استفسارك هنا..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
    </>
  );
};
