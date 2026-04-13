'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function ParticipantLoginPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace('/participant');
  }, [router]);

  return null;
}
