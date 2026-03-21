import { NextRequest } from 'next/server';
import { success } from '@/lib/http';

// GET health check
export async function GET() {
  return Response.json(success(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    'Service is healthy'
  ));
}
