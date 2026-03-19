import { Card } from '@/components/ui/card';
import DashboardLayout from '@/layouts/dashboard/layout';
import { Head } from '@inertiajs/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { SharedData } from '@/types/global';

interface AnalyticsProps extends SharedData {
  analytics: {
    users: any;
    courses: any;
    revenue: any;
    enrollments: any;
  };
}

const Analytics = ({ analytics, translate }: AnalyticsProps) => {
  const { frontend } = translate;
  const [selectedPeriod, setSelectedPeriod] = useState('30days');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <Head title="Analytics Dashboard" />

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{frontend.analytics || 'Analytics'}</h1>
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
          <p className="mt-2 text-3xl font-bold">{analytics.users.total}</p>
          <p className="mt-1 text-sm text-green-600">+{analytics.users.new_this_month} this month</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Courses</h3>
          <p className="mt-2 text-3xl font-bold">{analytics.courses.total}</p>
          <p className="mt-1 text-sm text-blue-600">{analytics.courses.published} published</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
          <p className="mt-2 text-3xl font-bold">${analytics.revenue.total}</p>
          <p className="mt-1 text-sm text-green-600">+${analytics.revenue.this_month} this month</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Enrollments</h3>
          <p className="mt-2 text-3xl font-bold">{analytics.enrollments.total}</p>
          <p className="mt-1 text-sm text-purple-600">+{analytics.enrollments.this_month} this month</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User Growth Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.users.growth_chart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.revenue.chart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Courses by Category */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Courses by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.courses.by_category}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.courses.by_category.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Enrollment Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Enrollment Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.enrollments.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#ff7300" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

Analytics.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;

export default Analytics;
