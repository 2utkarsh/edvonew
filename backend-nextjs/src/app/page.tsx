'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('backend_auth_token');
    router.replace(token ? '/admin' : '/admin/login');
  }, [router]);

  return <main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>Redirecting...</main>;
}