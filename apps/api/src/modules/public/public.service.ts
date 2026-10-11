import mongoose from 'mongoose';
import { Course, Lesson, Review } from '../../models';
import { ReviewStatus } from '@arab-kids-code/shared';

export class PublicService {
  static async getCourseInfo() {
    let course = null;
    let lessonsCount = 30;

    if (mongoose.connection.readyState === 1) {
      try {
        course = await Course.findOne({ isPublished: true });
        const count = await Lesson.countDocuments({ isPublished: true });
        if (count > 0) lessonsCount = count;
      } catch (err) {
        console.warn('Database query fallback on course info');
      }
    }

    return {
      course: course || {
        title: { ar: 'كورس البرمجة وتصميم الألعاب للأطفال', en: 'Kids Coding & Game Design' },
        description: {
          ar: 'تعلم البرمجة بلغة سكراتش وتصميم الألعاب الممتعة من 0 إلى الاحتراف بصوت وإشراف م. مصطفى عطا',
          en: 'Learn Scratch coding and fun game design from 0 to pro with Eng. Mustafa Atta',
        },
        ageRange: '6-14',
      },
      stats: {
        lessonsCount,
        projectsCount: 50,
        arabicLanguage: '100%',
        targetAge: '6-14 سنة',
      },
      instructor: {
        name: 'م. مصطفى عطا',
        title: 'مهندس سوفت وير ومحاضر برمجة للأطفال',
        whatsapp: '+201101587881',
        phone: '+201101587881',
      },
    };
  }

  static async getFreeLesson() {
    if (mongoose.connection.readyState === 1) {
      try {
        const freeLesson = await Lesson.findOne({ isFree: true, isPublished: true }).populate('courseId');
        if (freeLesson) {
          return freeLesson;
        }
      } catch (err) {
        console.warn('Database query fallback on free lesson');
      }
    }

    // Default Fallback Lesson 1 stub if db not connected / seeded yet
    return {
      order: 1,
      slug: 'lesson-1-binary-system',
      title: { ar: 'الدرس الأول: كيف يفكر الكمبيوتر؟ (النظام الثنائي 0 و 1)', en: 'Lesson 1: Binary System' },
      summary: {
        ar: 'في هذا الدرس التفاعلي الممتع سنتعلم كيف يفكر حاسوبك باستخدام لغة الأصفار والآحاد!',
        en: 'Learn how computers think using 0 and 1 in this fun lesson!',
      },
      isFree: true,
      durationMin: 12,
      scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
      videoUrl: '/images/النظام_الثنائي.mp4',
    };
  }

  static async getApprovedReviews() {
    if (mongoose.connection.readyState === 1) {
      try {
        return await Review.find({ status: ReviewStatus.APPROVED }).sort({ createdAt: -1 }).limit(20);
      } catch (err) {
        console.warn('Database query fallback on reviews');
      }
    }
    return [
      {
        authorName: 'د. مروة الشريف',
        authorType: 'parent',
        rating: 5,
        text: 'الكورس رائع جداً والمهندس مصطفى عطا يشرح بطريقة ممتعة للغاية!',
        status: ReviewStatus.APPROVED,
      },
    ];
  }

  static async submitReview(input: { authorName: string; authorType: 'parent' | 'student'; rating: number; text: string }) {
    if (mongoose.connection.readyState === 1) {
      return await Review.create({
        authorName: input.authorName,
        authorType: input.authorType || 'parent',
        rating: input.rating,
        text: input.text,
        status: ReviewStatus.PENDING,
      });
    }

    return {
      authorName: input.authorName,
      authorType: input.authorType,
      rating: input.rating,
      text: input.text,
      status: ReviewStatus.PENDING,
      createdAt: new Date(),
    };
  }
}
