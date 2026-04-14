'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowRight } from 'react-icons/fa';
import styles from '../styles/Home.module.css';
import { withBasePath } from '@/lib/url';

export default function Page() {
  const [lastRoomRoute, setLastRoomRoute] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const lastRoute = sessionStorage.getItem('lastRoute');
    if (lastRoute && /^\/rooms\/.+/.test(lastRoute)) {
      setLastRoomRoute(lastRoute);
    }
  }, []);

  return (
    <main className={styles.landing}>
      <section className={styles.shell}>
        <div className={styles.heroPanel}>
          <div className={styles.brandRow}>
            <span className={styles.brandPill}>Itech Innovation Foundation</span>
            {lastRoomRoute ? (
              <button
                type="button"
                className={styles.returnPill}
                onClick={() => router.push(lastRoomRoute)}
              >
                <FaArrowRight />
                Resume room
              </button>
            ) : null}
          </div>

          <div className={styles.heroBlock}>
            <p className={styles.eyebrow}>Meeting Platform</p>
            <h1 className={styles.title}>Learning Rooms</h1>
            <p className={styles.description}>
              Host sessions, manage schedules, and join rooms from one platform.
            </p>
          </div>

          <div className={styles.actions}>
            <Link href="/dashboard" className={styles.primaryAction}>
              Host sign in
            </Link>
            {lastRoomRoute ? (
              <button
                type="button"
                className={styles.tertiaryAction}
                onClick={() => router.push(lastRoomRoute)}
              >
                Open recent room
              </button>
            ) : null}
          </div>

          <div className={styles.inlineMeta}>
            <span>Host dashboard</span>
            <span>Participant access</span>
            <span>Recordings</span>
          </div>
        </div>

        <aside className={styles.visualPanel}>
          <div className={styles.imageFrame}>
            <Image
              src={withBasePath('/images/itech-innovation-foundation.jpeg')}
              alt="Itech Innovation Foundation"
              width={900}
              height={900}
              priority
              className={styles.image}
            />
          </div>

          <div className={styles.sidePanel}>
            <div className={styles.sideRow}>
              <span className={styles.sideLabel}>Host</span>
              <strong className={styles.sideValue}>Secure dashboard access</strong>
            </div>
            <div className={styles.sideRow}>
              <span className={styles.sideLabel}>Participant</span>
              <strong className={styles.sideValue}>Direct dashboard and room access</strong>
            </div>
            <div className={styles.sideRow}>
              <span className={styles.sideLabel}>Rooms</span>
              <strong className={styles.sideValue}>Live sessions, schedule, and archive</strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
