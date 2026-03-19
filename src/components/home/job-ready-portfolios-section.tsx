'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const JobReadyPortfoliosSection = () => {
  const portfolios = [
    {
      id: 1,
      name: 'NISHU KUMAR',
      role: 'AI Engineer',
      skills: [
        { icon: '🐍', count: 2 },
        { icon: '🤖', count: 1 },
        { icon: '🧠', count: 3 },
      ],
      image: '/images/portfolios/nishu.jpg',
    },
    {
      id: 2,
      name: 'Sreerag CR',
      role: 'Data Engineer',
      skills: [
        { icon: '📊', count: 1 },
        { icon: '⚡', count: 2 },
        { icon: '☁️', count: 1 },
        { icon: '🔍', count: 1 },
      ],
      image: '/images/portfolios/sreerag.jpg',
    },
    {
      id: 3,
      name: 'Rajyvardhan Singh Parmar',
      role: 'Data Analyst',
      skills: [
        { icon: '📈', count: 1 },
        { icon: '📊', count: 7 },
        { icon: '🎯', count: 2 },
        { icon: '🗂️', count: 1 },
      ],
      image: '/images/portfolios/rajyvardhan.jpg',
    },
  ];

  return (
    <section className="px-4 py-16 bg-gradient-to-b from-white to-secondary-lighter dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="mb-3 text-3xl font-bold text-slate-950 dark:text-white">Job-Ready Portfolios</h2>
          <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-300">
            See how our bootcamp learners use the Portfolio Website feature to showcase their skills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {portfolios.map((portfolio) => (
            <Card key={portfolio.id} className="p-6 transition-shadow hover:shadow-lg">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-violet-500 text-xl font-bold text-white shadow-lg shadow-primary-500/20">
                  {portfolio.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white">{portfolio.name}</h3>
                  <p className="font-medium text-primary-600 dark:text-primary-300">{portfolio.role}</p>
                </div>
              </div>

              <div className="flex gap-3 mb-4">
                {portfolio.skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
                    <span className="text-lg">{skill.icon}</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{skill.count}</span>
                  </div>
                ))}
              </div>

              <Link href={`/portfolio/${portfolio.id}`}>
                <Button variant="link" className="gap-1 p-0 h-auto text-primary-600 dark:text-primary-300">
                  See Portfolio <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between mt-8">
          <Link href="/portfolio">
            <Button variant="outline" className="gap-2">
              Explore All Portfolios <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">←</Button>
            <Button variant="outline" size="icon">→</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JobReadyPortfoliosSection;

