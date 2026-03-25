'use client';

import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  ArrowUpRight,
  Calendar,
  Copy,
  Mic,
  MonitorPlay,
  RadioTower,
  ShieldCheck,
  Video,
} from 'lucide-react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import { buildLiveClassroomPath, normalizeRoomName } from '@/lib/live-classroom';

type LiveConnectionDetails = {
  roomName: string;
  role: string;
  serverUrl: string;
  participantName: string;
  participantToken: string;
};

export default function LiveClassroomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomName = normalizeRoomName(
    Array.isArray(params?.roomName) ? params.roomName[0] : params?.roomName || 'edvo-live-room',
  );
  const entry = searchParams?.get('entry') === 'host' ? 'host' : 'student';

  const [participantName, setParticipantName] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState('');
  const autoConnectAttempted = useRef(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [connectionDetails, setConnectionDetails] = useState<LiveConnectionDetails | null>(null);

  const details = useMemo(
    () => ({
      title: searchParams?.get('title') || 'Live Classroom',
      host: searchParams?.get('host') || 'EDVO Mentor Team',
      start: searchParams?.get('start') || '',
      recordingUrl: searchParams?.get('recordingUrl') || '',
    }),
    [searchParams],
  );

  const backHref = entry === 'host' ? '/backend/admin/courses' : '/dashboard/student';
  const backLabel = entry === 'host' ? 'Back to course control' : 'Back to dashboard';

  const sharePaths = useMemo(
    () => ({
      student: buildLiveClassroomPath(
        roomName,
        {
          title: details.title,
          host: details.host,
          start: details.start,
          recordingUrl: details.recordingUrl,
        },
        'student',
      ),
      host: buildLiveClassroomPath(
        roomName,
        {
          title: details.title,
          host: details.host,
          start: details.start,
          recordingUrl: details.recordingUrl,
        },
        'host',
      ),
    }),
    [details.host, details.recordingUrl, details.start, details.title, roomName],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    autoConnectAttempted.current = false;

    try {
      if (entry === 'host') {
        const adminUser = JSON.parse(window.localStorage.getItem('adminUser') || '{}');
        setParticipantName((current) => current || adminUser?.name || 'EDVO Admin');
        return;
      }

      const authUser = JSON.parse(window.localStorage.getItem('auth_user') || '{}');
      setParticipantName((current) => current || authUser?.name || '');
    } catch {
      // Ignore storage parsing errors and keep the manual field editable.
    }
  }, [entry, roomName]);

  const connectToRoom = async () => {
    if (connecting) return;

    setConnecting(true);
    setMessage('');

    try {
      const response = await fetch('/api/live-classroom/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          roomName,
          participantName,
          entry,
          adminToken: typeof window !== 'undefined' ? window.localStorage.getItem('adminToken') || '' : '',
          studentToken: typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') || '' : '',
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.success || !payload?.data?.participantToken) {
        throw new Error(payload?.error?.message || payload?.message || 'Unable to start the live classroom');
      }

      setConnectionDetails(payload.data as LiveConnectionDetails);
      setMessage(
        entry === 'host'
          ? 'Host studio ready. Students can use the student launch link to join this room.'
          : 'Connected to the classroom.',
      );
    } catch (error: any) {
      setMessage(error?.message || 'Unable to start the live classroom');
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    if (entry !== 'host') return;
    if (!participantName.trim() || connectionDetails || connecting || autoConnectAttempted.current) return;
    if (typeof window === 'undefined') return;
    if (!window.localStorage.getItem('adminToken')) return;

    autoConnectAttempted.current = true;
    void connectToRoom();
  }, [connectionDetails, connecting, entry, participantName]);

  const copyLaunchLink = async (target: 'host' | 'student') => {
    if (typeof window === 'undefined') return;

    const absoluteUrl = new URL(
      target === 'host' ? sharePaths.host : sharePaths.student,
      window.location.origin,
    ).toString();

    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setMessage(`${target === 'host' ? 'Host' : 'Student'} launch link copied.`);
    } catch {
      window.prompt(`Copy the ${target} link`, absoluteUrl);
    }
  };

  if (connectionDetails) {
    return (
      <main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#020617_100%)] text-white">
        <div className="flex h-full flex-col">
          <header className="border-b border-white/10 bg-slate-950/92 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.32em] text-sky-300">Integrated Live Classroom</div>
                <h1 className="mt-2 text-2xl font-black">{details.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/55">
                  <span>Room {connectionDetails.roomName}</span>
                  <span>{connectionDetails.participantName}</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/70">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {connectionDetails.role}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {entry === 'host' ? (
                  <button
                    type="button"
                    onClick={() => copyLaunchLink('student')}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Copy student link <Copy className="h-4 w-4" />
                  </button>
                ) : null}
                {details.recordingUrl ? (
                  <a
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                    href={details.recordingUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Recording <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setConnectionDetails(null);
                    setMessage('You left the classroom.');
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Leave studio
                </button>
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 p-2 sm:p-3 lg:p-4">
            <div
              className="mx-auto h-full max-w-[1500px] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/85 shadow-[0_28px_120px_rgba(2,6,23,0.65)]"
              data-lk-theme="default"
            >
              <LiveKitRoom
                audio={micEnabled}
                connect={true}
                onDisconnected={() => {
                  setConnectionDetails(null);
                  setMessage('You were disconnected from the classroom.');
                }}
                serverUrl={connectionDetails.serverUrl}
                token={connectionDetails.participantToken}
                video={cameraEnabled}
                className="h-full"
              >
                <VideoConference />
              </LiveKitRoom>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const messageIsError = /unable|only|configured/i.test(message);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#020617_100%)] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-sky-300">Integrated Live Classroom</div>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">{details.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">
              This room now uses the integrated LiveKit flow from your IEDUP setup. Admin starts host mode from the course editor, students join from the generated classroom link, and the same room name powers both entry points.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyLaunchLink('student')}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/10"
            >
              Copy student link
            </button>
            <Link href={backHref} className="rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/10">
              {backLabel}
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
            <div className="flex items-center gap-3 text-sky-200">
              <RadioTower className="h-6 w-6" />
              <div className="text-sm font-semibold uppercase tracking-[0.24em]">
                {entry === 'host' ? 'Host Studio Entry' : 'Room Entry'}
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/80">Display name</label>
                <input
                  type="text"
                  value={participantName}
                  onChange={(event) => setParticipantName(event.target.value)}
                  placeholder={entry === 'host' ? 'Host display name' : 'Enter your name before joining'}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/40"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMicEnabled((current) => !current)}
                  className={`rounded-[1.5rem] border px-4 py-4 text-left transition ${micEnabled ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100' : 'border-white/10 bg-white/5 text-white/70'}`}
                >
                  <Mic className="h-5 w-5" />
                  <div className="mt-3 text-sm font-semibold">Microphone {micEnabled ? 'ready' : 'muted'}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setCameraEnabled((current) => !current)}
                  className={`rounded-[1.5rem] border px-4 py-4 text-left transition ${cameraEnabled ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100' : 'border-white/10 bg-white/5 text-white/70'}`}
                >
                  <Video className="h-5 w-5" />
                  <div className="mt-3 text-sm font-semibold">Camera {cameraEnabled ? 'ready' : 'off'}</div>
                </button>
              </div>

              <button
                type="button"
                onClick={connectToRoom}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-60"
                disabled={connecting}
              >
                {connecting ? 'Connecting...' : entry === 'host' ? 'Start live room' : 'Enter classroom'}
              </button>

              {message ? (
                <div className={`rounded-2xl border px-4 py-3 text-sm ${messageIsError ? 'border-red-400/25 bg-red-500/10 text-red-100' : 'border-emerald-400/25 bg-emerald-500/10 text-emerald-100'}`}>
                  {message}
                </div>
              ) : null}
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
              <div className="text-lg font-bold">Classroom details</div>
              <div className="mt-5 space-y-3 text-sm text-white/75">
                <InfoRow icon={<MonitorPlay className="h-4 w-4" />} label="Room" value={roomName} />
                <InfoRow icon={<Calendar className="h-4 w-4" />} label="Starts" value={details.start || 'Scheduled from admin'} />
                <InfoRow icon={<RadioTower className="h-4 w-4" />} label="Host" value={details.host} />
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
              <div className="text-lg font-bold">Launch options</div>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-4 text-sm text-white/60">
                  Student link is now generated automatically from the room name. Admin host mode is protected by the admin login session and no longer depends on a pasted manual meeting URL.
                </div>
                <button
                  type="button"
                  onClick={() => copyLaunchLink('student')}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Copy student launch <Copy className="h-4 w-4" />
                </button>
                {entry === 'host' ? (
                  <button
                    type="button"
                    onClick={() => copyLaunchLink('host')}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Copy host launch <Copy className="h-4 w-4" />
                  </button>
                ) : null}
                {details.recordingUrl ? (
                  <a
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                    href={details.recordingUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open recording <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-950/70 px-4 py-3">
      <span className="inline-flex items-center gap-2 text-white/45">{icon}{label}</span>
      <span className="text-right font-semibold text-white">{value}</span>
    </div>
  );
}
