import { Buffer } from 'buffer';
import { requireAuth } from '@/lib/auth';
import { grantCourseAccess } from '@/lib/course-access';
import { createReceipt } from '@/lib/course-runtime';
import { connectToDatabase } from '@/lib/db';
import { fail, success, toResponse } from '@/lib/http';
import { getPaymentGatewaySettings } from '@/lib/system-settings';
import { CourseModel } from '@/models/Course';
import { EnrollmentModel } from '@/models/Enrollment';
import { PaymentModel } from '@/models/Payment';
import { UserModel } from '@/models/User';

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const auth = await requireAuth(['student']);
    if ('error' in auth) return auth.error;

    const userId = auth.payload.sub;
    const body = await request.json();
    const courseId = String(body.courseId || '');
    const planName = body.planName ? String(body.planName) : undefined;

    if (!courseId) {
      return toResponse(fail('Course ID is required', 'INVALID_REQUEST', undefined, 400));
    }

    const [course, user, existingEnrollment, settings] = await Promise.all([
      CourseModel.findById(courseId),
      UserModel.findById(userId).lean(),
      EnrollmentModel.findOne({ userId, courseId }).lean(),
      getPaymentGatewaySettings(),
    ]);

    if (!course) {
      return toResponse(fail('Course not found', 'NOT_FOUND', undefined, 404));
    }

    if (!user) {
      return toResponse(fail('User not found', 'NOT_FOUND', undefined, 404));
    }

    if (existingEnrollment && existingEnrollment.paymentStatus === 'paid') {
      return toResponse(success({
        mode: 'already-enrolled',
        enrollmentId: String(existingEnrollment._id),
        redirectUrl: `/dashboard/student/learn/${String(existingEnrollment._id)}`,
      }));
    }

    const plans = Array.isArray(course.plans)
      ? (course.plans as Array<{ _id?: unknown; name?: string; price?: number }>)
      : [];
    const selectedPlan = plans.find((plan) => String(plan.name) === planName || String(plan._id) === planName);
    const amount = Number(selectedPlan?.price ?? course.price ?? 0);
    const currency = settings.currency || 'INR';
    const receipt = createReceipt('course');

    if (settings.active && settings.keyId && settings.keySecret) {
      const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${settings.keyId}:${settings.keySecret}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency,
          receipt,
          notes: {
            courseId,
            userId,
            planName: planName || '',
          },
        }),
      });

      const razorpayPayload = await razorpayResponse.json().catch(() => ({}));
      if (!razorpayResponse.ok || !razorpayPayload?.id) {
        return toResponse(fail(
          razorpayPayload?.error?.description || 'Unable to create Razorpay order',
          'PAYMENT_ORDER_FAILED',
          undefined,
          502
        ));
      }

      const payment = await PaymentModel.create({
        userId,
        amount,
        currency,
        status: 'pending',
        paymentMethod: 'razorpay',
        provider: 'razorpay',
        transactionId: receipt,
        providerOrderId: razorpayPayload.id,
        receipt,
        customerName: user.name,
        customerEmail: user.email,
        courseId,
        courseTitle: course.title,
        purpose: 'course',
        metadata: { planName: planName || '', gatewayMode: settings.testMode ? 'test' : 'live' },
        gatewayResponse: razorpayPayload,
      });

      return toResponse(success({
        mode: 'razorpay',
        paymentId: String(payment._id),
        orderId: razorpayPayload.id,
        amount: razorpayPayload.amount,
        currency,
        keyId: settings.keyId,
        companyName: settings.companyName,
        themeColor: settings.themeColor,
        course: {
          id: String(course._id),
          title: course.title,
          slug: course.slug,
        },
      }));
    }

    const payment = await PaymentModel.create({
      userId,
      amount,
      currency,
      status: 'completed',
      paymentMethod: 'manual',
      provider: 'manual',
      transactionId: receipt,
      receipt,
      customerName: user.name,
      customerEmail: user.email,
      courseId,
      courseTitle: course.title,
      purpose: 'course',
      metadata: { planName: planName || '', source: 'demo-fallback' },
    });

    const enrollment = await grantCourseAccess({
      userId,
      course,
      paymentId: String(payment._id),
      planName,
      amountPaid: amount,
      currency,
      gatewayOrderId: receipt,
    });

    return toResponse(success({
      mode: 'demo',
      paymentId: String(payment._id),
      enrollmentId: String(enrollment._id),
      redirectUrl: `/dashboard/student/learn/${String(enrollment._id)}`,
    }));
  } catch (error: any) {
    return toResponse(fail(error?.message || 'Unable to start payment', 'PAYMENT_ORDER_FAILED', undefined, 500));
  }
}
