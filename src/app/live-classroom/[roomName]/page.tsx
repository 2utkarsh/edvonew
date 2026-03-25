'use client';

import { type ReactNode, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowUpRight, Calendar, Mic, MonitorPlay, RadioTower, Video } from 'lucide-react';

export default function LiveClassroomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomName = Array.isArray(params?.roomName) ? params.roomName[0] : params?.roomName || 'room-name';
  const [participantName, setParticipantName] = useState('');
  const [opening, setOpening] = useState(false);
  const [message, setMessage] = useState('');
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const details = useMemo(() => ({
    title: searchParams?.get('title') || 'Live Classroom',
    host: searchParams?.get('host') || 'Admin managed host',
    start: searchParams?.get('start') || '',
    meetingUrl: searchParams?.get('meetingUrl') || '',
    recordingUrl: searchParams?.get('recordingUrl') || '',
  }), [searchParams]);

  const enterClassroom = async () => {
    setOpening(true);
    setMessage('');

    try {
      if (details.meetingUrl) {
        const joinUrl = new URL(details.meetingUrl, window.location.origin);
        if (participantName.trim()) {
          joinUrl.searchParams.set('participantName', participantName.trim());
        }
        joinUrl.searchParams.set('roomName', roomName);
        joinUrl.searchParams.set('mic', micEnabled ? 'on' : 'off');
        joinUrl.searchParams.set('camera', cameraEnabled ? 'on' : 'off');
        window.open(joinUrl.toString(), '_blank', 'noopener,noreferrer');
        setMessage('Live classroom opened in a new tab.');
        return;
      }

      setMessage('No live meeting URL has been connected yet. Add one from admin to launch the classroom directly from this page.');
    } finally {
      setOpening(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_26%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#020617_100%)] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-sky-300">Live Classroom</div>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">{details.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">
              This launcher sits between EDVO and your IEDUP live-class tool. Admin saves the room name plus the live URL from that tool, then uses Start live to open the host flow while students join from the same room setup.
            </p>
          </div>
          <Link href="/dashboard/student" className="rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/10">
            Back to dashboard
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
            <div className="flex items-center gap-3 text-sky-200">
              <RadioTower className="h-6 w-6" />
              <div className="text-sm font-semibold uppercase tracking-[0.24em]">Room Entry</div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/80">Display name</label>
                <input
                  type="text"
                  value={participantName}
                  onChange={(event) => setParticipantName(event.target.value)}
                  placeholder="Enter your name before joining"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/40"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => setMicEnabled((current) => !current)}
                  className={`rounded-[1.5rem] border px-4 py-4 text-left transition ${micEnabled ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100' : 'border-white/10 bg-white/5 text-white/70'}`}
                >
                  <Mic className="h-5 w-5" />
                  <div className="mt-3 text-sm font-semibold">Microphone {micEnabled ? 'ready' : 'muted'}</div>
                </button>
                <button
                  onClick={() => setCameraEnabled((current) => !current)}
                  className={`rounded-[1.5rem] border px-4 py-4 text-left transition ${cameraEnabled ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100' : 'border-white/10 bg-white/5 text-white/70'}`}
                >
                  <Video className="h-5 w-5" />
                  <div className="mt-3 text-sm font-semibold">Camera {cameraEnabled ? 'ready' : 'off'}</div>
                </button>
              </div>

              <button
                onClick={enterClassroom}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-60"
                disabled={opening}
              >
                {opening ? 'Opening classroom...' : 'Enter classroom'}
              </button>

              {message ? <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">{message}</div> : null}
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
                {details.meetingUrl ? (
                  <a className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10" href={details.meetingUrl} target="_blank" rel="noreferrer">
                    Open configured meeting URL <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 px-4 py-4 text-sm text-white/55">
                    Admin has not added a meeting URL yet. Paste your IEDUP room URL here in the format https://your-live-domain/rooms/[roomName], then start recording from inside that live room when class begins.
                  </div>
                )}

                {details.recordingUrl ? (
                  <a className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10" href={details.recordingUrl} target="_blank" rel="noreferrer">
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
