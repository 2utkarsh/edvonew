import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/layouts/dashboard/layout';
import { Head, Link } from '@inertiajs/react';
import { Building, Users, Award, TrendingUp, ExternalLink } from 'lucide-react';
import { SharedData } from '@/types/global';

interface AlumniAchievement {
  id: number;
  type: string;
  company_name?: string;
  position?: string;
  description: string;
  achievement_date: string;
  image?: string;
  linkedin_url?: string;
  testimonial?: string;
  featured: boolean;
  status: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  bootcamp?: {
    id: number;
    title: string;
  };
}

interface AlumniProps extends SharedData {
  achievements: {
    data: AlumniAchievement[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  stats: {
    total_alumni: number;
    placements: number;
    companies: number;
  };
}

const AlumniIndex = ({ achievements, stats, translate }: AlumniProps) => {
  const { frontend } = translate;

  const getTypeLabel = (type: string) => {
    const labels = {
      placement: 'New Job',
      promotion: 'Promotion',
      achievement: 'Achievement',
      other: 'Other',
    };
    return labels[type as keyof typeof labels] || 'Other';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      placement: 'bg-green-100 text-green-800',
      promotion: 'bg-blue-100 text-blue-800',
      achievement: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-8">
      <Head title="Alumni Achievements" />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16 px-4 rounded-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Real People, Real Career Transformations
          </h1>
          <p className="text-xl mb-8">
            Join 76K+ learners who've transformed their careers
          </p>
          
          {/* Stats */}
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
              <div className="text-3xl font-bold">{stats.companies.toLocaleString()}</div>
              <div>Companies</div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Success Stories</h2>
          <Link href={route('alumni.achievements')}>
            <Button variant="outline">
              View All Achievements
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.data.map((achievement) => (
            <Card key={achievement.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {achievement.featured && (
                <div className="bg-yellow-400 text-yellow-900 px-3 py-1 text-sm font-semibold text-center">
                  Featured Success Story
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={achievement.user.avatar || '/images/default-avatar.jpg'}
                    alt={achievement.user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{achievement.user.name}</h3>
                    <p className="text-sm text-gray-600">
                      {achievement.bootcamp?.title || 'Alumni'}
                    </p>
                  </div>
                </div>

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

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {achievement.description}
                </p>

                {achievement.testimonial && (
                  <blockquote className="border-l-4 border-blue-500 pl-4 mb-4 text-gray-700 italic">
                    "{achievement.testimonial}"
                  </blockquote>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-500">
                    {new Date(achievement.achievement_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={route('alumni.show', achievement.user.id)}>
                    <Button className="flex-1">
                      View Profile
                    </Button>
                  </Link>
                  
                  {achievement.linkedin_url && (
                    <a
                      href={achievement.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border rounded hover:bg-gray-50"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <Building className="w-12 h-12 mx-auto mb-4 text-blue-600" />
          <h3 className="font-semibold mb-2">Top Companies</h3>
          <p className="text-gray-600 mb-4">
            See where our alumni are working
          </p>
          <Link href={route('alumni.companies')}>
            <Button variant="outline">
              Explore Companies
            </Button>
          </Link>
        </Card>

        <Card className="p-6 text-center">
          <Award className="w-12 h-12 mx-auto mb-4 text-green-600" />
          <h3 className="font-semibold mb-2">All Achievements</h3>
          <p className="text-gray-600 mb-4">
            Browse all success stories and achievements
          </p>
          <Link href={route('alumni.achievements')}>
            <Button variant="outline">
              View Achievements
            </Button>
          </Link>
        </Card>

        <Card className="p-6 text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-purple-600" />
          <h3 className="font-semibold mb-2">Statistics</h3>
          <p className="text-gray-600 mb-4">
            Detailed analytics and insights
          </p>
          <Link href={route('alumni.stats')}>
            <Button variant="outline">
              View Stats
            </Button>
          </Link>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="p-8 text-center bg-gradient-to-r from-purple-50 to-blue-50">
        <h2 className="text-2xl font-bold mb-4">
          Ready to Transform Your Career?
        </h2>
        <p className="text-gray-600 mb-6">
          Join our bootcamps and start your journey to success
        </p>
        <Link href={route('bootcamps.index')}>
          <Button size="lg">
            Explore Bootcamps
          </Button>
        </Link>
      </Card>

      {/* Pagination */}
      {achievements.last_page > 1 && (
        <div className="flex justify-center gap-2">
          {achievements.current_page > 1 && (
            <Link href={route('alumni.index', { page: achievements.current_page - 1 })}>
              <Button variant="outline">Previous</Button>
            </Link>
          )}
          
          <span className="px-3 py-2">
            Page {achievements.current_page} of {achievements.last_page}
          </span>
          
          {achievements.current_page < achievements.last_page && (
            <Link href={route('alumni.index', { page: achievements.current_page + 1 })}>
              <Button variant="outline">Next</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

AlumniIndex.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;

export default AlumniIndex;
