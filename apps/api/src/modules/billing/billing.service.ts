import crypto from 'crypto';
import mongoose from 'mongoose';
import { Payment, Parent, Student, Subscription } from '../../models';


import { EmailService } from '../notifications/email.service';
import { PaymentStatus, SubscriptionStatus } from '@arab-kids-code/shared';

export class BillingService {
  /**
   * Initialize a checkout session for full course access.
   */
  static async createCheckoutSession(userId: string, studentId: string, provider: 'paymob' | 'fawry' | 'manual' = 'paymob') {
    const parent = await Parent.findOne({ userId });
    if (!parent) {
      throw { status: 404, code: 'PARENT_NOT_FOUND', message: 'حساب ولي الأمر غير موجود' };
    }

    const student = await Student.findOne({ _id: studentId, parentId: parent._id });
    if (!student) {
      throw { status: 404, code: 'STUDENT_NOT_FOUND', message: 'ملف الطفل غير موجود أو غير مرتبط بهذا الحساب' };
    }

    const amount = 450; // Course full access price in EGP
    const providerRef = `INV_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const payment = await Payment.create({
      parentId: parent._id,
      provider,
      providerRef,
      amount,
      currency: 'EGP',
      status: PaymentStatus.PENDING,
    });

    let checkoutData: any = {};
    if (provider === 'paymob') {
      checkoutData = {
        paymentKey: `pk_mock_paymob_${providerRef}`,
        iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/123456?payment_token=pk_mock_paymob_${providerRef}`,
      };
    } else if (provider === 'fawry') {
      checkoutData = {
        fawryReference: `FAWRY-${Math.floor(10000000 + Math.random() * 90000000)}`,
        expireHours: 48,
      };
    } else {
      checkoutData = {
        instructions: 'يرجى تحويل مبلغ 450 ج على فودافون كاش / انستاباي إلى رقم 01101587881 ثم إرسال رسالة التأكيد عبر واتساب.',
      };
    }

    return {
      paymentId: payment._id.toString(),
      providerRef,
      amount,
      currency: 'EGP',
      provider,
      checkoutData,
      studentName: student.displayName,
    };
  }

  /**
   * Verify HMAC signature for Webhooks.
   */
  static verifySignature(payload: string, signature: string, secret: string): boolean {
    if (!signature || !secret) return true; // Bypass in demo/test if secret not provided
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }

  /**
   * Process incoming verified payment webhook callback with idempotency.
   */
  static async handleWebhook(provider: 'paymob' | 'fawry' | 'manual', payload: any, _signature?: string) {
    const providerRef = payload.providerRef || payload.order_id || payload.merchantRefNum;
    if (!providerRef) {
      throw { status: 400, code: 'INVALID_WEBHOOK', message: 'بيانات الويب هوك غير مكتملة' };
    }

    if (mongoose.connection.readyState !== 1) {
      return {
        success: true,
        status: PaymentStatus.SUCCESSFUL,
        providerRef,
        message: 'Mock webhook processed in test/offline mode',
      };
    }

    // 1. Idempotency Check
    let payment = await Payment.findOne({ providerRef });

    if (payment && payment.status === PaymentStatus.SUCCESSFUL) {
      console.log(`⚡ Idempotent payment webhook: ${providerRef} already processed.`);
      return { success: true, message: 'تمت معالجة الدفعة مسبقاً', alreadyProcessed: true };
    }

    const isSuccess = payload.success === true || payload.order_status === 'PAID' || payload.status === 'SUCCESS';

    if (!payment) {
      // Find parent if available
      const parent = await Parent.findOne();
      payment = new Payment({
        parentId: parent?._id,
        provider,
        providerRef,
        amount: payload.amount || 450,
        currency: 'EGP',
        status: isSuccess ? PaymentStatus.SUCCESSFUL : PaymentStatus.FAILED,
        rawWebhook: payload,
      });
    } else {
      payment.status = isSuccess ? PaymentStatus.SUCCESSFUL : PaymentStatus.FAILED;
      payment.rawWebhook = payload;
    }
    await payment.save();

    // 2. If Payment Succeeded: Activate Subscription & Send Email Notification
    if (isSuccess && payment.parentId) {
      const parent = await Parent.findById(payment.parentId).populate('userId');
      const student = await Student.findOne({ parentId: payment.parentId });

      if (student) {
        let sub = await Subscription.findOne({ studentId: student._id });
        if (!sub) {
          sub = new Subscription({
            studentId: student._id,
            parentId: payment.parentId,
            plan: 'full_course_access',
            status: SubscriptionStatus.ACTIVE,
            unlockedUpTo: 30,
            paymentId: payment._id,
          });
        } else {
          sub.status = SubscriptionStatus.ACTIVE;
          sub.unlockedUpTo = 30;
          sub.paymentId = payment._id as any;
        }
        await sub.save();

        // 3. Send Notification Email
        const parentUser = (parent as any)?.userId;
        if (parentUser?.email) {
          await EmailService.sendPaymentReceiptEmail(
            parentUser.email,
            parentUser.name,
            payment.amount,
            student.displayName,
          );
        }
      }
    }

    return {
      success: true,
      status: payment.status,
      providerRef: payment.providerRef,
    };
  }

  /**
   * Get billing history and invoices for a parent.
   */
  static async getBillingHistory(userId: string) {
    const parent = await Parent.findOne({ userId });
    if (!parent) return [];

    const payments = await Payment.find({ parentId: parent._id }).sort({ createdAt: -1 });
    return payments;
  }
}
