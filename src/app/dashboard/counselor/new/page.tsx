'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Phone, Mail, Calendar, MessageSquare, Plus,
  Search, Filter, MoreVertical, Clock, TrendingUp,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

type LeadProbability = 'high' | 'medium' | 'low';

interface Lead {
  id: string;
  name: string;
  email: string;
  source: string;
  notes: string;
  lastContact: string;
  probability: LeadProbability;
}

interface LeadCardProps {
  lead: Lead;
  onDragStart?: (event: React.DragEvent<HTMLDivElement> | MouseEvent | TouchEvent | PointerEvent, lead: Lead) => void;
}

interface PipelineColumnProps {
  title: string;
  status: string;
  leads: Lead[];
  count: number;
  color: string;
  onDrop: (event: React.DragEvent<HTMLDivElement>, status: string) => void;
}

// Lead Card Component
function LeadCard({ lead, onDragStart }: LeadCardProps) {
  const probabilityColors = {
    high: 'bg-green-100 text-green-600',
    medium: 'bg-yellow-100 text-yellow-600',
    low: 'bg-red-100 text-red-600',
  };

  return (
    <motion.div
      draggable
      onDragStart={(e) => onDragStart?.(e, lead)}
      className="bg-white rounded-lg border border-gray-100 p-4 cursor-move hover:shadow-md transition-shadow"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
            {lead.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{lead.name}</h4>
            <p className="text-xs text-gray-500">{lead.email}</p>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="bg-gray-100 px-2 py-0.5 rounded">{lead.source}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {lead.lastContact}
          </span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{lead.notes}</p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${probabilityColors[lead.probability]}`}>
          {lead.probability === 'high' ? '80%+' : lead.probability === 'medium' ? '50-80%' : '<50%'}
        </span>
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-gray-100 rounded-lg">
            <Phone className="w-4 h-4 text-gray-500" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg">
            <Mail className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Pipeline Column Component
function PipelineColumn({ title, status, leads, count, color, onDrop }: PipelineColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      className={`flex-1 min-w-[280px] rounded-xl ${
        isDragOver ? 'bg-indigo-50' : 'bg-gray-50'
      } transition-colors`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        onDrop(e, status);
      }}
    >
      <div className="p-4 border-b border-gray-200 bg-white rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <h3 className="font-semibold text-gray-900">{title}</h3>
          </div>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
      </div>
      <div className="p-3 space-y-3 min-h-[400px]">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
        <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>
    </div>
  );
}

// Follow-up List
function FollowUpList() {
  const followUps = [
    { name: 'Priya Sharma', time: 'Today, 3:00 PM', type: 'call', status: 'scheduled' },
    { name: 'Rahul Verma', time: 'Today, 5:30 PM', type: 'demo', status: 'scheduled' },
    { name: 'Ananya Iyer', time: 'Tomorrow, 10:00 AM', type: 'call', status: 'scheduled' },
    { name: 'Vikram Singh', time: 'Tomorrow, 2:00 PM', type: 'meeting', status: 'overdue' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900">Today's Follow-ups</h3>
        <button className="text-sm text-indigo-600 font-medium hover:underline">View Calendar</button>
      </div>
      <div className="space-y-3">
        {followUps.map((item, index) => (
          <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              item.type === 'call' ? 'bg-blue-100' :
              item.type === 'demo' ? 'bg-purple-100' : 'bg-green-100'
            }`}>
              {item.type === 'call' ? <Phone className="w-5 h-5 text-blue-600" /> :
               item.type === 'demo' ? <Calendar className="w-5 h-5 text-purple-600" /> :
               <User className="w-5 h-5 text-green-600" />}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{item.name}</div>
              <div className="text-xs text-gray-500">{item.time}</div>
            </div>
            {item.status === 'overdue' && (
              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                Overdue
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Conversion Stats
function ConversionStats() {
  const stages = [
    { stage: 'New → Contacted', rate: 85 },
    { stage: 'Contacted → Interested', rate: 60 },
    { stage: 'Interested → Demo', rate: 45 },
    { stage: 'Demo → Enrolled', rate: 35 },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
      <div className="space-y-4">
        {stages.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">{item.stage}</span>
              <span className="font-medium text-gray-900">{item.rate}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${item.rate}%` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CounselorDashboardPage() {
  const [leads, setLeads] = useState<Record<string, Lead[]>>({
    new: [
      { id: '1', name: 'Amit Kumar', email: 'amit@email.com', source: 'Website', notes: 'Interested in Full Stack course', lastContact: '2h ago', probability: 'medium' },
      { id: '2', name: 'Sneha Patel', email: 'sneha@email.com', source: 'Facebook', notes: 'Looking for career change options', lastContact: '5h ago', probability: 'high' },
    ],
    contacted: [
      { id: '3', name: 'Rajesh Singh', email: 'rajesh@email.com', source: 'Google Ads', notes: 'Requested callback for pricing', lastContact: '1d ago', probability: 'high' },
    ],
    interested: [
      { id: '4', name: 'Priya Sharma', email: 'priya@email.com', source: 'Referral', notes: 'Very interested, needs demo', lastContact: '3h ago', probability: 'high' },
      { id: '5', name: 'Vikram Joshi', email: 'vikram@email.com', source: 'LinkedIn', notes: 'Comparing with other platforms', lastContact: '6h ago', probability: 'medium' },
    ],
    demo_scheduled: [
      { id: '6', name: 'Ananya Iyer', email: 'ananya@email.com', source: 'Website', notes: 'Demo scheduled for tomorrow', lastContact: '1h ago', probability: 'high' },
    ],
    enrolled: [
      { id: '7', name: 'Rahul Verma', email: 'rahul@email.com', source: 'Google Ads', notes: 'Enrolled in Full Stack batch', lastContact: '2d ago', probability: 'high' },
    ],
    dead: [
      { id: '8', name: 'Kiran Desai', email: 'kiran@email.com', source: 'Facebook', notes: 'Budget constraints', lastContact: '1w ago', probability: 'low' },
    ],
  });

  const handleDrop = (e: React.DragEvent, status: string) => {
    // Handle lead movement between columns
    console.log('Dropped to:', status);
  };

  const stats = [
    { label: 'Total Leads', value: 156, icon: User, color: 'indigo' },
    { label: 'This Week', value: 23, icon: TrendingUp, color: 'blue' },
    { label: 'Conversion Rate', value: '32%', icon: CheckCircle, color: 'emerald' },
    { label: 'Revenue Generated', value: '₹4.2L', icon: TrendingUp, color: 'purple' },
  ];

  return (
    <DashboardLayout userRole="counselor" userName="Counselor Name">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lead Pipeline</h1>
            <p className="text-gray-500 mt-1">Manage and track your leads</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64"
              />
            </div>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Lead
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
                <span className="text-sm text-gray-500">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Pipeline Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          <PipelineColumn title="New" status="new" leads={leads.new} count={leads.new.length} color="bg-blue-500" onDrop={handleDrop} />
          <PipelineColumn title="Contacted" status="contacted" leads={leads.contacted} count={leads.contacted.length} color="bg-purple-500" onDrop={handleDrop} />
          <PipelineColumn title="Interested" status="interested" leads={leads.interested} count={leads.interested.length} color="bg-indigo-500" onDrop={handleDrop} />
          <PipelineColumn title="Demo Scheduled" status="demo_scheduled" leads={leads.demo_scheduled} count={leads.demo_scheduled.length} color="bg-yellow-500" onDrop={handleDrop} />
          <PipelineColumn title="Enrolled" status="enrolled" leads={leads.enrolled} count={leads.enrolled.length} color="bg-green-500" onDrop={handleDrop} />
          <PipelineColumn title="Dead" status="dead" leads={leads.dead} count={leads.dead.length} color="bg-gray-400" onDrop={handleDrop} />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FollowUpList />
          <ConversionStats />
        </div>
      </div>
    </DashboardLayout>
  );
}



