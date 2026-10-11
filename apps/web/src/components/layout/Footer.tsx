import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Phone, MessageSquare, ShieldCheck, Heart, Facebook } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 dark:text-slate-400 pt-16 pb-12 border-t border-slate-800 dark:border-slate-800/80 transition-colors" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/Friendly 3D Coding Avatar with Colorful Blocks.png"
                alt="شعار كود أطفال العرب"
                width={40}
                height={40}
                loading="lazy"
                className="w-10 h-10 rounded-xl object-contain shadow-md"
              />
              <span className="text-lg font-black text-white">كود أطفال العرب</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              المنصة التفاعلية الأولى لتعليم الأطفال وتنمية التفكير المنطقي عبر سكراتش وتصميم الألعاب بصوت وإشراف <strong>المهندس مصطفى عطا</strong>.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=61592477134761"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="صفحة الفيسبوك الرسمية لمنصة كود أطفال العرب - م. مصطفى عطا"
                className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors shadow-sm"
              >
                <Facebook className="w-4 h-4 fill-current" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-base">روابط سريعة</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/lessons/free" className="hover:text-sky-400 transition-colors">
                  الدرس المجاني الأول
                </Link>
              </li>
              <li>
                <Link to="/curriculum" className="hover:text-sky-400 transition-colors">
                  منهج الـ 30 درساً
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-sky-400 transition-colors">
                  خطط الاشتراك والأسعار
                </Link>
              </li>
              <li>
                <Link to="/instructor" className="hover:text-sky-400 transition-colors">
                  عن المهندس مصطفى عطا
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-bold mb-4 text-base">تواصل مع المعلم</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Facebook className="w-4 h-4 text-blue-400 shrink-0" />
                <a
                  href="https://www.facebook.com/profile.php?id=61592477134761"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="صفحة الفيسبوك الرسمية لمنصة كود أطفال العرب - م. مصطفى عطا"
                  className="hover:underline text-blue-400 font-semibold"
                >
                  صفحة الفيسبوك الرسمية
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <a href="tel:+201101587881" className="hover:underline">
                  +201101587881
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href="https://wa.me/201101587881"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="تواصل مع المعلم عبر واتساب"
                  className="hover:underline text-emerald-400 font-semibold"
                >
                  واتساب: +201101587881
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Child Protection */}
          <div>
            <h4 className="text-white font-bold mb-4 text-base">حماية وأمان الأطفال</h4>
            <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>نلتزم بأعلى معايير حماية بيانات الأطفال (COPPA) وعدم إتاحة المحادثات المفتوحة.</span>
              </div>
              <div className="pt-2">
                <Link to="/privacy" className="text-sky-400 underline hover:text-sky-300">
                  سياسة الخصوصية وحماية بيانات الطفل
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>{t('footer.rights')}</p>
          <p className="flex items-center gap-1">
            صُنعت بكل <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> لأطفال الوطن العربي
          </p>
        </div>
      </div>
    </footer>
  );
};
