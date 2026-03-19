'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Search, MapPin, Briefcase, DollarSign, Clock, Building2, 
  Filter, ChevronDown, TrendingUp, Users, ExternalLink 
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import { FadeIn, StaggerGrid } from '@/components/animations';
import { Job } from '@/types';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const jobTypes = ['all', 'full-time', 'part-time', 'remote', 'internship'];
  const locations = ['all', 'Bangalore', 'Delhi', 'Hyderabad', 'Remote', 'Mumbai', 'Pune'];

  useEffect(() => {
    fetchJobs();
  }, [selectedType, selectedLocation]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedType !== 'all') params.type = selectedType;
      if (selectedLocation !== 'all') params.location = selectedLocation;
      if (searchTerm) params.search = searchTerm;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await axios.get(`${apiUrl}/api/jobs`, { params });
      setJobs(response.data.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'gradient';
      case 'part-time': return 'info';
      case 'remote': return 'success';
      case 'internship': return 'warning';
      default: return 'default';
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-12">
            <Badge variant="gradient" className="mb-4">Career Opportunities</Badge>
            <h1 className="text-5xl font-bold mb-4">
              Find Your Dream <span className="gradient-text">Job</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover exciting job opportunities at top companies
            </p>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.2}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Total Jobs', value: jobs.length.toString(), icon: Briefcase },
              { label: 'Companies Hiring', value: '500+', icon: Building2 },
              { label: 'New This Week', value: '150+', icon: TrendingUp },
              { label: 'Active Applicants', value: '10K+', icon: Users },
            ].map((stat, index) => (
              <Card key={stat.label} className="!p-6 text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </Card>
            ))}
          </div>
        </FadeIn>

        {/* Search and Filters */}
        <FadeIn delay={0.3}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by job title, company, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 !py-4 !text-lg"
                />
              </div>
            </form>

            <div className="flex flex-wrap items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>

              <div className={`${showFilters ? 'block' : 'hidden'} md:flex flex-wrap gap-4 flex-1`}>
                {/* Job Type Filter */}
                <div className="relative">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="appearance-none bg-gray-100 dark:bg-gray-700 border-0 rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">All Types</option>
                    {jobTypes.filter(t => t !== 'all').map(type => (
                      <option key={type} value={type}>{type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                </div>

                {/* Location Filter */}
                <div className="relative">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="appearance-none bg-gray-100 dark:bg-gray-700 border-0 rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">All Locations</option>
                    {locations.filter(l => l !== 'all').map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                </div>

                <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                  Showing <span className="font-semibold">{jobs.length}</span> jobs
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Job Listings */}
        <StaggerGrid staggerDelay={0.1}>
          <div className="space-y-6">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <JobCardSkeleton key={i} />
              ))
            ) : jobs.length > 0 ? (
              jobs.map((job, index) => (
                <FadeIn key={job.id} delay={index * 0.05}>
                  <Card className="!p-6 hover:!shadow-xl transition-shadow">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Company Logo */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-3xl">
                          🏢
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                              {job.title}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                              <Building2 className="w-4 h-4" />
                              <span>{job.company}</span>
                            </div>
                          </div>
                          <Badge variant={getTypeColor(job.type)} size="lg">
                            {job.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 mb-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <DollarSign className="w-4 h-4" />
                            {job.salary}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            {getTimeAgo(job.postedDate)}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Users className="w-4 h-4" />
                            {job.applicants} applicants
                          </div>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                          {job.description}
                        </p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {job.skills.slice(0, 5).map((skill) => (
                            <Badge key={skill} variant="info" size="sm">
                              {skill}
                            </Badge>
                          ))}
                          {job.skills.length > 5 && (
                            <Badge variant="default" size="sm">
                              +{job.skills.length - 5} more
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-4">
                          <Button variant="primary" size="md" className="group">
                            Apply Now
                            <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                          <Button variant="outline" size="md">
                            Save Job
                          </Button>
                          {job.applicationDeadline && (
                            <span className="text-sm text-orange-600 dark:text-orange-400">
                              ⏰ Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </FadeIn>
              ))
            ) : (
              <Card className="!p-12 text-center">
                <Briefcase className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                <h3 className="text-2xl font-bold mb-2">No jobs found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your search or filters
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('all');
                    setSelectedLocation('all');
                  }}
                >
                  Clear All Filters
                </Button>
              </Card>
            )}
          </div>
        </StaggerGrid>

        {/* Load More */}
        {!loading && jobs.length > 0 && (
          <FadeIn delay={0.4}>
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Jobs
              </Button>
            </div>
          </FadeIn>
        )}
      </div>
    </main>
  );
}


