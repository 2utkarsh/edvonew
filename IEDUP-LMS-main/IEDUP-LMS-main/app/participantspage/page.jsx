'use client';

import React, { useEffect, useState } from 'react';
import EnhancedDashboard from '../../components/EnhancedDashboard';

const fallbackParticipant = {
  name: 'Participant',
  email: 'Direct access',
};

export default function ParticipantPage() {
  const [participantInfo, setParticipantInfo] = useState(fallbackParticipant);

  useEffect(() => {
    try {
      const rawParticipant = localStorage.getItem('participantData');

      if (!rawParticipant) {
        return;
      }

      setParticipantInfo(JSON.parse(rawParticipant));
    } catch (error) {
      setParticipantInfo(fallbackParticipant);
    }
  }, []);

  return <EnhancedDashboard variant="participant" participantInfo={participantInfo} />;
}
