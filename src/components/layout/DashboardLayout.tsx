'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, BookOpen, Calendar, FileText, Briefcase, 
  Award, TrendingUp, Settings, HelpCircle, ChevronLeft, ChevronRight,
  Bell, Search, User, LogOut, Menu, X, Sun, Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/useThemeStore';

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: 'student' | 'instructor' | 'admin' | 'counselor' | 'recruiter';
  userName?: string;
  userAvatar?: string;
}

const roleConfig = {
  student: {
    title: 'Student Portal',
    color: 'emerald',
    navItems: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/student' },
      { icon: Calendar, label: 'Classes', href: '/dashboard/student/classes' },
      { icon: FileText, label: 'Tests', href: '/dashboard/student/tests' },
      { icon: BookOpen, label: 'Projects', href: '/dashboard/student/projects' },
      { icon: TrendingUp, label: 'Progress', href: '/dashboard/student/progress' },
      { icon: Award, label: 'Portfolio', href: '/dashboard/student/portfolio' },
      { icon: Briefcase, label: 'Placements', href: '/dashboard/student/placements' },
    ],
  },
  instructor: {
    title: 'Instructor Panel',
    color: 'cyan',
    navItems: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/instructor' },
      { icon: BookOpen, label: 'My Programs', href: '/dashboard/instructor/programs' },
      { icon: FileText, label: 'Course Builder', href: '/dashboard/instructor/builder' },
      { icon: Calendar, label: 'Live Classes', href: '/dashboard/instructor/classes' },
      { icon: FileText, label: 'Attendance', href: '/dashboard/instructor/attendance' },
      { icon: Award, label: 'Grading', href: '/dashboard/instructor/grading' },
    ],
  },
  admin: {
    title: 'Admin Console',
    color: 'indigo',
    navItems: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/admin/new' },
      { icon: TrendingUp, label: 'Analytics', href: '/dashboard/admin/analytics' },
      { icon: BookOpen, label: 'Courses', href: '/dashboard/admin/courses' },
      { icon: Menu, label: 'Header', href: '/dashboard/admin/header' },
      { icon: Settings, label: 'Site Settings', href: '/dashboard/admin/settings' },
      { icon: User, label: 'Users', href: '/dashboard/admin/users' },
      { icon: Briefcase, label: 'Operations', href: '/dashboard/admin/operations' },
    ],
  },
  counselor: {
    title: 'Counselor CRM',
    color: 'amber',
    navItems: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/counselor' },
      { icon: User, label: 'Leads', href: '/dashboard/counselor/leads' },
      { icon: Calendar, label: 'Follow-ups', href: '/dashboard/counselor/followups' },
      { icon: TrendingUp, label: 'Conversions', href: '/dashboard/counselor/conversions' },
      { icon: FileText, label: 'Reports', href: '/dashboard/counselor/reports' },
    ],
  },
  recruiter: {
    title: 'Recruiter Portal',
    color: 'red',
    navItems: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/recruiter' },
      { icon: User, label: 'Candidates', href: '/dashboard/recruiter/candidates' },
      { icon: Calendar, label: 'Interviews', href: '/dashboard/recruiter/interviews' },
      { icon: Award, label: 'Shortlisted', href: '/dashboard/recruiter/shortlisted' },
      { icon: FileText, label: 'Job Posts', href: '/dashboard/recruiter/jobs' },
    ],
  },
};

export default function DashboardLayout({ 
  children, 
  userRole, 
  userName = 'User',
  userAvatar 
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { config: themeConfig, toggleMode } = useThemeStore();
  
  const config = roleConfig[userRole];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Sidebar - Desktop */}
      <motion.aside
        className={cn(
          'fixed left-0 top-0 h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 z-40 hidden lg:block',
          'transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 256 }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-slate-800">
          {!sidebarCollapsed && (
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={themeConfig.logoUrl}
                alt={themeConfig.logoText}
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-bold text-lg text-gray-900 dark:text-white">EDVO</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {config.navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  'hover:bg-gray-100 dark:hover:bg-slate-800',
                  isActive 
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium' 
                    : 'text-gray-600 dark:text-gray-400'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        {!sidebarCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer">
              <HelpCircle className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Help & Support</span>
            </div>
          </div>
        )}
      </motion.aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 z-40 flex items-center justify-between px-4">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <Menu className="w-5 h-5 dark:text-gray-400" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={themeConfig.logoUrl}
            alt={themeConfig.logoText}
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="font-bold text-lg dark:text-white">EDVO</span>
        </Link>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg relative">
          <Bell className="w-5 h-5 dark:text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full" />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 z-50 lg:hidden"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-slate-800">
                <span className="font-bold dark:text-white">{config.title}</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5 dark:text-gray-400" />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {config.navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={cn(
        'transition-all duration-300',
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      )}>
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{config.title}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg w-64">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm w-full dark:text-gray-300 dark:placeholder:text-gray-500"
              />
            </div>

            {/* Dark mode toggle */}
            {themeConfig.adminDarkModeEnabled && (
              <button
                onClick={toggleMode}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title={themeConfig.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {themeConfig.mode === 'dark' ? (
                  <Sun className="w-5 h-5 text-gray-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
            )}

            {/* Notifications */}
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg relative">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full" />
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-slate-700">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{userName}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole}</div>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-medium">
                {(userName || 'U').charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
