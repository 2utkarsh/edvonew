'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import DashboardLayout from '@/layouts/dashboard/layout';
import Head from 'next/head';
import { useState } from 'react';

const ReportsDashboard = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { value: 'users', label: 'Users Report', description: 'Export all users with their details' },
    { value: 'courses', label: 'Courses Report', description: 'Export all courses with statistics' },
    { value: 'enrollments', label: 'Enrollments Report', description: 'Export enrollment data and progress' },
    { value: 'revenue', label: 'Revenue Report', description: 'Export financial data and transactions' },
  ];

  return (
    <div className="space-y-6 p-6">
      <Head>
        <title>Reports</title>
      </Head>

      <h1 className="text-3xl font-bold">Reports</h1>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Date Range</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => (
          <Card key={report.value} className="p-6">
            <h3 className="text-lg font-medium mb-2">{report.label}</h3>
            <p className="text-sm text-gray-600 mb-4">{report.description}</p>
            <div className="flex gap-2">
              <Button
                disabled={isGenerating}
                variant="outline"
                className="flex-1"
              >
                View
              </Button>
              <Button
                disabled={isGenerating}
                className="flex-1"
              >
                Export Excel
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReportsDashboard;
