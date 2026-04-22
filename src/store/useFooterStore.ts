import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FooterLinkItem {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLinkItem[];
}

export interface FooterSocialLink {
  href: string;
  label: string;
}

export interface FooterConfig {
  newsletterTitle: string;
  newsletterDescription: string;
  companyDescription: string;
  sections: {
    platform: FooterSection;
    company: FooterSection;
    support: FooterSection;
    community: FooterSection;
  };
  socialLinks: FooterSocialLink[];
}

interface FooterStore {
  config: FooterConfig;
  setConfig: (config: FooterConfig) => void;
  updateSection: (key: keyof FooterConfig['sections'], section: FooterSection) => void;
  updateNewsletter: (newsletterTitle: string, newsletterDescription: string) => void;
  updateCompanyDescription: (companyDescription: string) => void;
  updateSocialLinks: (socialLinks: FooterSocialLink[]) => void;
}

const defaultConfig: FooterConfig = {
  newsletterTitle: 'Stay Updated with EDVO',
  newsletterDescription: 'Subscribe to our newsletter for the latest courses, job openings, and learning resources.',
  companyDescription: 'EDVO is an online education and professional upskilling platform operated by G&A Itech Innovation Foundation. We provide live bootcamps, self-paced courses, workshops, digital resources, and career support services.',
  sections: {
    platform: {
      title: 'Platform',
      links: [
        { label: 'Browse Courses', href: '/courses' },
        { label: 'Job Board', href: '/jobs' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'For Business', href: '/business' },
        { label: 'For Students', href: '/students' },
      ],
    },
    company: {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Blog', href: '/blog' },
        { label: 'Press', href: '/press' },
        { label: 'Partners', href: '/partners' },
      ],
    },
    support: {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/help' },
        { label: 'Contact Us', href: '/contact' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms and Conditions', href: '/terms' },
        { label: 'Refund & Cancellation Policy', href: '/refund-cancellation-policy' },
        { label: 'FAQ', href: '/faq' },
      ],
    },
    community: {
      title: 'Community',
      links: [
        { label: 'Discord Server', href: '#' },
        { label: 'YouTube Channel', href: '#' },
        { label: 'Telegram Group', href: '#' },
        { label: 'LinkedIn', href: '#' },
        { label: 'Twitter', href: '#' },
      ],
    },
  },
  socialLinks: [
    { href: '#', label: 'Twitter' },
    { href: '#', label: 'GitHub' },
    { href: '#', label: 'LinkedIn' },
    { href: '#', label: 'YouTube' },
    { href: '#', label: 'Instagram' },
  ],
};

export const useFooterStore = create<FooterStore>()(
  persist(
    (set) => ({
      config: defaultConfig,
      setConfig: (config) => set({ config }),
      updateSection: (key, section) =>
        set((state) => ({
          config: {
            ...state.config,
            sections: {
              ...state.config.sections,
              [key]: section,
            },
          },
        })),
      updateNewsletter: (newsletterTitle, newsletterDescription) =>
        set((state) => ({
          config: {
            ...state.config,
            newsletterTitle,
            newsletterDescription,
          },
        })),
      updateCompanyDescription: (companyDescription) =>
        set((state) => ({
          config: {
            ...state.config,
            companyDescription,
          },
        })),
      updateSocialLinks: (socialLinks) =>
        set((state) => ({
          config: {
            ...state.config,
            socialLinks,
          },
        })),
    }),
    { name: 'footer-storage' }
  )
);
