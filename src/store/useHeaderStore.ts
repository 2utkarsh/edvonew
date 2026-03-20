import { create } from 'zustand';

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

const defaultConfig: HeaderConfig = {
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
        { href: '/resources/tutorials', label: 'Tutorials' },
        { href: '/resources/guides', label: 'Career Guides' },
      ],
    },
    { href: '/challenges', label: 'Data Challenges' },
    {
      href: '/events',
      label: 'Events',
      hasDropdown: true,
      children: [
        { href: '/events/webinars', label: 'Webinars' },
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
    ctaLink: '/courses/ds-gen-ai',
    bgColor: '#facc15',
    textColor: '#000000',
  },
  loginText: 'Login',
  registerText: 'Register',
  registerBgColor: '#22c55e',
};

export const useHeaderStore = create<HeaderStore>((set) => ({
  config: defaultConfig,
  setConfig: (config) => set({ config }),
  updateAnnouncement: (announcement) =>
    set((state) => ({
      config: {
        ...state.config,
        announcement: { ...state.config.announcement, ...announcement },
      },
    })),
  updateNavLinks: (navLinks) =>
    set((state) => ({
      config: { ...state.config, navLinks },
    })),
  updateLogoText: (text) =>
    set((state) => ({
      config: { ...state.config, logoText: text },
    })),
}));

