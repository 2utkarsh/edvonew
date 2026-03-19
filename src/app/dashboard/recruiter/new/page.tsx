'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, MapPin, Briefcase, Star, Github, Linkedin,
  Calendar, CheckCircle, Award, TrendingUp, Users, FileText,
  ChevronDown, ExternalLink, MessageSquare, Eye
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Candidate Card Component
function CandidateCard({ candidate, onShortlist }: any) {
  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {candidate.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{candidate.name}</h3>
              <p className="text-sm text-gray-500">{candidate.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              candidate.availability === 'Immediately' 
                ? 'bg-green-50 text-green-600' 
                : 'bg-yellow-50 text-yellow-600'
            }`}>
              {candidate.availability}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {candidate.location}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase className="w-4 h-4" />
            {candidate.experience}
          </span>
        </div>
      </div>

      {/* Verified Skills */}
      <div className="p-6 bg-gray-50">
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Verified Skills</h4>
        <div className="flex flex-wrap gap-2">
          {candidate.skills.map((skill: any) => (
            <span
              key={skill.name}
              className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm border border-gray-200"
            >
              {skill.verified && <CheckCircle className="w-3 h-3 text-green-500" />}
              {skill.name}
              {skill.score && <span className="text-xs text-gray-500">({skill.score}%)</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Projects & Scores */}
      <div className="p-6 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{candidate.projects}</div>
            <div className="text-xs text-gray-500">Projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{candidate.avgScore}%</div>
            <div className="text-xs text-gray-500">Avg Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{candidate.certificateCount}</div>
            <div className="text-xs text-gray-500">Certificates</div>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-2 mb-4">
          {candidate.github && (
            <a href={candidate.github} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
              <Github className="w-4 h-4" /> GitHub
            </a>
          )}
          {candidate.linkedin && (
            <a href={candidate.linkedin} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 ml-4">
              <Linkedin className="w-4 h-4" /> LinkedIn
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onShortlist(candidate.id)}
            className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
              candidate.shortlisted
                ? 'bg-green-100 text-green-600'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {candidate.shortlisted ? 'Shortlisted ✓' : 'Shortlist'}
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
            View Portfolio
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
            Schedule Interview
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Filter Panel
function FilterPanel() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Skills</label>
          <div className="flex flex-wrap gap-2">
            {['React', 'Node.js', 'Python', 'Java', 'AWS'].map((skill) => (
              <button
                key={skill}
                className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Experience</label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option>Any Experience</option>
            <option>0-1 years</option>
            <option>1-3 years</option>
            <option>3-5 years</option>
            <option>5+ years</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option>Any Location</option>
            <option>Bangalore</option>
            <option>Mumbai</option>
            <option>Delhi</option>
            <option>Remote</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Minimum Score</label>
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="60"
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>60%</span>
            <span>100%</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Availability</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="text-sm text-gray-600">Immediately Available</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="text-sm text-gray-600">Notice Period</span>
            </label>
          </div>
        </div>
      </div>

      <button className="w-full mt-6 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors">
        Apply Filters
      </button>
    </div>
  );
}

// Shortlisted Panel
function ShortlistedPanel({ candidates }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Shortlisted Candidates</h3>
        <span className="text-sm text-gray-500">{candidates.length} candidates</span>
      </div>
      <div className="space-y-3">
        {candidates.map((candidate: any) => (
          <div key={candidate.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
              {candidate.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{candidate.name}</div>
              <div className="text-xs text-gray-500">{candidate.role}</div>
            </div>
            <button className="p-1.5 hover:bg-gray-200 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-500" />
            </button>
            <button className="p-1.5 hover:bg-gray-200 rounded-lg">
              <MessageSquare className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg font-medium text-sm hover:bg-indigo-50 transition-colors">
        Schedule Bulk Interview
      </button>
    </div>
  );
}

export default function RecruiterDashboardPage() {
  const [shortlisted, setShortlisted] = useState<string[]>(['3', '5']);

  const candidates = [
    {
      id: '1',
      name: 'Priya Sharma',
      role: 'Full Stack Developer',
      location: 'Bangalore',
      experience: '2 years',
      availability: 'Immediately',
      skills: [
        { name: 'React', verified: true, score: 92 },
        { name: 'Node.js', verified: true, score: 88 },
        { name: 'TypeScript', verified: true, score: 85 },
        { name: 'MongoDB', verified: true, score: 78 },
      ],
      projects: 8,
      avgScore: 89,
      certificateCount: 3,
      github: 'https://github.com/priya',
      linkedin: 'https://linkedin.com/in/priya',
      shortlisted: false,
    },
    {
      id: '2',
      name: 'Rahul Verma',
      role: 'Backend Developer',
      location: 'Remote',
      experience: '3 years',
      availability: '2 weeks notice',
      skills: [
        { name: 'Python', verified: true, score: 95 },
        { name: 'Django', verified: true, score: 90 },
        { name: 'PostgreSQL', verified: true, score: 88 },
        { name: 'AWS', verified: false },
      ],
      projects: 12,
      avgScore: 91,
      certificateCount: 4,
      github: 'https://github.com/rahul',
      linkedin: 'https://linkedin.com/in/rahul',
      shortlisted: false,
    },
    {
      id: '3',
      name: 'Ananya Iyer',
      role: 'Frontend Developer',
      location: 'Mumbai',
      experience: '1.5 years',
      availability: 'Immediately',
      skills: [
        { name: 'React', verified: true, score: 94 },
        { name: 'Vue.js', verified: true, score: 82 },
        { name: 'CSS/Tailwind', verified: true, score: 96 },
      ],
      projects: 6,
      avgScore: 92,
      certificateCount: 2,
      github: 'https://github.com/ananya',
      linkedin: 'https://linkedin.com/in/ananya',
      shortlisted: true,
    },
    {
      id: '4',
      name: 'Vikram Singh',
      role: 'DevOps Engineer',
      location: 'Delhi',
      experience: '4 years',
      availability: '1 month notice',
      skills: [
        { name: 'Docker', verified: true, score: 90 },
        { name: 'Kubernetes', verified: true, score: 85 },
        { name: 'Jenkins', verified: true, score: 88 },
        { name: 'Terraform', verified: false },
      ],
      projects: 15,
      avgScore: 87,
      certificateCount: 5,
      github: 'https://github.com/vikram',
      linkedin: 'https://linkedin.com/in/vikram',
      shortlisted: false,
    },
    {
      id: '5',
      name: 'Sneha Patel',
      role: 'Full Stack Developer',
      location: 'Bangalore',
      experience: '2.5 years',
      availability: 'Immediately',
      skills: [
        { name: 'React', verified: true, score: 91 },
        { name: 'Node.js', verified: true, score: 89 },
        { name: 'GraphQL', verified: true, score: 84 },
      ],
      projects: 10,
      avgScore: 88,
      certificateCount: 3,
      github: 'https://github.com/sneha',
      linkedin: 'https://linkedin.com/in/sneha',
      shortlisted: true,
    },
  ];

  const handleShortlist = (id: string) => {
    setShortlisted(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const stats = [
    { label: 'Total Candidates', value: 2847, icon: Users, color: 'indigo' },
    { label: 'Verified Profiles', value: 1923, icon: CheckCircle, color: 'green' },
    { label: 'Shortlisted', value: shortlisted.length, icon: Star, color: 'yellow' },
    { label: 'Interviews Scheduled', value: 12, icon: Calendar, color: 'purple' },
  ];

  const shortlistedCandidates = candidates.filter(c => shortlisted.includes(c.id));

  return (
    <DashboardLayout userRole="recruiter" userName="Recruiter Name">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Find Talent</h1>
            <p className="text-gray-500 mt-1">Search and filter verified candidates</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
              <FileText className="w-4 h-4" /> Post Job
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white rounded-xl p-6 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-50 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, skills, or role..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters */}
          <div className="lg:col-span-1">
            <FilterPanel />
            <div className="mt-6">
              <ShortlistedPanel candidates={shortlistedCandidates} />
            </div>
          </div>

          {/* Candidates Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">
                Showing {candidates.length} candidates
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
                  <option>Relevance</option>
                  <option>Score (High to Low)</option>
                  <option>Experience</option>
                  <option>Recently Active</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {candidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={{ ...candidate, shortlisted: shortlisted.includes(candidate.id) }}
                  onShortlist={handleShortlist}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
