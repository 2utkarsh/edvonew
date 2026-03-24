import crypto from 'crypto';
import { requireAuth } from '@/lib/auth';
import { buildLearningWorkspaceUrl, grantCourseAccess } from '@/lib/course-access';
import { connectToDatabase } from '@/lib/db';
import { fail, success, toResponse } from '@/lib/http';
import { getPaymentGatewaySettings } from '@/lib/system-settings';
import { CourseModel } from '@/models/Course';
import { PaymentModel } from '@/models/Payment';
import { UserModel } from '@/models/User';

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const auth = await requireAuth(['student']);
    if ('error' in auth) return auth.error;

    const userId = auth.payload.sub;
    const body = await request.json();
    const paymentRecordId = String(body.paymentRecordId || body.paymentId || '');
    const courseId = String(body.courseId || '');
    const orderId = String(body.razorpay_order_id || body.orderId || '');
    const paymentId = String(body.razorpay_payment_id || body.gatewayPaymentId || '');
    const signature = String(body.razorpay_signature || body.signature || '');
    const planName = body.planName ? String(body.planName) : undefined;

    if (!paymentRecordId || !courseId || !orderId || !paymentId || !signature) {
      return toResponse(fail('Missing payment verification fields', 'INVALID_REQUEST', undefined, 400));
    }

    const [settings, payment, course, user] = await Promise.all([
      getPaymentGatewaySettings(),
      PaymentModel.findById(paymentRecordId),
      CourseModel.findById(courseId),
      UserModel.findById(userId).lean(),
    ]);

    if (!settings.keySecret) {
      return toResponse(fail('Payment gateway secret is not configured', 'PAYMENT_GATEWAY_NOT_CONFIGURED', undefined, 400));
    }

    if (!payment || !course || !user) {
      return toResponse(fail('Payment, course, or user not found', 'NOT_FOUND', undefined, 404));
    }

    const expectedSignature = crypto
      .createHmac('sha256', settings.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSignature !== signature) {
      payment.status = 'failed';
      payment.providerPaymentId = paymentId;
      payment.providerSignature = signature;
      await payment.save();
      return toResponse(fail('Invalid payment signature', 'INVALID_SIGNATURE', undefined, 400));
    }

    payment.status = 'completed';
    payment.providerOrderId = orderId;
    payment.providerPaymentId = paymentId;
    payment.providerSignature = signature;
    payment.paymentMethod = 'razorpay';
    payment.provider = 'razorpay';
    payment.gatewayResponse = {
      ...(payment.gatewayResponse || {}),
      verificationStatus: 'verified',
      verifiedAt: new Date().toISOString(),
    };
    await payment.save();

    const enrollment = await grantCourseAccess({
      userId,
      course,
      paymentId: String(payment._id),
      planName,
      amountPaid: payment.amount,
      currency: payment.currency,
      gatewayOrderId: orderId,
    });

    return toResponse(success({
      verified: true,
      paymentId: String(payment._id),
      enrollmentId: String(enrollment._id),
      redirectUrl: buildLearningWorkspaceUrl(String(enrollment._id), course),
    }));
  } catch (error: any) {
    return toResponse(fail(error?.message || 'Unable to verify payment', 'PAYMENT_VERIFY_FAILED', undefined, 500));
  }
}