'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import DashboardLayout from '@/layouts/dashboard/layout';
import Head from 'next/head';
import { useState } from 'react';

const BackupDashboard = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedType, setSelectedType] = useState('full');

  const handleCreateBackup = async (type: string) => {
    setIsCreating(true);
    console.log('Creating backup:', type);
    setTimeout(() => setIsCreating(false), 2000);
  };

  const backups: any[] = [];

  return (
    <div className="space-y-6 p-6">
      <Head>
        <title>Backup Management</title>
      </Head>

      <h1 className="text-3xl font-bold">Backup Management</h1>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Create New Backup</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Backup Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
            >
              <option value="full">Full Backup (Database + Files)</option>
              <option value="database">Database Only</option>
              <option value="files">Files Only</option>
            </select>
          </div>
          <Button
            onClick={() => handleCreateBackup(selectedType)}
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? 'Creating Backup...' : `Create ${selectedType} Backup`}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Existing Backups</h3>
        {backups.length > 0 ? (
          <div>Backups list will appear here</div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No backups found. Create your first backup above.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BackupDashboard;
