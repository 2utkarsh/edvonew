'use client';

import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Play } from 'lucide-react';

const CinematicSection = ({ content }: { content?: { badge?: string; title?: string; accent?: string; description?: string; buttonLabel?: string; previewTitle?: string; previewSubtitle?: string } }) => {
  return <section className="py-16 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"><div className="max-w-7xl mx-auto"><div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"><div><Badge className="mb-4 bg-slate-700 text-slate-200 border-slate-600">{content?.badge || '4K Cinematic'}</Badge><h2 className="text-4xl md:text-5xl font-bold mb-6">{content?.title || 'Learning that feels like Entertainment.'}</h2><p className="text-lg text-slate-300 mb-8">{content?.description || 'We ditched grainy Zoom recordings for cinematic production. High-fidelity visuals, storytelling-driven edits, and immersive examples. You will not just study data, you will binge-watch it.'}</p><Button variant="secondary" size="lg" className="gap-2"><Play className="w-4 h-4 fill-current" />{content?.buttonLabel || 'Watch a Sample Lecture'}</Button></div><div className="relative"><div className="aspect-video bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center relative overflow-hidden"><div className="absolute inset-0 flex items-center justify-center"><div className="text-center"><div className="text-6xl mb-4">Movie</div><div className="text-3xl font-bold tracking-wider">{content?.previewTitle || 'EDVO'}</div><div className="text-sm text-white/80 mt-2">{content?.previewSubtitle || 'Learn like you are watching a movie'}</div></div></div><div className="absolute inset-0 flex items-center justify-center"><div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer hover:scale-110 transition-transform"><Play className="w-10 h-10 text-white fill-white" /></div></div></div></div></div></div></section>;
};

export default CinematicSection;
