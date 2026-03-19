'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import DashboardLayout from '@/layouts/dashboard/layout';
import Head from 'next/head';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

interface AnalyticsProps {
  analytics: {
    users: any;
    courses: any;
    revenue: any;
    enrollments: any;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30days');

  const mockAnalytics = {
    users: { total: 1250, new_this_month: 45 },
    courses: { total: 85, published: 72 },
    revenue: { total: 45000, this_month: 8500 },
    enrollments: { total: 680, this_month: 125 },
  };

  return (
    <div className="space-y-6 p-6">
      <Head>
        <title>Analytics Dashboard</title>
      </Head>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="1year">Last Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
          <p className="mt-2 text-3xl font-bold">{mockAnalytics.users.total}</p>
          <p className="mt-1 text-sm text-green-600">+{mockAnalytics.users.new_this_month} this month</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Courses</h3>
          <p className="mt-2 text-3xl font-bold">{mockAnalytics.courses.total}</p>
          <p className="mt-1 text-sm text-blue-600">{mockAnalytics.courses.published} published</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
          <p className="mt-2 text-3xl font-bold">${mockAnalytics.revenue.total.toLocaleString()}</p>
          <p className="mt-1 text-sm text-green-600">+${mockAnalytics.revenue.this_month.toLocaleString()} this month</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Enrollments</h3>
          <p className="mt-2 text-3xl font-bold">{mockAnalytics.enrollments.total}</p>
          <p className="mt-1 text-sm text-purple-600">+{mockAnalytics.enrollments.this_month} this month</p>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
