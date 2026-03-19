'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, BookOpen,
  BarChart3, PieChart, Activity, AlertTriangle, Download,
  Calendar, Filter, ArrowUpRight, ArrowDownRight, RefreshCw
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Metric Card Component
function MetricCard({ title, value, change, changeType, icon: Icon, prefix = '', suffix = '' }: any) {
  return (
    <motion.div
      className="bg-white rounded-xl p-6 border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${
          changeType === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {changeType === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {change}%
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">
        {prefix}{value.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-gray-500">{title}</div>
    </motion.div>
  );
}

// Revenue Chart (Simple Bar Chart)
function RevenueChart() {
  const data = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 },
  ];

  const maxRevenue = Math.max(...data.map(d => d.revenue));

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-gray-900">Revenue Overview</h3>
          <p className="text-sm text-gray-500">Monthly revenue trend</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5">
            <option>Last 6 months</option>
            <option>Last year</option>
          </select>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Download className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
      <div className="flex items-end gap-4 h-48">
        {data.map((item, index) => (
          <div key={item.month} className="flex-1 flex flex-col items-center">
            <motion.div
              className="w-full bg-gradient-to-t from-indigo-600 to-purple-600 rounded-t-lg"
              initial={{ height: 0 }}
              animate={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            />
            <span className="text-xs text-gray-500 mt-2">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// CAC vs LTV Chart
function CACvsLTVChart() {
  const data = [
    { channel: 'Google Ads', cac: 2500, ltv: 15000 },
    { channel: 'Facebook', cac: 1800, ltv: 12000 },
    { channel: 'LinkedIn', cac: 3200, ltv: 22000 },
    { channel: 'Referral', cac: 500, ltv: 18000 },
    { channel: 'Direct', cac: 0, ltv: 16000 },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-gray-900">CAC vs LTV Analysis</h3>
          <p className="text-sm text-gray-500">Customer Acquisition Cost vs Lifetime Value</p>
        </div>
      </div>
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.channel} className="flex items-center gap-4">
            <div className="w-24 text-sm text-gray-600">{item.channel}</div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-12">CAC:</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${(item.cac / 3500) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 w-16">₹{item.cac.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-12">LTV:</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(item.ltv / 25000) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 w-16">₹{item.ltv.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-green-600">
                {Math.round(item.ltv / item.cac)}x
              </span>
              <div className="text-xs text-gray-500">ROI</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Refund Risk Radar
function RefundRiskRadar() {
  const risks = [
    { student: 'Rahul Verma', course: 'Full Stack Web Dev', progress: 15, daysSinceEnroll: 45, risk: 'high' },
    { student: 'Priya Sharma', course: 'Data Science', progress: 8, daysSinceEnroll: 30, risk: 'high' },
    { student: 'Ananya Iyer', course: 'React Development', progress: 25, daysSinceEnroll: 20, risk: 'medium' },
    { student: 'Vikram Singh', course: 'Python Basics', progress: 40, daysSinceEnroll: 15, risk: 'low' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-gray-900">Refund Risk Radar</h3>
          <p className="text-sm text-gray-500">Students at risk of requesting refund</p>
        </div>
        <span className="text-xs font-medium bg-red-100 text-red-600 px-2 py-1 rounded-full">
          2 High Risk
        </span>
      </div>
      <div className="space-y-3">
        {risks.map((item, index) => (
          <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
            <div className={`w-2 h-2 rounded-full ${
              item.risk === 'high' ? 'bg-red-500' :
              item.risk === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
            }`} />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{item.student}</div>
              <div className="text-xs text-gray-500">{item.course}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{item.progress}% complete</div>
              <div className="text-xs text-gray-500">{item.daysSinceEnroll} days enrolled</div>
            </div>
            <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
              Contact
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Operational Alerts
function OperationalAlerts() {
  const alerts = [
    { type: 'warning', message: '5 classes scheduled without instructor', time: '2 hours ago' },
    { type: 'error', message: 'Payment gateway downtime detected', time: '3 hours ago' },
    { type: 'info', message: 'New batch starting tomorrow - 45 students', time: '5 hours ago' },
    { type: 'warning', message: '3 instructors approaching capacity limit', time: '1 day ago' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900">Operational Alerts</h3>
        <button className="text-sm text-indigo-600 font-medium hover:underline">View All</button>
      </div>
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              alert.type === 'error' ? 'bg-red-100' :
              alert.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
            }`}>
              <AlertTriangle className={`w-4 h-4 ${
                alert.type === 'error' ? 'text-red-600' :
                alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
              }`} />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-900">{alert.message}</div>
              <div className="text-xs text-gray-500 mt-1">{alert.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Marketing Attribution Table
function MarketingAttribution() {
  const data = [
    { source: 'Google Ads', sessions: 12500, conversions: 450, revenue: 675000, cost: 125000 },
    { source: 'Facebook', sessions: 8200, conversions: 320, revenue: 480000, cost: 85000 },
    { source: 'LinkedIn', sessions: 3400, conversions: 180, revenue: 540000, cost: 95000 },
    { source: 'Organic', sessions: 15600, conversions: 520, revenue: 780000, cost: 0 },
    { source: 'Referral', sessions: 2100, conversions: 150, revenue: 225000, cost: 15000 },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Marketing Attribution</h3>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>
      <table className="w-full">
        <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
          <tr>
            <th className="px-6 py-3 text-left">Source</th>
            <th className="px-6 py-3 text-right">Sessions</th>
            <th className="px-6 py-3 text-right">Conversions</th>
            <th className="px-6 py-3 text-right">Revenue</th>
            <th className="px-6 py-3 text-right">Cost</th>
            <th className="px-6 py-3 text-right">ROAS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">{row.source}</td>
              <td className="px-6 py-4 text-right text-gray-600">{row.sessions.toLocaleString()}</td>
              <td className="px-6 py-4 text-right text-gray-600">{row.conversions}</td>
              <td className="px-6 py-4 text-right font-medium text-gray-900">₹{(row.revenue / 1000).toFixed(0)}K</td>
              <td className="px-6 py-4 text-right text-gray-600">₹{(row.cost / 1000).toFixed(0)}K</td>
              <td className="px-6 py-4 text-right">
                <span className={`font-medium ${
                  row.cost > 0 && row.revenue / row.cost >= 3 ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {row.cost > 0 ? `${(row.revenue / row.cost).toFixed(1)}x` : '-'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDashboardPage() {
  const stats = [
    { title: 'Total Revenue', value: 3285000, change: 12.5, changeType: 'up', icon: DollarSign, prefix: '₹' },
    { title: 'Active Students', value: 2847, change: 8.2, changeType: 'up', icon: Users },
    { title: 'Course Completions', value: 456, change: 15.3, changeType: 'up', icon: BookOpen },
    { title: 'Placement Rate', value: 78, change: 2.1, changeType: 'up', icon: TrendingUp, suffix: '%' },
  ];

  return (
    <DashboardLayout userRole="admin" userName="Admin User">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Intelligence</h1>
            <p className="text-gray-500 mt-1">Real-time platform analytics and insights</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Last updated: 5 min ago</span>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <MetricCard key={stat.title} {...stat} delay={index * 0.1} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <CACvsLTVChart />
        </div>

        {/* Risk & Alerts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RefundRiskRadar />
          <OperationalAlerts />
        </div>

        {/* Marketing Attribution */}
        <MarketingAttribution />

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold mb-1">₹4.2L</div>
            <div className="text-indigo-100 text-sm">MRR</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold mb-1">₹2,150</div>
            <div className="text-emerald-100 text-sm">Avg CAC</div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold mb-1">₹15,800</div>
            <div className="text-blue-100 text-sm">Avg LTV</div>
          </div>
          <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold mb-1">7.3x</div>
            <div className="text-orange-100 text-sm">LTV:CAC Ratio</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
