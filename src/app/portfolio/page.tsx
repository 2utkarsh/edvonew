'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Head from 'next/head';
import { ExternalLink, Github, User, Briefcase } from 'lucide-react';
import Link from 'next/link';

const PortfoliosPage = () => {
  const portfolios = [
    {
      id: 1,
      title: 'Data Analyst Portfolio',
      slug: 'john-doe-portfolio',
      bio: 'Passionate data analyst with expertise in Python, SQL, and Power BI',
      skills: ['Python', 'SQL', 'Power BI', 'Excel', 'Machine Learning'],
      experience_years: 2,
      user: { name: 'John Doe', email: 'john@example.com' },
      bootcamp: { title: 'Data Analytics Bootcamp' },
      projects: [
        { id: 1, title: 'Sales Dashboard', technologies: ['Power BI', 'SQL'] },
        { id: 2, title: 'Customer Segmentation', technologies: ['Python', 'Pandas'] },
      ],
      views_count: 145,
      featured: true,
      github_url: 'https://github.com/johndoe',
      website_url: 'https://johndoe.dev',
    },
    {
      id: 2,
      title: 'AI Engineer Portfolio',
      slug: 'jane-smith-portfolio',
      bio: 'AI engineer specializing in machine learning and deep learning',
      skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision'],
      experience_years: 3,
      user: { name: 'Jane Smith', email: 'jane@example.com' },
      bootcamp: { title: 'AI Engineering Bootcamp' },
      projects: [
        { id: 1, title: 'Image Classifier', technologies: ['TensorFlow', 'Keras'] },
        { id: 2, title: 'Sentiment Analysis', technologies: ['NLTK', 'Python'] },
      ],
      views_count: 230,
      featured: false,
      github_url: 'https://github.com/janesmith',
      website_url: 'https://janesmith.dev',
    },
  ];

  return (
    <div className="space-y-8 p-6">
      <Head>
        <title>Student Portfolios</title>
      </Head>

      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16 px-4 rounded-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Job-Ready Portfolios
          </h1>
          <p className="text-xl mb-8">
            See how our bootcamp learners showcase their skills and projects
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((portfolio) => (
          <Card key={portfolio.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {portfolio.featured && (
              <div className="bg-purple-400 text-purple-900 px-3 py-1 text-sm font-semibold text-center">
                Featured Portfolio
              </div>
            )}
            
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-2">{portfolio.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{portfolio.user.name}</p>
              {portfolio.bootcamp && (
                <p className="text-xs text-gray-500 mb-4">{portfolio.bootcamp.title}</p>
              )}

              <p className="text-gray-600 mb-4 line-clamp-3">{portfolio.bio}</p>

              <div className="flex flex-wrap gap-1 mb-4">
                {portfolio.skills.slice(0, 5).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{portfolio.views_count} views</span>
                </div>
                {portfolio.experience_years && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{portfolio.experience_years} years</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Link href={`/portfolio/${portfolio.slug}`}>
                  <Button className="flex-1">View Portfolio</Button>
                </Link>
                
                {portfolio.github_url && (
                  <a href={portfolio.github_url} target="_blank" rel="noopener noreferrer"
                     className="p-2 border rounded hover:bg-gray-50">
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {portfolio.website_url && (
                  <a href={portfolio.website_url} target="_blank" rel="noopener noreferrer"
                     className="p-2 border rounded hover:bg-gray-50">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PortfoliosPage;
