'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, X, Check, CheckCheck, MessageSquare, Award, Calendar,
  Briefcase, AlertTriangle, Info, BookOpen, Clock, Settings,
  Filter, ChevronRight
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'student' | 'instructor' | 'admin' | 'counselor' | 'recruiter';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Project Approved',
    message: 'Your E-commerce API project has been approved by the instructor.',
    time: '5 min ago',
    read: false,
    action: { label: 'View Project', href: '/projects/1' },
  },
  {
    id: '2',
    type: 'info',
    title: 'New Class Scheduled',
    message: 'React Advanced Patterns class tomorrow at 10:00 AM.',
    time: '1 hour ago',
    read: false,
    action: { label: 'View Schedule', href: '/schedule' },
  },
  {
    id: '3',
    type: 'warning',
    title: 'Assignment Deadline',
    message: 'Database Design assignment due in 24 hours.',
    time: '2 hours ago',
    read: false,
    action: { label: 'Start Now', href: '/assignments/1' },
  },
  {
    id: '4',
    type: 'success',
    title: 'Certificate Earned',
    message: 'Congratulations! You earned the Full Stack Developer certificate.',
    time: '1 day ago',
    read: true,
    action: { label: 'View Certificate', href: '/certificates/1' },
  },
  {
    id: '5',
    type: 'info',
    title: 'New Message',
    message: 'Dr. Sarah Johnson sent you a message about your project.',
    time: '1 day ago',
    read: true,
    action: { label: 'Reply', href: '/messages' },
  },
];

const typeStyles = {
  info: {
    bg: 'bg-blue-50',
    icon: Info,
    iconColor: 'text-blue-600',
  },
  success: {
    bg: 'bg-green-50',
    icon: Check,
    iconColor: 'text-green-600',
  },
  warning: {
    bg: 'bg-yellow-50',
    icon: AlertTriangle,
    iconColor: 'text-yellow-600',
  },
  error: {
    bg: 'bg-red-50',
    icon: AlertTriangle,
    iconColor: 'text-red-600',
  },
};

export default function NotificationCenter({ isOpen, onClose, userRole }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full text-xs font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 p-4 border-b border-gray-100">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Unread
              </button>
              <div className="flex-1" />
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-gray-100">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No notifications</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => {
                    const style = typeStyles[notification.type];
                    return (
                      <motion.div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-indigo-50/30' : ''
                        }`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex gap-3">
                          <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0`}>
                            <style.icon className={`w-5 h-5 ${style.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-medium text-gray-900 text-sm">
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">{notification.time}</span>
                              {notification.action && (
                                <a
                                  href={notification.action.href}
                                  className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1"
                                >
                                  {notification.action.label}
                                  <ChevronRight className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                  <Settings className="w-4 h-4" />
                  Notification Settings
                </button>
                <button className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-700">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Notification Preferences Component
export function NotificationPreferences() {
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    sms: false,
    whatsapp: true,
    classes: true,
    assignments: true,
    projects: true,
    placements: true,
    marketing: false,
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-900 mb-6">Notification Preferences</h3>
      
      <div className="space-y-6">
        {/* Channels */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Channels</h4>
          <div className="space-y-3">
            {[
              { key: 'email', label: 'Email Notifications', icon: MessageSquare },
              { key: 'push', label: 'Push Notifications', icon: Bell },
              { key: 'sms', label: 'SMS Alerts', icon: MessageSquare },
              { key: 'whatsapp', label: 'WhatsApp Updates', icon: MessageSquare },
            ].map((channel) => (
              <label key={channel.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <channel.icon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700">{channel.label}</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences[channel.key as keyof typeof preferences]}
                  onChange={(e) => setPreferences({ ...preferences, [channel.key]: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Categories</h4>
          <div className="space-y-3">
            {[
              { key: 'classes', label: 'Classes & Schedule', icon: Calendar },
              { key: 'assignments', label: 'Assignments & Tests', icon: BookOpen },
              { key: 'projects', label: 'Projects & Reviews', icon: Award },
              { key: 'placements', label: 'Placement Updates', icon: Briefcase },
              { key: 'marketing', label: 'Marketing & Promotions', icon: Info },
            ].map((category) => (
              <label key={category.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <category.icon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700">{category.label}</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences[category.key as keyof typeof preferences]}
                  onChange={(e) => setPreferences({ ...preferences, [category.key]: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      <button className="w-full mt-6 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors">
        Save Preferences
      </button>
    </div>
  );
}
