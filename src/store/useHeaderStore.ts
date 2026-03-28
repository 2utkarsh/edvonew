import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NavLink {
  href: string;
  label: string;
  hasDropdown?: boolean;
  children?: { href: string; label: string }[];
}

export interface AnnouncementBar {
  enabled: boolean;
  leftText: string;
  centerText: string;
  ctaText: string;
  ctaLink: string;
  bgColor: string;
  textColor: string;
}

export interface HeaderConfig {
  logoText: string;
  navLinks: NavLink[];
  announcement: AnnouncementBar;
  loginText: string;
  registerText: string;
  registerBgColor: string;
}

interface HeaderStore {
  config: HeaderConfig;
  setConfig: (config: HeaderConfig) => void;
  updateAnnouncement: (announcement: Partial<AnnouncementBar>) => void;
  updateNavLinks: (navLinks: NavLink[]) => void;
  updateLogoText: (text: string) => void;
}

const NAV_LABEL_OVERRIDES: Record<string, string> = {
  '/resources/tutorials': 'Free Course',
  '/events/webinars': 'Master Class',
};

function normalizeNavLinks(navLinks: NavLink[]) {
  return (navLinks || []).map((link) => ({
    ...link,
    children: (link.children || []).map((child) => ({
      ...child,
      label: NAV_LABEL_OVERRIDES[child.href] || child.label,
    })),
  }));
}

function normalizeHeaderConfig(config: HeaderConfig): HeaderConfig {
  return {
    ...config,
    navLinks: normalizeNavLinks(config.navLinks),
  };
}

const defaultConfig: HeaderConfig = normalizeHeaderConfig({
  logoText: '',
  navLinks: [
    {
      href: '/courses',
      label: 'Courses',
      hasDropdown: true,
      children: [
        { href: '/courses?category=data-science', label: 'Data Science' },
        { href: '/courses?category=web-development', label: 'Web Development' },
        { href: '/courses?category=cloud', label: 'Cloud Computing' },
        { href: '/courses?category=mobile', label: 'Mobile Development' },
      ],
    },
    {
      href: '/resources',
      label: 'Resources',
      hasDropdown: true,
      children: [
        { href: '/resources/blog', label: 'Blog' },
        { href: '/resources/tutorials', label: 'Free Course' },
        { href: '/resources/guides', label: 'Career Guides' },
      ],
    },
    { href: '/challenges', label: 'Data Challenges' },
    {
      href: '/events',
      label: 'Events',
      hasDropdown: true,
      children: [
        { href: '/events/webinars', label: 'Master Class' },
        { href: '/events/workshops', label: 'Workshops' },
        { href: '/events/hackathons', label: 'Hackathons' },
      ],
    },
    {
      href: '/testimonials',
      label: 'Testimonials',
      hasDropdown: true,
      children: [
        { href: '/testimonials/reviews', label: 'Course Reviews' },
        { href: '/testimonials/success-stories', label: 'Job Success Stories' },
      ],
    },
    { href: '/our-team', label: 'Our Team' },
    { href: '/hire-talent', label: 'Hire Talent' },
  ],
  announcement: {
    enabled: true,
    leftText: 'Transform Your Career in 2026',
    centerText: 'Live AI Engineering Bootcamp started on 7th March. Recordings Included. Last day to register 13th March.',
    ctaText: 'Know More!',
    ctaLink: '/courses/data-science-with-generative-ai-bootcamp',
    bgColor: '#facc15',
    textColor: '#000000',
  },
  loginText: 'Login',
  registerText: 'Register',
  registerBgColor: '#22c55e',
});

export const useHeaderStore = create<HeaderStore>()(
  persist(
    (set) => ({
      config: defaultConfig,
      setConfig: (config) => set({ config: normalizeHeaderConfig(config) }),
      updateAnnouncement: (announcement) =>
        set((state) => ({
          config: {
            ...state.config,
            announcement: { ...state.config.announcement, ...announcement },
          },
        })),
      updateNavLinks: (navLinks) =>
        set((state) => ({
          config: { ...state.config, navLinks: normalizeNavLinks(navLinks) },
        })),
      updateLogoText: (text) =>
        set((state) => ({
          config: { ...state.config, logoText: text },
        })),
    }),
    {
      name: 'header-storage',
      merge: (persistedState, currentState) => {
        const persisted = (persistedState || {}) as Partial<HeaderStore>;
        return {
          ...currentState,
          ...persisted,
          config: normalizeHeaderConfig({
            ...currentState.config,
            ...(persisted.config || {}),
          }),
        } as HeaderStore;
      },
    }
  )
);
