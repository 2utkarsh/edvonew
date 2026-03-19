import { X, Megaphone } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface AnnouncementBannerProps {
  message?: string;
  linkText?: string;
  linkUrl?: string;
  bgColor?: string;
  textColor?: string;
  dismissible?: boolean;
}

const AnnouncementBanner = ({
  message = "Transform Your Career in 2026: Live AI Engineering Bootcamp started on 7th March. Recordings Included. Last day to register: 13th March",
  linkText = "Know More!",
  linkUrl = "/bootcamps/ai-engineering-bootcamp-software-engineers",
  bgColor = "bg-yellow-300",
  textColor = "text-black",
  dismissible = true,
}: AnnouncementBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className={`${bgColor} ${textColor} px-4 py-2 text-sm font-medium relative`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <Megaphone className="w-4 h-4 flex-shrink-0" />
        <span className="hidden sm:inline">🎓</span>
        <span className="text-center">
          {message}
        </span>
        <Link
          href={linkUrl}
          className="underline font-semibold hover:no-underline whitespace-nowrap"
        >
          {linkText}
        </Link>
        
        {dismissible && (
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AnnouncementBanner;
