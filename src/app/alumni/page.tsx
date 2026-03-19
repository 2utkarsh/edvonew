'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Head from 'next/head';
import { Building, Users, Award, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const AlumniPage = () => {
  const achievements = [
    {
      id: 1,
      type: 'placement',
      company_name: 'Google',
      position: 'Data Analyst',
      description: 'Successfully transitioned from non-IT background to Data Analyst role at Google',
      user: { name: 'Rahul Sharma', email: 'rahul@example.com' },
      bootcamp: { title: 'Data Analytics Bootcamp' },
      featured: true,
      achievement_date: '2024-12-15',
      testimonial: 'The bootcamp completely changed my career trajectory!',
    },
    {
      id: 2,
      type: 'promotion',
      company_name: 'Microsoft',
      position: 'Senior AI Engineer',
      description: 'Promoted to Senior AI Engineer after completing AI Engineering Bootcamp',
      user: { name: 'Priya Patel', email: 'priya@example.com' },
      bootcamp: { title: 'AI Engineering Bootcamp' },
      featured: true,
      achievement_date: '2024-11-20',
      testimonial: 'Best investment I ever made in my career!',
    },
    {
      id: 3,
      type: 'placement',
      company_name: 'Amazon',
      position: 'Machine Learning Engineer',
      description: 'Landed dream job at Amazon after 6 months of bootcamp training',
      user: { name: 'Amit Kumar', email: 'amit@example.com' },
      bootcamp: { title: 'Machine Learning Bootcamp' },
      featured: false,
      achievement_date: '2024-10-10',
      testimonial: 'From zero to hero in machine learning!',
    },
  ];

  const stats = {
    total_alumni: 76000,
    placements: 6000,
    companies: 353,
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      placement: 'New Job',
      promotion: 'Promotion',
      achievement: 'Achievement',
      other: 'Other',
    };
    return labels[type] || 'Other';
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      placement: 'bg-green-100 text-green-800',
      promotion: 'bg-blue-100 text-blue-800',
      achievement: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-8 p-6">
      <Head>
        <title>Alumni Achievements</title>
      </Head>

      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16 px-4 rounded-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Real People, Real Career Transformations
          </h1>
          <p className="text-xl mb-8">
            Join 76K+ learners who have transformed their careers
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">{stats.total_alumni.toLocaleString()}+</div>
              <div>Total Alumni</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{stats.placements.toLocaleString()}</div>
              <div>Placements</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{stats.companies}</div>
              <div>Companies</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Success Stories</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <Card key={achievement.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {achievement.featured && (
                <div className="bg-yellow-400 text-yellow-900 px-3 py-1 text-sm font-semibold text-center">
                  Featured Success Story
                </div>
              )}
              
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2">{achievement.user.name}</h3>
                {achievement.bootcamp && (
                  <p className="text-sm text-gray-600 mb-4">{achievement.bootcamp.title}</p>
                )}

                <div className="mb-4">
                  <Badge className={getTypeColor(achievement.type)}>
                    {getTypeLabel(achievement.type)}
                  </Badge>
                </div>

                {achievement.company_name && achievement.position && (
                  <div className="mb-4">
                    <div className="font-semibold">{achievement.position}</div>
                    <div className="text-gray-600 flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      {achievement.company_name}
                    </div>
                  </div>
                )}

                <p className="text-gray-600 mb-4">{achievement.description}</p>

                {achievement.testimonial && (
                  <blockquote className="border-l-4 border-blue-500 pl-4 mb-4 text-gray-700 italic text-sm">
                    &ldquo;{achievement.testimonial}&rdquo;
                  </blockquote>
                )}

                <Button className="w-full">View Profile</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <Building className="w-12 h-12 mx-auto mb-4 text-blue-600" />
          <h3 className="font-semibold mb-2">Top Companies</h3>
          <p className="text-gray-600 mb-4">See where our alumni are working</p>
          <Button variant="outline">Explore Companies</Button>
        </Card>

        <Card className="p-6 text-center">
          <Award className="w-12 h-12 mx-auto mb-4 text-green-600" />
          <h3 className="font-semibold mb-2">All Achievements</h3>
          <p className="text-gray-600 mb-4">Browse all success stories</p>
          <Button variant="outline">View Achievements</Button>
        </Card>

        <Card className="p-6 text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-purple-600" />
          <h3 className="font-semibold mb-2">Statistics</h3>
          <p className="text-gray-600 mb-4">Detailed analytics and insights</p>
          <Button variant="outline">View Stats</Button>
        </Card>
      </div>
    </div>
  );
};

export default AlumniPage;
