import React from 'react';
import { MessageSquare } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  return (
    <a
      href="https://wa.me/201101587881?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D9%85.%20%D9%85%D8%B5%D8%B7%D9%81%D9%89%20%D8%B9%D8%B7%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%83%D9%88%D8%B1%D8%B3%20%D8%A7%D9%84%D8%A8%D8%B1%D9%85%D8%AC%D8%A9%20%D9%84%D9%84%D8%A3%D8%B7%D9%81%D8%A7%D9%84"
      target="_blank"
      rel="noreferrer"
      aria-label="Contact Eng. Mustafa Atta on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-full shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all group"
    >
      <MessageSquare className="w-6 h-6 fill-white" />
      <span className="text-sm font-extrabold hidden sm:inline">تواصل مع المحاضر</span>
    </a>
  );
};
