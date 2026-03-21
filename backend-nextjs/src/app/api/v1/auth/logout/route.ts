import { NextRequest } from 'next/server';
import { success } from '@/lib/http';

export async function POST(request: NextRequest) {
  // In a real application, you would:
  // 1. Add the token to a blacklist
  // 2. Clear the token from cookies/localStorage on the client
  // 3. Log the logout event
  
  return success(
    { message: 'Logout successful' },
    'Logged out successfully'
  );
}
