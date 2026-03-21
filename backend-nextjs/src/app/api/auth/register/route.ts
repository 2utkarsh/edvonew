import { connectToDatabase } from '@/lib/db';
import { created, fail, handleError, parseJson, toResponse } from '@/lib/http';
import { hashPassword, signAccessToken } from '@/lib/auth';
import { registerSchema, RegisterInput } from '@/lib/validators';
import { UserModel } from '@/models/User';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = parseJson<RegisterInput>(await request.text());
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return toResponse(fail(validationResult.error.issues[0]?.message || 'Validation failed', 'VALIDATION_ERROR', validationResult.error.issues, 422));
    }

    await connectToDatabase();

    const existingUser = await UserModel.findOne({ email: validationResult.data.email.toLowerCase() });
    if (existingUser) return toResponse(fail('Email is already registered', 409));

    const passwordHash = await hashPassword(validationResult.data.password);
    const user = await UserModel.create({
      name: validationResult.data.name.trim(),
      email: validationResult.data.email.toLowerCase(),
      mobile: validationResult.data.mobile,
      passwordHash,
      role: 'student',
    });

    const token = signAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    });

    return toResponse(created({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      message: 'Registration successful',
    }));
  } catch (error) {
    return handleError(error);
  }
}
