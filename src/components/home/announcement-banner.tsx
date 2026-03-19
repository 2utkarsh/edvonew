'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Megaphone, X } from 'lucide-react';

interface AnnouncementBannerProps {
  message?: string;
  linkText?: string;
  linkUrl?: string;
  bgColor?: string;
  textColor?: string;
  dismissible?: boolean;
}

const AnnouncementBanner = ({
  message = 'Transform your career in 2026: Live AI Engineering Bootcamp started on March 7. Recordings included. Last day to register: March 13.',
  linkText = 'Know More!',
  linkUrl = '/bootcamps/ai-engineering-bootcamp-software-engineers',
  dismissible = true,
}: AnnouncementBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative z-50 border-b border-accent-200 bg-gradient-to-r from-accent-200 via-accent-100 to-secondary-light px-4 py-2 text-sm font-medium text-slate-900 dark:border-accent-500/20 dark:from-accent-500/20 dark:via-slate-900 dark:to-primary-500/10 dark:text-accent-50">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
        <Megaphone className="h-4 w-4 flex-shrink-0" />
        <span className="hidden sm:inline">EDVO</span>
        <span className="text-center">{message}</span>
        <Link
          href={linkUrl}
          className="whitespace-nowrap font-semibold underline decoration-current/60 underline-offset-4 hover:no-underline"
        >
          {linkText}
        </Link>

        {dismissible && (
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            aria-label="Dismiss announcement"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AnnouncementBanner;
