import nodemailer from 'nodemailer';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    secure: false, // true for 465, false for other ports
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
  });

  /**
   * Send Welcome Email to newly registered parent.
   */
  static async sendWelcomeEmail(to: string, parentName: string) {
    const html = `
      <div dir="rtl" style="font-family: Cairo, Tahoma, sans-serif; background-color: #f8fafc; padding: 24px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0369a1; margin-bottom: 16px;">مرحباً بك في منصة كود أطفال العرب! 🚀</h2>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">
            عزيزي ولي الأمر <strong>${parentName}</strong>،<br/>
            سعداء جداً بانضمامكم إلينا! يمكنكم الآن تسجيل أطفالكم ومتابعة رحلتهم الممتعة في تعلم البرمجة وتصميم الألعاب بلغة سكراتش مع المهندس مصطفى عطا.
          </p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="http://localhost:3000/parent" style="background-color: #0284c7; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 12px; font-weight: bold;">
              الدخول للوحة تحكم ولي الأمر
            </a>
          </div>
          <p style="color: #64748b; font-size: 13px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
            لأي استفسارات، تواصل مع المهندس مصطفى عطا عبر واتساب: +201101587881.
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: '"كود أطفال العرب" <noreply@arabkidscode.com>',
        to,
        subject: 'أهلاً بك في منصة كود أطفال العرب 🚀',
        html,
      });
      console.log(`✉️ Welcome email sent to: ${to}`);
    } catch (err) {
      console.warn(`Failed to send email to ${to}:`, err);
    }
  }

  /**
   * Send Subscription Confirmation & Receipt Email.
   */
  static async sendPaymentReceiptEmail(to: string, parentName: string, amount: number, studentName: string) {
    const html = `
      <div dir="rtl" style="font-family: Cairo, Tahoma, sans-serif; background-color: #f8fafc; padding: 24px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0;">
          <h2 style="color: #059669; margin-bottom: 16px;">تم تفعيل الكورس بنجاح! ⭐</h2>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">
            عزيزي <strong>${parentName}</strong>،<br/>
            تم استلام مبلغ <strong>${amount} جنيه مصري</strong> وتفعيل كافة دروس الكورس الـ 30 للبطل <strong>${studentName}</strong> مدى الحياة!
          </p>
          <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #065f46; font-size: 14px;">
              ✅ تم فتح الـ 30 درساً كاملة ومشروعات سكراتش ومتابعة المعلم.
            </p>
          </div>
          <div style="margin: 24px 0; text-align: center;">
            <a href="http://localhost:3000/student" style="background-color: #059669; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 12px; font-weight: bold;">
              بدء الدروس الآن للبطل ${studentName}
            </a>
          </div>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: '"كود أطفال العرب" <billing@arabkidscode.com>',
        to,
        subject: `إيصال دفع وتفعيل الكورس للبطل ${studentName} ⭐`,
        html,
      });
      console.log(`✉️ Receipt email sent to: ${to}`);
    } catch (err) {
      console.warn(`Failed to send receipt to ${to}:`, err);
    }
  }

  /**
   * Send Weekly Progress Summary Report Email.
   */
  static async sendWeeklyProgressReportEmail(to: string, parentName: string, studentName: string, completedLessons: number, xp: number, streak: number) {
    const html = `
      <div dir="rtl" style="font-family: Cairo, Tahoma, sans-serif; background-color: #f8fafc; padding: 24px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0284c7; margin-bottom: 16px;">التقرير الأسبوعي للبطل ${studentName} 📊</h2>
          <p style="color: #334155; font-size: 15px;">
            مرحباً ${parentName}، إليك ملخص أداء وإنجازات طفلك هذا الأسبوع في كورس سكراتش:
          </p>
          <ul style="color: #334155; line-height: 2; font-size: 14px;">
            <li>🎯 الدروس المنجزة: <strong>${completedLessons} من 30 درساً</strong></li>
            <li>🏆 نقاط الإنجاز (XP): <strong>${xp} XP</strong></li>
            <li>🔥 أيام المواظبة المستمرة: <strong>${streak} أيام</strong></li>
          </ul>
          <div style="margin: 20px 0; text-align: center;">
            <a href="${process.env.CLIENT_URL || 'https://arabkidscode.com'}/parent" style="background-color: #0284c7; color: #ffffff; padding: 10px 24px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px;">
              معاينة التقرير التفصيلي في المنصة
            </a>
          </div>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: '"كود أطفال العرب" <reports@arabkidscode.com>',
        to,
        subject: `التقرير الأسبوعي لتقدم ${studentName} في البرمجة 📊`,
        html,
      });
      console.log(`✉️ Weekly report email sent to: ${to}`);
    } catch (err) {
      console.warn(`Failed to send weekly report to ${to}:`, err);
    }
  }

  /**
   * Send Password Reset Email.
   */
  static async sendPasswordResetEmail(to: string, userName: string, resetUrl: string) {
    const html = `
      <div dir="rtl" style="font-family: Cairo, Tahoma, sans-serif; background-color: #f8fafc; padding: 24px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0284c7; margin-bottom: 16px;">إعادة تعيين كلمة المرور 🔐</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            مرحباً <strong>${userName}</strong>،<br/>
            تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في منصة كود أطفال العرب.
          </p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="${resetUrl}" style="background-color: #0284c7; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px; display: inline-block;">
              اضغط هنا لإعادة تعيين كلمة المرور
            </a>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.6;">
            هذا الرابط صالح لمدة 60 دقيقة فقط من وقت الطلب.<br/>
            إذا لم تكن أنت من طلب إعادة التعيين، فيمكنك تجاهل هذه الرسالة ولن يتم إجراء أي تغيير على حسابك.
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: '"كود أطفال العرب" <security@arabkidscode.com>',
        to,
        subject: 'إعادة تعيين كلمة المرور لمنصة كود أطفال العرب 🔐',
        html,
      });
      console.log(`✉️ Password reset email sent to: ${to}`);
    } catch (err) {
      console.warn(`Failed to send password reset email to ${to}:`, err);
    }
  }
}

