'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Sun, Moon, LayoutDashboard, LogOut, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHeaderStore, NavLink } from '@/store/useHeaderStore';
import { useThemeStore } from '@/store/useThemeStore';

type AuthUser = { name?: string; email?: string } | null;

export default function Navbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => readStoredAuthToken());
  const [authUser, setAuthUser] = useState<AuthUser>(() => (readStoredAuthToken() ? readStoredAuthUser() : null));
  const pathname = usePathname();
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { config } = useHeaderStore();
  const { config: themeConfig, toggleMode } = useThemeStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  useEffect(() => {
    const syncAuth = () => {
      try {
        const token = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');
        if (!token) {
          setIsAuthenticated(false);
          setIsAuthenticated(false);
    setAuthUser(null);
          return;
        }

        setIsAuthenticated(true);
        if (!storedUser) {
          setAuthUser({ name: 'Student' });
          return;
        }

        try {
          setAuthUser(JSON.parse(storedUser));
        } catch {
          setAuthUser({ name: 'Student' });
        }
      } catch {
        setIsAuthenticated(false);
        setAuthUser(null);
      }
    };

    syncAuth();
    window.addEventListener('storage', syncAuth);
    window.addEventListener('auth-changed', syncAuth);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('auth-changed', syncAuth);
    };
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.dispatchEvent(new Event('auth-changed'));
    setAuthUser(null);
    setIsMobileMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  const handleMouseEnter = (label: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setOpenDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  const { announcement } = config;
  const showAnnouncement = announcement.enabled && !announcementDismissed;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Announcement Bar */}
        <AnimatePresence>
          {showAnnouncement && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
              style={{ backgroundColor: announcement.bgColor }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                    <span
                      className="font-bold text-xs px-2 py-0.5 rounded"
                      style={{
                        color: announcement.bgColor,
                        backgroundColor: announcement.textColor,
                      }}
                    >
                      {announcement.leftText}
                    </span>
                  </div>
                  <div
                    className="flex-1 text-center font-medium text-xs sm:text-sm truncate"
                    style={{ color: announcement.textColor }}
                  >
                    {announcement.centerText}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {announcement.ctaText && (
                      <Link
                        href={announcement.ctaLink}
                        className="font-bold text-xs px-3 py-1 rounded border-2 whitespace-nowrap hover:opacity-80 transition-opacity"
                        style={{
                          color: announcement.textColor,
                          borderColor: announcement.textColor,
                        }}
                      >
                        {announcement.ctaText}
                      </Link>
                    )}
                    <button
                      onClick={() => setAnnouncementDismissed(true)}
                      className="p-0.5 rounded hover:opacity-60 transition-opacity"
                      style={{ color: announcement.textColor }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Nav */}
        <div 
          className={cn(
            "w-full transition-all duration-500 ease-in-out", 
            isScrolled ? "bg-transparent py-3" : "py-0 bg-white/95 backdrop-blur-md border-b border-slate-200/50 dark:bg-[#070e28]/95 dark:border-white/10"
          )}
        >
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
            <div
              className={cn(
                "w-full flex items-center justify-between h-16 transition-all duration-500 ease-in-out",
                isScrolled
                  ? 'rounded-full border border-slate-200/50 bg-white/95 px-4 shadow-xl shadow-slate-900/5 backdrop-blur-md dark:border-white/10 dark:bg-[#0a112c]/95 dark:shadow-black/20 sm:px-6'
                  : 'rounded-none border-transparent bg-transparent shadow-none px-4 sm:px-0'
              )}
            >
              {/* Logo */}
              <Link href="/" className="flex items-center group flex-shrink-0 py-2">
                <Image
                  src="/images/edvo-official-logo-v10.png"
                  alt="EDVO"
                  width={160}
                  height={52}
                  priority
                  className="h-10 w-auto group-hover:scale-105 transition-transform"
                />
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-1">
                {config.navLinks.map((link) => (
                  <NavItem
                    key={link.label}
                    link={link}
                    isActive={pathname === link.href || (link.href !== '/' && (pathname?.startsWith(link.href + '/') ?? false))}
                    isOpen={openDropdown === link.label}
                    onMouseEnter={() => link.hasDropdown ? handleMouseEnter(link.label) : setOpenDropdown(null)}
                    onMouseLeave={handleMouseLeave}
                  />
                ))}
              </nav>

              {/* Right side: Dark mode toggle + Auth */}
              <div className="hidden lg:flex items-center gap-3">
                {/* Dark mode toggle */}
                {themeConfig.adminDarkModeEnabled && (
                  <button
                    onClick={toggleMode}
                    className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                    title={themeConfig.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {themeConfig.mode === 'dark' ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                  </button>
                )}
{(isAuthenticated || !!authUser) ? (
                  <>
                    <div className="flex items-center gap-2 rounded-full border border-border/70 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                      <UserCircle className="h-4 w-4" />
                      <span>{authUser?.name || authUser?.email || 'Student'}</span>
                    </div>
                    <Link
                      href="/dashboard/student"
                      className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-secondary-lighter hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-full bg-accent-500 px-5 py-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.05] hover:bg-accent-600 hover:shadow-lg hover:shadow-accent-500/25 active:scale-[0.98]"
                    >
                      <span className="inline-flex items-center gap-1.5"><LogOut className="h-4 w-4" />Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-secondary-lighter hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      {config.loginText}
                    </Link>
                    <Link
                      href="/auth/register"
                      className="rounded-full bg-accent-500 px-5 py-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.05] hover:bg-accent-600 hover:shadow-lg hover:shadow-accent-500/25 active:scale-[0.98]"
                    >
                      {config.registerText}
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile: dark toggle + hamburger */}
              <div className="lg:hidden flex items-center gap-2">
                {themeConfig.adminDarkModeEnabled && (
                  <button
                    onClick={toggleMode}
                    className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    {themeConfig.mode === 'dark' ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                  </button>
                )}
                <button
                  className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-border bg-white/95 dark:border-white/10 dark:bg-slate-950/95 lg:hidden"
            >
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
                {config.navLinks.map((link) => (
                  <MobileNavItem
                    key={link.label}
                    link={link}
                    isActive={pathname === link.href}
                  />
                ))}
                <div className="mt-4 flex gap-3 border-t border-border pt-4 dark:border-white/10">
                  <Link
                    href="/auth/login"
                    className="flex-1 rounded-lg border border-border py-2.5 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-secondary-lighter dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    {config.loginText}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex-1 text-center text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity bg-accent-500"
                  >
                    {config.registerText}
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer */}
      <div className={cn(
        "transition-all duration-300",
        showAnnouncement ? 'h-[104px] sm:h-[96px]' : 'h-[64px] sm:h-[64px]',
        pathname === '/' && "mb-10 sm:mb-14"
      )} />
    </>
  );
}

// Desktop Nav Item
function NavItem({
  link,
  isActive,
  isOpen,
  onMouseEnter,
  onMouseLeave,
}: {
  link: NavLink;
  isActive: boolean;
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {link.hasDropdown ? (
        <button
          type="button"
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-default ${
            isActive
              ? 'bg-accent-100 text-accent-700 dark:bg-accent-500/15 dark:text-accent-200'
              : 'text-slate-600 hover:bg-secondary-lighter hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
          }`}
        >
          {link.label}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        <Link
          href={link.href}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive
              ? 'bg-accent-100 text-accent-700 dark:bg-accent-500/15 dark:text-accent-200'
              : 'text-slate-600 hover:bg-secondary-lighter hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
          }`}
        >
          {link.label}
        </Link>
      )}

      <AnimatePresence>
        {link.hasDropdown && isOpen && link.children && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-56 overflow-hidden rounded-xl border border-border bg-white py-2 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-slate-900 dark:shadow-black/30"
          >
            {link.children.map((child) => (
              <Link
                key={child.label}
                href={child.href}
                className="block px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-secondary-lighter hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {child.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Mobile Nav Item
function MobileNavItem({ link, isActive }: { link: NavLink; isActive: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div className="flex items-center">
        {link.hasDropdown && link.children ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className={`flex-1 flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-accent-100 text-accent-700 dark:bg-accent-500/15 dark:text-accent-200'
                : 'text-slate-600 hover:bg-secondary-lighter hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
            }`}
          >
            {link.label}
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        ) : (
          <Link
            href={link.href}
            className={`flex-1 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-accent-100 text-accent-700 dark:bg-accent-500/15 dark:text-accent-200'
                : 'text-slate-600 hover:bg-secondary-lighter hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        )}
      </div>
      <AnimatePresence>
        {expanded && link.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden ml-4"
          >
            {link.children.map((child) => (
              <Link
                key={child.label}
                href={child.href}
                className="block px-3 py-2.5 text-sm text-slate-500 transition-colors hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
              >
                {child.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


