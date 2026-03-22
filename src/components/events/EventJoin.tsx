'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EventJoinProps {
  eventId: string;
  eventType: 'webinar' | 'workshop' | 'hackathon';
  status: 'Upcoming' | 'Live' | 'Ended';
  isRegistered?: boolean;
}

export default function EventJoin({ eventId, eventType, status, isRegistered }: EventJoinProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(isRegistered || false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/v1/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setRegistered(true);
        alert('Successfully registered for the event!');
      } else {
        alert(data.error?.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/v1/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to live page based on event type
        const livePath = `/${eventType}/${eventId}`;
        window.location.href = livePath;
      } else {
        alert(data.error?.message || 'Failed to join event');
      }
    } catch (error) {
      console.error('Join error:', error);
      alert('Failed to join event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'Ended') {
    return (
      <button disabled className="px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed">
        Event Ended
      </button>
    );
  }

  if (status === 'Live') {
    if (!registered) {
      return (
        <button
          onClick={handleRegister}
          disabled={loading}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          {loading ? 'Registering...' : 'Register & Join Now'}
        </button>
      );
    }

    return (
      <button
        onClick={handleJoin}
        disabled={loading}
        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors animate-pulse"
      >
        {loading ? 'Joining...' : '🔴 Join Live Event'}
      </button>
    );
  }

  // Upcoming event
  if (registered) {
    return (
      <div className="text-center">
        <p className="text-green-600 font-medium mb-2">✓ Registered</p>
        <p className="text-sm text-gray-600">You'll be able to join when the event goes live</p>
      </div>
    );
  }

  return (
    <button
      onClick={handleRegister}
      disabled={loading}
      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
    >
      {loading ? 'Registering...' : 'Register for Event'}
    </button>
  );
}
