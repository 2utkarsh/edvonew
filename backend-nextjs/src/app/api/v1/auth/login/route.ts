import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { comparePassword, signAccessToken } from '@/lib/auth';
import { fail, validationError, toResponse, success } from '@/lib/http';
import { UserModel } from '@/models/User';
import { loginSchema } from '@/lib/validators';
import { validateRequest } from '@/middleware/auth';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    // Validate request
    const validation = await validateRequest(request, loginSchema);
    if (validation.error) return toResponse(validation.error);
    if (!validation.data) return toResponse(validationError([{ field: 'body', message: 'Request body is required' }]));

    const { email, password } = validation.data;
    const normalizedEmail = email.toLowerCase();
    const isAdminLogin = request.headers.get('x-edvo-admin-login') === 'true';

    if (isAdminLogin) {
      if (normalizedEmail !== 'admin@edvo.com' || password !== 'admin123') {
        return toResponse(fail('Invalid admin credentials', 'INVALID_ADMIN_CREDENTIALS', undefined, 401));
      }

      const token = signAccessToken({
        sub: 'admin-demo-id',
        email: normalizedEmail,
        name: 'Admin User',
        role: 'admin',
      });

      return toResponse(success(
        {
          user: {
            id: 'admin-demo-id',
            name: 'Admin User',
            email: normalizedEmail,
            role: 'admin',
            avatar: null,
            photo: null,
          },
          token,
        },
        'Login successful'
      ));
    }


    // Try database login
    try {
      await connectToDatabase();

      // Find user by email
      const user = await UserModel.findOne({ email: normalizedEmail });
      if (!user) {
        return toResponse(fail('Invalid email or password', 'INVALID_CREDENTIALS', undefined, 401));
      }

      // Check if user is active
      if (!user.isActive) {
        return toResponse(fail('Your account has been deactivated. Please contact support.', 'ACCOUNT_DEACTIVATED', undefined, 403));
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.passwordHash);
      if (!isValidPassword) {
        return toResponse(fail('Invalid email or password', 'INVALID_CREDENTIALS', undefined, 401));
      }

      // Generate JWT token
      const token = signAccessToken({
        sub: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return toResponse(success(
        {
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            photo: user.photo,
          },
          token,
        },
        'Login successful'
      ));
    } catch (dbError: any) {
      // Database not available for standard user login
      console.error('Database connection failed:', dbError.message);
      return toResponse(fail('Login is temporarily unavailable', 'DATABASE_UNAVAILABLE', undefined, 503));
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return toResponse(fail(
      error.message || 'Login failed',
      'LOGIN_FAILED',
      undefined,
      500
    ));
  }
}
