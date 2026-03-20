import { connectToDatabase } from '@/lib/db';
import { created, fail, handleError, parseJson } from '@/lib/http';
import { validateEmail } from '@/lib/validators';
import { SubscriptionModel } from '@/models/Subscription';

export async function POST(request: Request) {
  try {
    const body = await parseJson<{ email?: string; source?: string }>(request);
    const validationError = validateEmail(body.email);
    if (validationError) return fail(validationError, 422);

    await connectToDatabase();
    const subscription = await SubscriptionModel.findOneAndUpdate(
      { email: body.email!.toLowerCase() },
      { email: body.email!.toLowerCase(), source: body.source || 'website' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return created({
      id: String(subscription!._id),
      email: subscription!.email,
      source: subscription!.source,
      message: 'Subscribed successfully',
    });
  } catch (error) {
    return handleError(error);
  }
}

