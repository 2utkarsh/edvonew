import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/layouts/dashboard/layout';
import { Head, Link } from '@inertiajs/react';
import { Star, Clock, Users, Award, Calendar, DollarSign } from 'lucide-react';
import { SharedData } from '@/types/global';

interface Bootcamp {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  level: string;
  duration_weeks: number;
  live_sessions: number;
  projects_count: number;
  virtual_internships: number;
  price: number;
  discount_price?: number;
  image?: string;
  featured: boolean;
  start_date: string;
  end_date: string;
  max_students: number;
  current_enrollments: number;
  instructor: {
    id: number;
    name: string;
    avatar?: string;
  };
  category: {
    id: number;
    name: string;
  };
  average_rating: number;
  total_reviews: number;
  is_enrollment_open: boolean;
  remaining_slots: number;
}

interface BootcampsProps extends SharedData {
  bootcamps: {
    data: Bootcamp[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const BootcampsIndex = ({ bootcamps, translate }: BootcampsProps) => {
  const { frontend } = translate;

  return (
    <div className="space-y-8">
      <Head title="Bootcamps" />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4 rounded-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Live Cohorts & Bootcamps
          </h1>
          <p className="text-xl mb-8">
            Designed for Working Professionals Who Prefer Flexible Learning
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">76K+</div>
              <div>Learners</div>
            </div>
            <div>
              <div className="text-3xl font-bold">6000+</div>
              <div>Recent Placements</div>
            </div>
            <div>
              <div className="text-3xl font-bold">353+</div>
              <div>Companies</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bootcamp Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bootcamps.data.map((bootcamp) => (
          <Card key={bootcamp.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {bootcamp.featured && (
              <div className="bg-yellow-400 text-yellow-900 px-3 py-1 text-sm font-semibold text-center">
                Featured
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={bootcamp.image || '/images/default-bootcamp.jpg'}
                  alt={bootcamp.title}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">{bootcamp.title}</h3>
                  <p className="text-sm text-gray-600">{bootcamp.category.name}</p>
                </div>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">
                {bootcamp.short_description}
              </p>

              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{bootcamp.duration_weeks} Weeks</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{bootcamp.live_sessions} Live Sessions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>{bootcamp.projects_count} Projects</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{bootcamp.virtual_internships} Internships</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Badge variant={bootcamp.level === 'beginner' ? 'default' : bootcamp.level === 'intermediate' ? 'secondary' : 'destructive'}>
                  {bootcamp.level}
                </Badge>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{bootcamp.average_rating.toFixed(1)}</span>
                  <span className="text-gray-500">({bootcamp.total_reviews})</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2">
                  {bootcamp.discount_price ? (
                    <>
                      <span className="text-2xl font-bold text-green-600">
                        ₹{bootcamp.discount_price.toLocaleString()}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        ₹{bootcamp.price.toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold">
                      ₹{bootcamp.price.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {bootcamp.remaining_slots} slots left
                </p>
              </div>

              <div className="space-y-2">
                <Link href={route('bootcamps.show', bootcamp.slug)}>
                  <Button className="w-full">
                    Know More
                  </Button>
                </Link>
                
                {bootcamp.is_enrollment_open ? (
                  <Link href={route('bootcamps.enroll', bootcamp.id)}>
                    <Button variant="outline" className="w-full">
                      Enroll Now
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Enrollment Closed
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {bootcamps.last_page > 1 && (
        <div className="flex justify-center gap-2">
          {bootcamps.current_page > 1 && (
            <Link href={route('bootcamps.index', { page: bootcamps.current_page - 1 })}>
              <Button variant="outline">Previous</Button>
            </Link>
          )}
          
          <span className="px-3 py-2">
            Page {bootcamps.current_page} of {bootcamps.last_page}
          </span>
          
          {bootcamps.current_page < bootcamps.last_page && (
            <Link href={route('bootcamps.index', { page: bootcamps.current_page + 1 })}>
              <Button variant="outline">Next</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

BootcampsIndex.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;

export default BootcampsIndex;
