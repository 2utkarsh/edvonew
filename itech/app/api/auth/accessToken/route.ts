import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { randomString } from '@/lib/client-utils';
import { getJwtSecretBytes, hasJwtSecret } from '@/lib/jwtSecret';

const RANDOM_SUFFIX_LENGTH = 4;

export async function GET(request: NextRequest) {
  if (!hasJwtSecret) {
    return NextResponse.json(
      { error: 'Server authentication is not configured' },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  const existingToken = cookieStore.get('accessToken');
  const participantName = request.nextUrl.searchParams.get('participantName') || 'participant';

  const randomSuffix = randomString(RANDOM_SUFFIX_LENGTH);
  let normalizedMetadata: Record<string, unknown> = {
    identity: `${participantName}__${randomSuffix}`,
    role: 'participant',
  };

  if (existingToken) {
    try {
      let { payload } = await jwtVerify(
        existingToken.value,
        getJwtSecretBytes()
      );

      const metadata =
        payload.metadata && typeof payload.metadata === 'object'
          ? { ...(payload.metadata as Record<string, unknown>) }
          : {};
      const previousRole = metadata.role;

      normalizedMetadata = {
        ...metadata,
        identity:
          (typeof metadata.identity === 'string' && metadata.identity) ||
          (typeof payload.identity === 'string' && payload.identity) ||
          `${participantName}__${randomSuffix}`,
        role:
          previousRole === 'host' || previousRole === 'co-host'
            ? previousRole
            : 'participant',
      };
    } catch (error) {
      console.log('Token validation failed:', error);
    }
  }

  const token = await new SignJWT({
    metadata: normalizedMetadata,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .sign(getJwtSecretBytes());

  const response = NextResponse.json({ message: 'Access token created' });

  response.cookies.set('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  return response;
}
