import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DashboardLayout from '@/layouts/dashboard/layout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { SharedData } from '@/types/global';

interface ReportsProps extends SharedData {
  dashboard: {
    total_users: number;
    total_courses: number;
    total_enrollments: number;
    total_revenue: number;
    new_users_this_month: number;
    new_enrollments_this_month: number;
    revenue_this_month: number;
  };
}

const Reports = ({ dashboard, translate }: ReportsProps) => {
  const { frontend } = translate;
  const [selectedReport, setSelectedReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { value: 'users', label: 'Users Report', description: 'Export all users with their details' },
    { value: 'courses', label: 'Courses Report', description: 'Export all courses with statistics' },
    { value: 'enrollments', label: 'Enrollments Report', description: 'Export enrollment data and progress' },
    { value: 'revenue', label: 'Revenue Report', description: 'Export financial data and transactions' },
    { value: 'assignments', label: 'Assignments Report', description: 'Export assignment submissions' },
    { value: 'quizzes', label: 'Quizzes Report', description: 'Export quiz results and scores' },
  ];

  const handleGenerateReport = async (type: string, format: string = 'view') => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/dashboard/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          type,
          format,
          start_date: document.getElementById('start_date')?.value,
          end_date: document.getElementById('end_date')?.value,
        }),
      });

      if (format === 'excel') {
        // Handle file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-report.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        // Handle view format - display in modal or new page
        console.log('Report data:', data);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Head title="Reports" />

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{frontend.reports || 'Reports'}</h1>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
          <p className="mt-2 text-3xl font-bold">{dashboard.total_users}</p>
          <p className="mt-1 text-sm text-green-600">+{dashboard.new_users_this_month} this month</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Courses</h3>
          <p className="mt-2 text-3xl font-bold">{dashboard.total_courses}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Enrollments</h3>
          <p className="mt-2 text-3xl font-bold">{dashboard.total_enrollments}</p>
          <p className="mt-1 text-sm text-purple-600">+{dashboard.new_enrollments_this_month} this month</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
          <p className="mt-2 text-3xl font-bold">${dashboard.total_revenue}</p>
          <p className="mt-1 text-sm text-green-600">+${dashboard.revenue_this_month} this month</p>
        </Card>
      </div>

      {/* Date Range Filter */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Date Range</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              id="start_date"
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              id="end_date"
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
      </Card>

      {/* Report Types */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => (
          <Card key={report.value} className="p-6">
            <h3 className="text-lg font-medium mb-2">{report.label}</h3>
            <p className="text-sm text-gray-600 mb-4">{report.description}</p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleGenerateReport(report.value, 'view')}
                disabled={isGenerating}
                variant="outline"
                className="flex-1"
              >
                View
              </Button>
              <Button
                onClick={() => handleGenerateReport(report.value, 'excel')}
                disabled={isGenerating}
                className="flex-1"
              >
                Export Excel
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Recent Reports</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No reports generated yet. Select a report type above to get started.</p>
        </div>
      </Card>
    </div>
  );
};

Reports.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;

export default Reports;
