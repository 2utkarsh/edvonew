import { connectToDatabase } from '@/lib/db';
import { created, fail, handleError, parseJson, toResponse } from '@/lib/http';
import { hashPassword, signAccessToken } from '@/lib/auth';
import { validateRegisterInput, RegisterInput } from '@/lib/validators';
import { UserModel } from '@/models/User';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await parseJson<RegisterInput>(request);
    const validationError = validateRegisterInput(body);
    if (validationError) return toResponse(fail(validationError, 422));

    await connectToDatabase();

    const existingUser = await UserModel.findOne({ email: body.email!.toLowerCase() });
    if (existingUser) return toResponse(fail('Email is already registered', 409));

    const passwordHash = await hashPassword(body.password!);
    const user = await UserModel.create({
      name: body.name!.trim(),
      email: body.email!.toLowerCase(),
      mobile: body.mobile,
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
    });
  } catch (error) {
    return handleError(error);
  }
}

