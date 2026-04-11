'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EnhancedDashboard from '../../components/EnhancedDashboard';

export default function ParticipantPage() {
  const router = useRouter();
  const [participantInfo, setParticipantInfo] = useState(null);

  useEffect(() => {
    try {
      const rawParticipant = localStorage.getItem('participantData');

      if (!rawParticipant) {
        router.replace('/participant-login');
        return;
      }

      setParticipantInfo(JSON.parse(rawParticipant));
    } catch (error) {
      router.replace('/participant-login');
    }
  }, [router]);

  if (!participantInfo) {
    return null;
  }

  return <EnhancedDashboard variant="participant" participantInfo={participantInfo} />;
}
