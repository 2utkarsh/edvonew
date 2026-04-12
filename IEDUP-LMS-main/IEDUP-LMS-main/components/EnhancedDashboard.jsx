'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { generateRoomId } from '@/lib/client-utils';
import { createMeeting, fetchMeetings, updateMeeting } from '@/lib/api';
import { withBasePath } from '@/lib/url';
import RecordingsList from './RecordingsList';
import {
  FaArrowRight,
  FaBolt,
  FaCalendarAlt,
  FaClock,
  FaCopy,
  FaDoorOpen,
  FaEdit,
  FaHistory,
  FaLink,
  FaLock,
  FaMicrophone,
  FaPlus,
  FaSignOutAlt,
  FaTimes,
  FaUserCircle,
  FaVideo,
} from 'react-icons/fa';

const sectionMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: 'easeOut' },
};

const durationOptions = ['15 minutes', '30 minutes', '45 minutes', '1 hour', '90 minutes', '2 hours'];

function toLocalInputString(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function formatClock(date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatCalendar(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatMeetingDate(dateString) {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatMeetingDay(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatRelativeTime(dateString) {
  const diffMs = new Date(dateString).getTime() - Date.now();
  const absMinutes = Math.round(Math.abs(diffMs) / 60000);

  if (absMinutes < 60) {
    return diffMs >= 0 ? `Starts in ${absMinutes}m` : `Ended ${absMinutes}m ago`;
  }

  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;

  if (absMinutes < 1440) {
    return diffMs >= 0 ? `Starts in ${hours}h ${minutes}m` : `Ended ${hours}h ${minutes}m ago`;
  }

  const days = Math.floor(hours / 24);
  return diffMs >= 0 ? `Starts in ${days} day${days > 1 ? 's' : ''}` : `Ended ${days} day${days > 1 ? 's' : ''} ago`;
}

function sameDay(left, right) {
  return left.toDateString() === right.toDateString();
}

function getMeetingRoomSlug(meeting) {
  return meeting?.roomName || meeting?.id || '';
}

function parseMeetingInput(value) {
  const trimmed = (value || '').trim();
  if (!trimmed) {
    return '';
  }

  const withoutQuery = trimmed.split('?')[0].split('#')[0].replace(/\/+$/, '');
  const candidate = withoutQuery.includes('/')
    ? withoutQuery.split('/').filter(Boolean).pop() || ''
    : withoutQuery;

  return candidate.split('$')[0];
}

function firstName(value) {
  return (value || 'there').split(' ')[0];
}

export default function EnhancedDashboard({
  variant = 'admin',
  participantInfo = null,
  onExit,
}) {
  const router = useRouter();
  const isAdmin = variant === 'admin';
  const toastTimerRef = useRef(null);

  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [liveMeetings, setLiveMeetings] = useState([]);
  const [scheduledMeetings, setScheduledMeetings] = useState([]);
  const [pastMeetings, setPastMeetings] = useState([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingMeetingId, setEditingMeetingId] = useState(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [meetingDateTime, setMeetingDateTime] = useState('');
  const [meetingDuration, setMeetingDuration] = useState('45 minutes');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = (message, tone = 'success') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({ message, tone });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  useEffect(() => {
    const refreshTime = () => {
      const now = new Date();
      setCurrentTime(formatClock(now));
      setCurrentDate(formatCalendar(now));
    };

    refreshTime();
    const timer = setInterval(refreshTime, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadMeetings = async (showLoader = true) => {
      if (showLoader && mounted) {
        setIsLoadingMeetings(true);
      }

      try {
        const response = await fetchMeetings();
        if (!mounted) {
          return;
        }

        if (response.success) {
          setLiveMeetings(response.data?.live || []);
          setScheduledMeetings(response.data?.upcoming || []);
          setPastMeetings(response.data?.past || []);
        } else {
          notify(response.error || 'Unable to load meetings right now.', 'error');
        }
      } catch (error) {
        if (mounted) {
          notify('Unable to load meetings right now.', 'error');
        }
      } finally {
        if (mounted) {
          setIsLoadingMeetings(false);
        }
      }
    };

    loadMeetings(true);
    const interval = setInterval(() => loadMeetings(false), 300000);

    return () => {
      mounted = false;
      clearInterval(interval);
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const reloadMeetings = async () => {
    setIsLoadingMeetings(true);
    try {
      const response = await fetchMeetings();
      if (response.success) {
        setLiveMeetings(response.data?.live || []);
        setScheduledMeetings(response.data?.upcoming || []);
        setPastMeetings(response.data?.past || []);
      } else {
        notify(response.error || 'Unable to refresh meetings.', 'error');
      }
    } catch (error) {
      notify('Unable to refresh meetings.', 'error');
    } finally {
      setIsLoadingMeetings(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setEditingMeetingId(null);
    setMeetingLink('');
    setMeetingTitle('');
    setMeetingDescription('');
    setMeetingDateTime('');
    setMeetingDuration('45 minutes');
  };

  const openModal = (type, meeting = null) => {
    setModalType(type);
    setShowModal(true);

    if (type === 'join') {
      setMeetingLink('');
      return;
    }

    if (type === 'schedule') {
      setEditingMeetingId(null);
      setMeetingTitle('');
      setMeetingDescription('');
      setMeetingDuration('45 minutes');
      setMeetingDateTime(toLocalInputString(new Date(Date.now() + 60 * 60 * 1000)));
      return;
    }

    if (type === 'edit' && meeting) {
      setEditingMeetingId(meeting.id);
      setMeetingTitle(meeting.title || '');
      setMeetingDescription(meeting.description || '');
      setMeetingDuration(meeting.duration || '45 minutes');
      setMeetingDateTime(toLocalInputString(new Date(meeting.date)));
    }
  };

  const goToRoom = (roomSlug) => {
    if (!roomSlug) {
      notify('That meeting does not have a valid room yet.', 'error');
      return;
    }

    router.push(withBasePath(`/rooms/${roomSlug}`));
  };

  const copyMeetingLink = async (meeting) => {
    const slug = typeof meeting === 'string' ? meeting : getMeetingRoomSlug(meeting);
    if (!slug || typeof window === 'undefined') {
      notify('Unable to create a room link for this meeting.', 'error');
      return;
    }

    try {
      await navigator.clipboard.writeText(`${window.location.origin}${withBasePath(`/rooms/${slug}`)}`);
      notify('Meeting link copied.');
    } catch (error) {
      notify('Clipboard access is unavailable in this browser.', 'error');
    }
  };

  const startInstantMeeting = () => {
    goToRoom(generateRoomId());
  };

  const openPersonalRoom = () => {
    goToRoom(`personal-${Date.now()}`);
  };

  const handleJoinByLink = () => {
    const meetingId = parseMeetingInput(meetingLink);

    if (!meetingId) {
      notify('Paste a valid room link or meeting id first.', 'error');
      return;
    }

    closeModal();
    goToRoom(meetingId);
  };

  const handleMeetingSave = async () => {
    if (!meetingTitle.trim() || !meetingDateTime) {
      notify('Please complete the required meeting details.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      if (modalType === 'schedule') {
        const response = await createMeeting({
          title: meetingTitle,
          description: meetingDescription,
          date: new Date(meetingDateTime).toISOString(),
          duration: meetingDuration,
        });

        if (!response.success) {
          notify(response.error || 'Unable to schedule the meeting.', 'error');
          return;
        }

        await reloadMeetings();
        closeModal();
        setActiveSection('upcoming');
        notify('Meeting scheduled successfully.');
        return;
      }

      if (modalType === 'edit' && editingMeetingId) {
        const response = await updateMeeting({
          id: editingMeetingId,
          title: meetingTitle,
          description: meetingDescription,
          date: new Date(meetingDateTime).toISOString(),
          duration: meetingDuration,
        });

        if (!response.success) {
          notify(response.error || 'Unable to update the meeting.', 'error');
          return;
        }

        await reloadMeetings();
        closeModal();
        notify('Meeting details updated.');
      }
    } catch (error) {
      notify('Something went wrong while saving the meeting.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExit = () => {
    if (isAdmin) {
      onExit?.();
      return;
    }

    try {
      localStorage.removeItem('participantToken');
      localStorage.removeItem('participantData');
    } catch (error) {
      console.error('Unable to clear participant session:', error);
    }

    router.push('/participant-login');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: FaBolt },
    { id: 'live', label: 'Live', icon: FaBolt },
    { id: 'upcoming', label: 'Upcoming', icon: FaCalendarAlt },
    { id: 'archive', label: 'Archive', icon: FaHistory },
    { id: 'recordings', label: 'Recordings', icon: FaVideo },
  ];

  const liveMeeting = liveMeetings[0] || null;
  const nextScheduledMeeting = scheduledMeetings[0] || null;
  const nextMeeting = liveMeeting || nextScheduledMeeting || null;
  const todayCount = new Set(
    [...liveMeetings, ...scheduledMeetings]
      .filter((meeting) => sameDay(new Date(meeting.date), new Date()))
      .map((meeting) => getMeetingRoomSlug(meeting)),
  ).size;
  const schedulePreview = liveMeetings.length ? liveMeetings : scheduledMeetings;

  const stats = [
    {
      label: 'Live now',
      value: liveMeetings.length,
      copy: isAdmin
        ? 'Rooms that are currently open and active.'
        : 'Sessions you can enter right away.',
    },
    {
      label: 'Scheduled',
      value: scheduledMeetings.length,
      copy: isAdmin
        ? 'Rooms planned and ready for the next session.'
        : 'Meetings waiting in your schedule.',
    },
    {
      label: 'Today',
      value: todayCount,
      copy: 'Rooms taking place today.',
    },
  ];

  const quickActions = isAdmin
    ? [
        {
          title: 'Join from link',
          copy: 'Paste a room url or meeting id and move straight into the session.',
          icon: FaLink,
          alt: true,
          action: () => openModal('join'),
        },
        {
          title: 'Open personal room',
          copy: 'Keep a private room ready for prep, rehearsal, or office hours.',
          icon: FaDoorOpen,
          alt: false,
          action: openPersonalRoom,
        },
        {
          title: 'Open recordings',
          copy: 'Review saved sessions and downloads without leaving the workspace.',
          icon: FaVideo,
          alt: true,
          action: () => setActiveSection('recordings'),
        },
      ]
    : [
        {
          title: 'Upcoming sessions',
          copy: 'Go straight to the rooms that are coming up next.',
          icon: FaCalendarAlt,
          alt: false,
          action: () => setActiveSection('upcoming'),
        },
        {
          title: 'Meeting archive',
          copy: 'See the rooms that have already taken place and keep context close.',
          icon: FaHistory,
          alt: true,
          action: () => setActiveSection('archive'),
        },
        {
          title: 'Open recordings',
          copy: 'Browse available replays and downloads when they are shared.',
          icon: FaVideo,
          alt: false,
          action: () => setActiveSection('recordings'),
        },
      ];

  const renderMeetingCard = (meeting, { archived = false } = {}) => {
    const roomSlug = getMeetingRoomSlug(meeting);
    const statusLabel = archived
      ? 'Completed session'
      : meeting.isLive
        ? 'Live now'
        : meeting.isJoinWindowOpen
          ? 'Ready to join'
          : formatRelativeTime(meeting.date);
    const description = meeting.description?.trim()
      ? meeting.description
      : archived
        ? 'Completed session.'
        : meeting.isLive
          ? 'Session is in progress and available now.'
          : meeting.isJoinWindowOpen
            ? 'Room is open and ready for participants.'
            : 'No description.';
    const primaryActionLabel = archived
      ? 'Open room'
      : meeting.isLive
        ? 'Join live room'
        : 'Join room';
    const timeLabel = meeting.isLive
      ? 'In progress'
      : meeting.isJoinWindowOpen
        ? 'Join window open'
        : meeting.duration || '45 minutes';

    return (
      <article key={meeting.id} className="meeting-card">
        <div className="meeting-card-head">
          <div>
            <p className="meeting-card-kicker">{statusLabel}</p>
            <h3 className="meeting-card-title">{meeting.title || 'Untitled meeting'}</h3>
          </div>
          <div className="meeting-date-pill">
            {meeting.isLive ? 'In progress' : formatMeetingDate(meeting.date)}
          </div>
        </div>

        <p className="meeting-card-description">{description}</p>

        <div className="meeting-chip-row">
          <span className="meta-chip">
            <FaCalendarAlt />
            {meeting.isLive ? 'Live room' : formatMeetingDay(meeting.date)}
          </span>
          <span className="meta-chip">
            <FaClock />
            {timeLabel}
          </span>
          <span className="meta-chip">
            <FaMicrophone />
            Room {roomSlug || 'pending'}
          </span>
        </div>

        <div className="meeting-actions">
          <button
            type="button"
            className="workspace-button workspace-button--primary"
            onClick={() => goToRoom(roomSlug)}
          >
            {primaryActionLabel}
          </button>
          <button
            type="button"
            className="workspace-button workspace-button--ghost"
            onClick={() => copyMeetingLink(meeting)}
          >
            <FaCopy />
            Copy link
          </button>
          {isAdmin ? (
            <button
              type="button"
              className="workspace-button workspace-button--secondary"
              onClick={() => openModal('edit', meeting)}
            >
              <FaEdit />
              Edit details
            </button>
          ) : null}
        </div>
      </article>
    );
  };

  return (
    <main className="dashboard-container">
      <div className="workspace-shell">
        <aside className="workspace-sidebar">
          <div className="workspace-brand">
            <div className="workspace-brand-row">
              <div className="brand-mark">
                <img
                  src={withBasePath("/images/itech-innovation-foundation.jpeg")}
                  alt="Itech Innovation Foundation"
                />
              </div>
              <div className="brand-copy">
                <span className="brand-overline">Itech Studio</span>
                <strong className="brand-name">Learning Rooms</strong>
              </div>
            </div>
            <p className="brand-caption">{isAdmin ? 'Dashboard' : 'Participant access'}</p>
          </div>

          <nav className="side-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`side-nav-button ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <Icon />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="sidebar-profile">
            <div className="profile-head">
              <div className="profile-avatar">
                <FaUserCircle size={24} />
              </div>
              <div>
                <p className="profile-title">{isAdmin ? 'Host' : participantInfo?.name || 'Participant'}</p>
                <p className="profile-subtitle">
                  {isAdmin ? 'Authenticated' : participantInfo?.email || ''}
                </p>
              </div>
            </div>
            <button
              type="button"
              className={`workspace-button ${isAdmin ? 'workspace-button--danger' : 'workspace-button--ghost'}`}
              onClick={handleExit}
            >
              <FaSignOutAlt />
              Sign out
            </button>
          </div>
        </aside>

        <section className="workspace-main">
          <header className="workspace-hero">
            <div className="hero-grid">
              <div>
                <p className="hero-kicker">{isAdmin ? 'Host' : 'Participant'}</p>
                <h1 className="hero-title">{isAdmin ? 'Dashboard' : 'Participant Access'}</h1>
                <p className="hero-copy">
                  {isAdmin
                    ? 'Manage rooms, schedule sessions, and review recordings.'
                    : `Signed in as ${participantInfo?.name || 'Participant'}. View upcoming rooms and recordings.`}
                </p>
              </div>

              <div className="hero-summary">
                {stats.map((stat) => (
                  <div key={stat.label} className="hero-summary-row">
                    <span>{stat.label}</span>
                    <strong>{stat.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-toolbar">
              <div className="hero-toolbar-actions">
                {isAdmin ? (
                  <>
                    <button
                      type="button"
                      className="workspace-button workspace-button--primary"
                      onClick={startInstantMeeting}
                    >
                      <FaVideo />
                      Start room
                    </button>
                    <button
                      type="button"
                      className="workspace-button workspace-button--ghost"
                      onClick={() => openModal('schedule')}
                    >
                      <FaCalendarAlt />
                      Schedule
                    </button>
                    <button
                      type="button"
                      className="workspace-button workspace-button--ghost"
                      onClick={() => openModal('join')}
                    >
                      <FaLink />
                      Join by link
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="workspace-button workspace-button--primary"
                      onClick={() => openModal('join')}
                    >
                      <FaArrowRight />
                      Join by link
                    </button>
                    <button
                      type="button"
                      className="workspace-button workspace-button--ghost"
                      onClick={() => setActiveSection('upcoming')}
                    >
                      <FaCalendarAlt />
                      Upcoming
                    </button>
                    <button
                      type="button"
                      className="workspace-button workspace-button--ghost"
                      onClick={() => setActiveSection('recordings')}
                    >
                      <FaVideo />
                      Recordings
                    </button>
                  </>
                )}
              </div>

              <div className="hero-toolbar-meta">
                <span className="hero-pill">
                  <FaClock />
                  {currentTime}
                </span>
                <span className="hero-pill">
                  <FaCalendarAlt />
                  {currentDate}
                </span>
              </div>
            </div>

            <div className="hero-next-row">
              <span className="hero-next-label">{nextMeeting?.isLive ? 'Live now' : 'Next session'}</span>
              <div className="hero-next-details">
                <strong>{nextMeeting ? nextMeeting.title : 'No live or scheduled session'}</strong>
                <span>
                  {nextMeeting
                    ? nextMeeting.isLive
                      ? 'Session is in progress and ready to join.'
                      : nextMeeting.isJoinWindowOpen
                        ? `Available now / ${nextMeeting.duration || '45 minutes'}`
                        : `${formatMeetingDate(nextMeeting.date)} / ${nextMeeting.duration || '45 minutes'}`
                    : isAdmin
                      ? 'Schedule a room when ready.'
                      : 'Use a shared room link to join.'}
                </span>
              </div>
              <div className="hero-toolbar-actions">
                {nextMeeting ? (
                  <>
                    <button
                      type="button"
                      className="workspace-button workspace-button--primary"
                      onClick={() => goToRoom(getMeetingRoomSlug(nextMeeting))}
                    >
                      {nextMeeting.isLive ? 'Join live room' : 'Join'}
                    </button>
                    <button
                      type="button"
                      className="workspace-button workspace-button--ghost"
                      onClick={() => copyMeetingLink(nextMeeting)}
                    >
                      <FaCopy />
                      Copy link
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </header>

          <section className="content-tabs">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`content-tab ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <Icon />
                  {item.label}
                </button>
              );
            })}
          </section>

          <AnimatePresence mode="wait">
            {activeSection === 'overview' ? (
              <motion.section key="overview" className="content-panel" {...sectionMotion}>
                <div className="panel-header">
                  <div>
                    <h2>Overview</h2>
                    <p>Current schedule and recent activity.</p>
                  </div>
                </div>

                <div className="section-stack">
                  <div className="overview-grid">
                    <article className="overview-card">
                      <h3>
                        {liveMeeting
                          ? 'Live session'
                          : nextScheduledMeeting
                            ? 'Next session'
                            : 'No scheduled session'}
                      </h3>
                      <p>
                        {liveMeeting
                          ? `${liveMeeting.title} is live right now and ready for participants.`
                          : nextScheduledMeeting
                            ? `${nextScheduledMeeting.title} is scheduled for ${formatMeetingDate(nextScheduledMeeting.date)}.`
                          : isAdmin
                            ? 'Create a room or add one to the schedule.'
                            : 'Use a shared room link when a session is available.'}
                      </p>
                      <div className="meeting-actions" style={{ marginTop: '16px' }}>
                        {nextMeeting ? (
                          <button
                            type="button"
                            className="workspace-button workspace-button--primary"
                            onClick={() => goToRoom(getMeetingRoomSlug(nextMeeting))}
                          >
                            {nextMeeting.isLive ? 'Join live room' : 'Join next room'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="workspace-button workspace-button--primary"
                            onClick={isAdmin ? () => openModal('schedule') : () => openModal('join')}
                          >
                            {isAdmin ? 'Schedule a room' : 'Join from link'}
                          </button>
                        )}
                      </div>
                    </article>

                    <article className="overview-card">
                      <h3>{liveMeetings.length ? 'Live rooms' : isAdmin ? 'Upcoming schedule' : 'Your schedule'}</h3>
                      <div className="mini-list">
                        {schedulePreview.slice(0, 4).map((meeting) => (
                          <div key={meeting.id} className="mini-card">
                            <strong>{meeting.title}</strong>
                            <span>{meeting.isLive ? 'Live now' : formatMeetingDate(meeting.date)}</span>
                          </div>
                        ))}
                        {!schedulePreview.length ? (
                          <div className="mini-card">
                            <strong>No upcoming sessions</strong>
                            <span>{isAdmin ? 'New meetings will appear here.' : 'Your next meeting will appear here.'}</span>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  </div>

                  <article className="overview-card">
                    <h3>Recent sessions</h3>
                    <div className="mini-list">
                      {pastMeetings.slice(0, 4).map((meeting) => (
                        <div key={meeting.id} className="mini-card">
                          <strong>{meeting.title}</strong>
                          <span>{formatMeetingDate(meeting.date)}</span>
                        </div>
                      ))}
                      {!pastMeetings.length ? (
                        <div className="mini-card">
                          <strong>No recent sessions</strong>
                          <span>Completed meetings will appear here.</span>
                        </div>
                      ) : null}
                    </div>
                  </article>
                </div>
              </motion.section>
            ) : null}

            {activeSection === 'live' ? (
              <motion.section key="live" className="content-panel" {...sectionMotion}>
                <div className="panel-header">
                  <div>
                    <h2>Live rooms</h2>
                    <p>Sessions currently in progress.</p>
                  </div>
                  <div className="panel-actions">
                    {!isAdmin ? (
                      <button
                        type="button"
                        className="workspace-button workspace-button--secondary"
                        onClick={() => openModal('join')}
                      >
                        <FaLink />
                        Join from link
                      </button>
                    ) : null}
                  </div>
                </div>

                {isLoadingMeetings ? (
                  <div className="empty-panel">
                    <strong>Loading live rooms...</strong>
                  </div>
                ) : liveMeetings.length ? (
                  <div className="meeting-grid">
                    {liveMeetings.map((meeting) => renderMeetingCard(meeting))}
                  </div>
                ) : (
                  <div className="empty-panel">
                    <strong>No live rooms right now</strong>
                    <p>
                      {isAdmin
                        ? 'Start a room and it will appear here.'
                        : 'Live sessions will appear here as soon as they begin.'}
                    </p>
                  </div>
                )}
              </motion.section>
            ) : null}

            {activeSection === 'upcoming' ? (
              <motion.section key="upcoming" className="content-panel" {...sectionMotion}>
                <div className="panel-header">
                  <div>
                    <h2>Upcoming sessions</h2>
                    <p>Scheduled rooms.</p>
                  </div>
                  <div className="panel-actions">
                    {isAdmin ? (
                      <button
                        type="button"
                        className="workspace-button workspace-button--primary"
                        onClick={() => openModal('schedule')}
                      >
                        <FaPlus />
                        Schedule meeting
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="workspace-button workspace-button--secondary"
                        onClick={() => openModal('join')}
                      >
                        <FaLink />
                        Join from link
                      </button>
                    )}
                  </div>
                </div>

                {isLoadingMeetings ? (
                  <div className="empty-panel">
                    <strong>Loading upcoming sessions...</strong>
                  </div>
                ) : scheduledMeetings.length ? (
                  <div className="meeting-grid">
                    {scheduledMeetings.map((meeting) => renderMeetingCard(meeting))}
                  </div>
                ) : (
                  <div className="empty-panel">
                    <strong>No upcoming sessions</strong>
                    <p>
                      {isAdmin
                        ? 'Create a meeting to add it here.'
                        : 'Your next meeting will appear here.'}
                    </p>
                  </div>
                )}
              </motion.section>
            ) : null}

            {activeSection === 'archive' ? (
              <motion.section key="archive" className="content-panel" {...sectionMotion}>
                <div className="panel-header">
                  <div>
                    <h2>Meeting archive</h2>
                    <p>Completed rooms.</p>
                  </div>
                </div>

                {isLoadingMeetings ? (
                  <div className="empty-panel">
                    <strong>Loading archive...</strong>
                  </div>
                ) : pastMeetings.length ? (
                  <div className="meeting-grid">
                    {pastMeetings.map((meeting) => renderMeetingCard(meeting, { archived: true }))}
                  </div>
                ) : (
                  <div className="empty-panel">
                    <strong>No archived sessions</strong>
                  </div>
                )}
              </motion.section>
            ) : null}

            {activeSection === 'recordings' ? (
              <motion.section key="recordings" className="content-panel" {...sectionMotion}>
                <RecordingsList />
              </motion.section>
            ) : null}
          </AnimatePresence>
        </section>
      </div>

      <AnimatePresence>
        {showModal ? (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="modal-card"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.24 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <h3>
                    {modalType === 'join'
                      ? 'Join a room'
                      : modalType === 'edit'
                        ? 'Edit meeting'
                        : 'Schedule a meeting'}
                  </h3>
                  <p>
                    {modalType === 'join'
                      ? 'Paste a meeting link or room id to jump into an existing session.'
                      : modalType === 'edit'
                        ? 'Update the title, timing, or duration without leaving the dashboard.'
                        : 'Set the title, time, description, and duration for the next session.'}
                  </p>
                </div>
                <button type="button" className="modal-close" onClick={closeModal}>
                  <FaTimes />
                </button>
              </div>

              {modalType === 'join' ? (
                <div className="modal-form">
                  <label className="auth-field" htmlFor="meeting-link">
                    <span className="auth-label">Meeting link or room id</span>
                    <span className="auth-input-wrap">
                      <FaLink className="auth-input-icon" />
                      <input
                        id="meeting-link"
                        type="text"
                        value={meetingLink}
                        onChange={(event) => setMeetingLink(event.target.value)}
                        className="auth-input"
                        placeholder="Paste the room url or meeting id"
                      />
                    </span>
                  </label>

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="workspace-button workspace-button--ghost"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="workspace-button workspace-button--primary"
                      onClick={handleJoinByLink}
                    >
                      Join room
                    </button>
                  </div>
                </div>
              ) : (
                <div className="modal-form">
                  <label className="auth-field" htmlFor="meeting-title">
                    <span className="auth-label">Meeting title</span>
                    <span className="auth-input-wrap">
                      <FaVideo className="auth-input-icon" />
                      <input
                        id="meeting-title"
                        type="text"
                        value={meetingTitle}
                        onChange={(event) => setMeetingTitle(event.target.value)}
                        className="auth-input"
                        placeholder="Board review, office hours, community briefing..."
                      />
                    </span>
                  </label>

                  <div className="modal-grid">
                    <label className="auth-field" htmlFor="meeting-date-time">
                      <span className="auth-label">Date and time</span>
                      <input
                        id="meeting-date-time"
                        type="datetime-local"
                        value={meetingDateTime}
                        onChange={(event) => setMeetingDateTime(event.target.value)}
                        className="auth-input"
                        style={{ paddingLeft: '18px' }}
                      />
                    </label>

                    <label className="auth-field" htmlFor="meeting-duration">
                      <span className="auth-label">Duration</span>
                      <select
                        id="meeting-duration"
                        value={meetingDuration}
                        onChange={(event) => setMeetingDuration(event.target.value)}
                        className="auth-select"
                        style={{ paddingLeft: '18px' }}
                      >
                        {durationOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="auth-field" htmlFor="meeting-description">
                    <span className="auth-label">Description</span>
                    <textarea
                      id="meeting-description"
                      value={meetingDescription}
                      onChange={(event) => setMeetingDescription(event.target.value)}
                      className="auth-textarea"
                      placeholder="Add the context participants should see before they join."
                    />
                  </label>

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="workspace-button workspace-button--ghost"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="workspace-button workspace-button--primary"
                      disabled={submitting}
                      onClick={handleMeetingSave}
                    >
                      {submitting ? 'Saving...' : modalType === 'edit' ? 'Save changes' : 'Schedule meeting'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {toast ? (
          <motion.div
            className={`toast toast--${toast.tone}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            {toast.message}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
