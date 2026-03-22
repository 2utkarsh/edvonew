'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, Play, CalendarDays, Video, Wrench, Zap } from 'lucide-react';
import { FadeIn, StaggerGrid } from '@/components/animations';
import EventCard from '@/components/resources/EventCard';
import Button from '@/components/ui/Button';
import { EventCategoryOption, EventItem, EventType, fetchEventCategories, fetchEvents } from './data';

const CONFIG = {
  webinar: { badgeClass: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400', badgeLabel: 'Interactive Live Sessions', titleTop: 'World-Class', titleAccent: 'Expert Webinars.', description: 'Live sessions with industry veterans helping you bridge the gap between academic learning and industry expectations.', search: 'Search webinars by topic or speaker...', statA: '40+', statALabel: 'Speakers', statB: '12/mo', statBLabel: 'Sessions', icon: Video, footerTitle: 'Missed a Session? Access the Archive.', footerBody: 'All our past webinars are recorded and available in the resource hub.', footerPrimary: 'Browse Recorded Sessions', footerPrimaryHref: '/resources/tutorials', footerSecondary: 'Explore Courses', footerSecondaryHref: '/courses' },
  workshop: { badgeClass: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400', badgeLabel: 'Hands-On Learning', titleTop: 'Practical', titleAccent: 'Skill Workshops.', description: 'Deep-dive tech sessions where you do not just watch, you build. Come prepared with your IDE and a desire to ship.', search: 'Search workshops by skill or technology...', statA: '100%', statALabel: 'Hands-on', statB: '8/mo', statBLabel: 'Bootcamps', icon: Wrench, footerTitle: 'Get Certified After Each Session.', footerBody: 'Complete the assigned project to earn an EDVO skill certificate and build real proof of work.', footerPrimary: 'Start Learning', footerPrimaryHref: '/courses', footerSecondary: 'Browse Guides', footerSecondaryHref: '/resources/guides' },
  hackathon: { badgeClass: 'bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20 text-purple-600 dark:text-purple-400', badgeLabel: 'Rapid Innovation', titleTop: 'Build, Break,', titleAccent: 'Innovate.', description: 'Collaborate with sharp builders to solve ambitious problems. These hackathons are launchpads for products, portfolios, and startup ideas.', search: 'Search hackathons by theme or prize pool...', statA: 'Rs1Cr+', statALabel: 'Total Prizes', statB: '15k+', statBLabel: 'Innovators', icon: Zap, footerTitle: 'Why Compete Now?', footerBody: 'Because nothing accelerates execution, collaboration, and visibility like a real build deadline with real stakes.', footerPrimary: 'Explore Courses', footerPrimaryHref: '/courses', footerSecondary: 'Browse Success Stories', footerSecondaryHref: '/testimonials/success-stories' },
} as const;

export function DynamicEventsPage({ type }: { type: EventType }) {
  const [items, setItems] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<EventCategoryOption[]>([{ id: 'all', label: 'All Categories' }]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const config = CONFIG[type];
  const HeaderIcon = config.icon;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setIsLoading(true);
        setLoadError('');
        const [eventItems, eventCategories] = await Promise.all([fetchEvents(type), fetchEventCategories(type)]);
        if (!cancelled) { setItems(eventItems); setCategories(eventCategories); }
      } catch (error: any) {
        if (!cancelled) setLoadError(error?.message || 'Unable to load events right now.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [type]);

  const filteredItems = useMemo(() => items.filter((item) => {
    const query = searchTerm.toLowerCase();
    const matchSearch = item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query) || item.location.toLowerCase().includes(query) || (item.speakers || []).some((speaker) => speaker.name.toLowerCase().includes(query));
    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchSearch && matchCategory;
  }), [items, searchTerm, selectedCategory]);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <section className="mb-20"><FadeIn><div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10"><div className="max-w-3xl"><div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] mb-6 ${config.badgeClass}`}><HeaderIcon className="w-3.5 h-3.5" />{config.badgeLabel}</div><h1 className="text-5xl md:text-7xl font-black text-slate-950 dark:text-white leading-[1.1] tracking-tight mb-8">{config.titleTop}<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">{config.titleAccent}</span></h1><p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl">{config.description}</p></div><div className="flex items-center gap-8 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] self-start lg:self-auto"><div className="flex flex-col"><span className="text-3xl font-black text-slate-900 dark:text-white">{config.statA}</span><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{config.statALabel}</span></div><div className="w-px h-10 bg-slate-200 dark:bg-slate-800" /><div className="flex flex-col"><span className="text-3xl font-black text-slate-900 dark:text-white">{config.statB}</span><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{config.statBLabel}</span></div></div></div></FadeIn></section>
        <div className="flex flex-col md:flex-row gap-4 mb-16"><div className="relative flex-1 group"><Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder={config.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-bold text-sm text-slate-900 dark:text-white" /></div><div className="relative md:w-[260px]"><select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 pr-12 font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20">{categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}</select><ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" /></div></div>
        {loadError ? <div className="mb-8 rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-sm font-medium text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">{loadError}</div> : null}
        {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-[520px] animate-pulse rounded-[2.5rem] border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900" />)}</div> : filteredItems.length > 0 ? <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">{filteredItems.map((item) => <EventCard key={item.id} {...item} />)}</StaggerGrid> : <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-slate-800"><h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No matching events found</h3><p className="text-gray-500 dark:text-slate-500">Try adjusting your search or category filter.</p><Button variant="outline" className="mt-8 !rounded-2xl" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>Reset filters</Button></div>}
        <FadeIn delay={0.4}><div className="mt-24 rounded-[3.5rem] p-12 lg:p-16 bg-slate-950 text-white relative overflow-hidden"><div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#3b82f6_0,transparent_50%)]" /><div className="relative z-10 max-w-3xl"><h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">{config.footerTitle}</h2><p className="text-slate-400 text-lg mb-10">{config.footerBody}</p><div className="flex flex-wrap gap-4"><Link href={config.footerPrimaryHref} className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-950 rounded-[1.5rem] font-bold text-sm hover:scale-105 transition-all">{config.footerPrimary === 'Browse Recorded Sessions' ? <Play className="w-4 h-4 fill-current" /> : <CalendarDays className="w-4 h-4" />}{config.footerPrimary}</Link><Link href={config.footerSecondaryHref} className="inline-flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-bold text-sm border border-white/15 text-white hover:bg-white/10 transition-all">{config.footerSecondary}</Link></div></div></div></FadeIn>
      </div>
    </main>
  );
}
