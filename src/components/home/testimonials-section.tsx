'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Quote, Linkedin, Play } from 'lucide-react';
import { getProfileArtwork } from '@/lib/marketing-images';
import { publicFetchJson } from '@/lib/backend-api';

type SharedReview = {
  id: string;
  comment?: string;
  reviewerName?: string;
  reviewerRole?: string;
  externalUrl?: string;
  category?: string;
};

const DEFAULT_ROWS = [
  { id: 'fallback-1', name: 'Rabin Anto', role: 'Data Scientist', badge: 'Landed A Job', quote: 'Before enrolling in the course, my computer skills were extremely basic...', linkedin: '#', video: false },
  { id: 'fallback-2', name: 'Omkar Prakash Gosavi', role: 'BI Analyst', badge: 'Career Growth', quote: 'I am amazed with the contents that are included in this bootcamp...', linkedin: '#', video: false },
  { id: 'fallback-3', name: 'Bhikadiya Pratik', role: 'BI Reporting Analyst - III', badge: 'Landed A Job', quote: 'The practical approach and real-world projects helped me transition smoothly into my new role. The mentorship was exceptional!', linkedin: '#', video: true },
];

const TestimonialsSection = () => {
  const [rows, setRows] = useState(DEFAULT_ROWS);

  useEffect(() => {
    let cancelled = false;

    async function loadSharedReviews() {
      try {
        const payload = await publicFetchJson<{ success: boolean; data: SharedReview[] }>('/api/course-reviews');
        const items = Array.isArray(payload?.data) ? payload.data : [];
        const mapped = items
          .filter((item) => String(item.comment || '').trim())
          .slice(0, 3)
          .map((item, index) => ({
            id: String(item.id || `review-${index}`),
            name: String(item.reviewerName || 'EDVO Learner'),
            role: String(item.reviewerRole || 'Learner'),
            badge: String(item.category || 'Student Review'),
            quote: String(item.comment || ''),
            linkedin: String(item.externalUrl || '#'),
            video: false,
          }));

        if (!cancelled && mapped.length) {
          setRows(mapped);
        }
      } catch (_error) {
        // Keep fallback testimonials when shared reviews are unavailable.
      }
    }

    loadSharedReviews();
    return () => {
      cancelled = true;
    };
  }, []);

  return <section className="px-4 py-20 bg-white dark:bg-slate-950 transition-colors duration-300"><div className="max-w-7xl mx-auto"><div className="text-center mb-16"><Badge variant="gradient" className="mb-4">Course Reviews</Badge><h2 className="text-4xl md:text-5xl font-black text-slate-950 dark:text-white mb-6">Learner Feedback. <span className="gradient-text">From EDVO And Beyond.</span></h2><p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Explore approved EDVO learner reviews alongside selected testimonials sourced from external platforms and managed in admin.</p></div><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{rows.map((testimonial) => <Card key={testimonial.id} className="p-8 hover:shadow-2xl transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem]">{testimonial.badge && <div className="mb-6"><Badge className="bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">{testimonial.badge}</Badge></div>}<div className="relative mb-8"><Quote className="absolute -left-4 -top-4 h-12 w-12 text-primary-100 dark:text-primary-900/20" /><p className="relative z-10 text-base leading-relaxed text-slate-700 dark:text-slate-300 italic">&quot;{testimonial.quote}&quot;</p></div><div className="mt-8 flex items-center gap-4 border-t border-slate-100 dark:border-slate-800/50 pt-6"><div className="relative"><img src={getProfileArtwork(testimonial.name)} alt={testimonial.name} className="w-14 h-14 rounded-full object-cover object-center shadow-lg" />{testimonial.video && <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-red-600 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center shadow-lg"><Play className="w-3.5 h-3.5 text-white fill-white" /></div>}</div><div className="flex-1"><h4 className="text-base font-bold text-slate-950 dark:text-white leading-none">{testimonial.name}</h4><p className="mt-1 text-sm text-slate-500 dark:text-slate-500 font-medium">{testimonial.role}</p></div>{testimonial.linkedin && testimonial.linkedin !== '#' && <a href={testimonial.linkedin} className="text-blue-600 transition-all hover:text-blue-700 hover:scale-110 dark:text-blue-400"><Linkedin className="w-6 h-6" /></a>}</div></Card>)}</div><div className="mt-10 text-center"><Link href="/testimonials"><Button variant="outline" className="gap-2">View All Reviews</Button></Link></div></div></section>;
};

export default TestimonialsSection;
