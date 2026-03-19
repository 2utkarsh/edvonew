import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/layouts/dashboard/layout';
import { Head, Link } from '@inertiajs/react';
import { ExternalLink, Github, User, Briefcase, Star } from 'lucide-react';
import { SharedData } from '@/types/global';

interface PortfolioProject {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  project_url?: string;
  github_url?: string;
  demo_url?: string;
  images: string[];
  featured: boolean;
}

interface Portfolio {
  id: number;
  title: string;
  slug: string;
  bio: string;
  skills: string[];
  experience_years?: number;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  profile_image?: string;
  is_public: boolean;
  views_count: number;
  featured: boolean;
  user: {
    id: number;
    name: string;
    email: string;
  };
  bootcamp?: {
    id: number;
    title: string;
  };
  projects: PortfolioProject[];
}

interface PortfoliosProps extends SharedData {
  portfolios: {
    data: Portfolio[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const PortfoliosIndex = ({ portfolios, translate }: PortfoliosProps) => {
  const { frontend } = translate;

  return (
    <div className="space-y-8">
      <Head title="Student Portfolios" />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16 px-4 rounded-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Job-Ready Portfolios
          </h1>
          <p className="text-xl mb-8">
            See how our bootcamp learners showcase their skills and projects
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" variant="secondary">
              Explore All Portfolios
            </Button>
            <Button size="lg">
              Create Your Portfolio
            </Button>
          </div>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.data.map((portfolio) => (
          <Card key={portfolio.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {portfolio.featured && (
              <div className="bg-purple-400 text-purple-900 px-3 py-1 text-sm font-semibold text-center">
                Featured Portfolio
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={portfolio.profile_image || '/images/default-avatar.jpg'}
                  alt={portfolio.user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">{portfolio.title}</h3>
                  <p className="text-sm text-gray-600">{portfolio.user.name}</p>
                  {portfolio.bootcamp && (
                    <p className="text-xs text-gray-500">{portfolio.bootcamp.title}</p>
                  )}
                </div>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-3">
                {portfolio.bio}
              </p>

              {portfolio.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {portfolio.skills.slice(0, 5).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {portfolio.skills.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{portfolio.skills.length - 5} more
                    </Badge>
                  )}
                </div>
              )}

              {portfolio.projects.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Featured Projects</h4>
                  <div className="space-y-2">
                    {portfolio.projects.slice(0, 2).map((project) => (
                      <div key={project.id} className="text-sm">
                        <div className="font-medium">{project.title}</div>
                        <div className="text-gray-600 line-clamp-1">{project.description}</div>
                        {project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {project.technologies.slice(0, 3).map((tech, index) => (
                              <span key={index} className="text-xs bg-gray-100 px-1 rounded">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="w-4 h-4" />
                  <span>{portfolio.views_count} views</span>
                </div>
                {portfolio.experience_years && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Briefcase className="w-4 h-4" />
                    <span>{portfolio.experience_years} years</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Link href={route('portfolio.show', portfolio.slug)}>
                  <Button className="flex-1">
                    View Portfolio
                  </Button>
                </Link>
                
                <div className="flex gap-1">
                  {portfolio.github_url && (
                    <a
                      href={portfolio.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border rounded hover:bg-gray-50"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {portfolio.website_url && (
                    <a
                      href={portfolio.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border rounded hover:bg-gray-50"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {portfolios.data.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            No portfolios available yet. Be the first to showcase your work!
          </div>
          <Button>
            Create Your Portfolio
          </Button>
        </div>
      )}

      {/* Pagination */}
      {portfolios.last_page > 1 && (
        <div className="flex justify-center gap-2">
          {portfolios.current_page > 1 && (
            <Link href={route('portfolio.index', { page: portfolios.current_page - 1 })}>
              <Button variant="outline">Previous</Button>
            </Link>
          )}
          
          <span className="px-3 py-2">
            Page {portfolios.current_page} of {portfolios.last_page}
          </span>
          
          {portfolios.current_page < portfolios.last_page && (
            <Link href={route('portfolio.index', { page: portfolios.current_page + 1 })}>
              <Button variant="outline">Next</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

PortfoliosIndex.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;

export default PortfoliosIndex;
