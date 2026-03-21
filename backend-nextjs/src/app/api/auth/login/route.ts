import { connectToDatabase } from '@/lib/db';
import { fail, handleError, ok, parseJson, toResponse } from '@/lib/http';
import { comparePassword, signAccessToken } from '@/lib/auth';
import { loginSchema, LoginInput } from '@/lib/validators';
import { UserModel } from '@/models/User';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = parseJson<LoginInput>(await request.text());
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return toResponse(fail(validationResult.error.issues[0]?.message || 'Validation failed', 'VALIDATION_ERROR', validationResult.error.issues, 422));
    }

    await connectToDatabase();

    const user = await UserModel.findOne({ email: validationResult.data.email.toLowerCase() });
    if (!user) return toResponse(fail('Invalid credentials', 401));

    const passwordMatches = await comparePassword(validationResult.data.password, user.passwordHash);
    if (!passwordMatches) return toResponse(fail('Invalid credentials', 401));

    const token = signAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    });

    return toResponse(ok({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      message: 'Login successful',
    }));
  } catch (error) {
    return handleError(error);
  }
}
