'use client';

import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Linkedin, Youtube, ArrowRight } from 'lucide-react';

const InstructorsSection = () => {
  const instructors = [
    {
      name: 'Dhaval Patel',
      title: 'Data Entrepreneur (12+ Years), Youtuber, Ex - Bloomberg, NVIDIA',
      bio: 'I have 17 years of experience in programming and data science working for big tech companies like NVIDIA and Bloomberg. I also run a famous youtube channel called EDVO where I pursue my passion for teaching.',
      image: '/images/instructors/dhaval.jpg',
      linkedin: '#',
      youtube: '#',
    },
    {
      name: 'Hemanand Vadivel',
      title: 'Ex- Data Analytics Manager, 8+ Years in Europe, Microsoft Certified, Certified Supply Chain Professional',
      bio: 'I\'m a Mechanical Engineer who transitioned to a full-time Data & Analytics Manager in the UK & Germany. I have delivered 30+ analytics projects over 15+ countries and trained professionals at different levels to equip them with valuable analytics skills.',
      image: '/images/instructors/hemanand.jpg',
      linkedin: '#',
      instagram: '#',
    },
  ];

  return (
    <section className="px-4 py-16 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4">
          <Badge variant="secondary" className="mb-4">Practitioners Who Teach</Badge>
        </div>
        <h2 className="mb-4 text-center text-3xl font-bold text-slate-950 dark:text-white md:text-4xl">
          Learn from AI & Data Experts <span className="text-primary-600 dark:text-primary-300">with Real Industry Experience</span>
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-slate-600 dark:text-slate-300">
          Industry experience meets the art of teaching, making complex concepts feel simple.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {instructors.map((instructor, index) => (
            <div key={index} className="flex gap-6">
              <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 text-3xl font-bold text-white shadow-lg shadow-primary-500/20">
                {instructor.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold text-slate-950 dark:text-white">{instructor.name}</h3>
                <p className="mb-3 text-sm font-medium text-primary-600 dark:text-primary-300">{instructor.title}</p>
                <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{instructor.bio}</p>
                <div className="flex gap-3">
                  {instructor.linkedin && (
                    <a href={instructor.linkedin} className="text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {instructor.youtube && (
                    <a href={instructor.youtube} className="text-red-600 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                      <Youtube className="w-5 h-5" />
                    </a>
                  )}
                  {instructor.instagram && (
                    <a href={instructor.instagram} className="text-pink-600 transition-colors hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300">
                      <span className="text-lg">IG</span>
                    </a>
                  )}
                </div>
                <Button variant="link" className="mt-2 gap-1 text-primary-600 dark:text-primary-300">
                  Read More <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstructorsSection;


