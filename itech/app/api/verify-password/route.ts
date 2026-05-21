import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, hasJwtSecret } from '@/lib/jwtSecret';

const CORRECT_PASSWORD = (process.env.LMS_HOST_PASSWORD || 'admin123').trim();

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    if (password === CORRECT_PASSWORD) {
      // Create JWT payload
      const payload = {
        metadata: {
          role: 'host',
          iat: Math.floor(Date.now() / 1000), // Issued at
        }
      };

      // Sign the JWT
      const response = NextResponse.json({ success: true });

      if (hasJwtSecret) {
        const accessToken = jwt.sign(payload, JWT_SECRET as jwt.Secret, {
          algorithm: 'HS256'
        });

        response.cookies.set('accessToken', accessToken, {
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
        });
      }

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('JWT signing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
