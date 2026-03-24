import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { hashPassword, signAccessToken } from '@/lib/auth';
import { created, fail, toResponse, validationError } from '@/lib/http';
import { UserModel } from '@/models/User';
import { registerSchema } from '@/lib/validators';
import { validateRequest } from '@/middleware/auth';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    // Validate request
    const validation = await validateRequest(request, registerSchema);
    if (validation.error) return validation.error;
    if (!validation.data) return toResponse(validationError([{ field: 'body', message: 'Request body is required' }]));

    const { name, email, password, role, mobile } = validation.data;

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return toResponse(fail('User with this email already exists', 'USER_EXISTS', undefined, 409));
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await UserModel.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'student',
      mobile,
      isActive: true,
      status: 1,
      skills: [],
      enrolledCourses: [],
      createdCourses: [],
    });

    // Generate JWT token
    const token = signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return toResponse(created({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    }, 'User registered successfully'));
  } catch (error: any) {
    console.error('Registration error:', error);
    return toResponse(fail(
      error.message || 'Registration failed',
      'REGISTRATION_FAILED',
      undefined,
      500
    ));
  }
}
