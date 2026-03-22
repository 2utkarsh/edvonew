'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { ArrowRight } from 'lucide-react';
import { getProfileArtwork } from '@/lib/marketing-images';

const CareerTransformationsSection = ({
  transformations = [
    { name: 'Kishan Singh', beforeRole: 'Database Administrator', afterRole: 'Data Analyst', company: 'From IT' },
    { name: 'Rohan Singh', beforeRole: 'Software Engineer', afterRole: 'AI Software Developer', company: 'From IT' },
    { name: 'Suchorita Das', beforeRole: 'Fresher', afterRole: 'Customer Success and MIS Reporting Executive', company: 'From Non-IT' },
  ],
}: {
  transformations?: Array<{ name: string; beforeRole: string; afterRole: string; company: string }>;
}) => {
  return (
    <section className="px-4 py-16 bg-gradient-to-b from-white to-secondary-lighter dark:from-slate-900 dark:to-slate-950"><div className="max-w-7xl mx-auto"><div className="mb-8 flex items-center justify-center gap-2"><span className="font-medium text-emerald-600 dark:text-emerald-300">353+ Recent Placements</span></div><h2 className="mb-12 text-center text-3xl font-bold text-slate-950 dark:text-white md:text-4xl">Real People, Real Career Transformations</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{transformations.map((person, index) => <Card key={index} className="p-6 transition-shadow hover:shadow-lg"><div className="flex items-center gap-4 mb-4"><img src={getProfileArtwork(person.name)} alt={person.name} className="h-16 w-16 rounded-full object-cover object-center shadow-lg" /><div><h3 className="font-bold text-lg">{person.name}</h3></div></div><div className="space-y-3"><div><p className="text-sm text-slate-500 dark:text-slate-400">Before</p><p className="font-medium text-slate-700 dark:text-slate-200">{person.beforeRole}</p></div><div className="flex items-center gap-2"><ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500" /><span className="text-sm text-slate-500 dark:text-slate-400">Now</span></div><div><p className="font-medium text-slate-950 dark:text-white">{person.afterRole}</p></div></div><div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800"><Badge variant="outline" className="border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-200">{person.company}</Badge></div></Card>)}</div></div></section>
  );
};

export default CareerTransformationsSection;
