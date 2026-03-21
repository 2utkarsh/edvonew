import { connectToDatabase } from '@/lib/db';
import { fail, handleError, ok, parseJson, toResponse } from '@/lib/http';
import { comparePassword, signAccessToken } from '@/lib/auth';
import { LoginInput, validateLoginInput } from '@/lib/validators';
import { UserModel } from '@/models/User';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await parseJson<LoginInput>(request);
    const validationError = validateLoginInput(body);
    if (validationError) return toResponse(fail(validationError, 422));

    await connectToDatabase();

    const user = await UserModel.findOne({ email: body.email!.toLowerCase() });
    if (!user) return toResponse(fail('Invalid credentials', 401));

    const passwordMatches = await comparePassword(body.password!, user.passwordHash);
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
    });
  } catch (error) {
    return handleError(error);
  }
}

