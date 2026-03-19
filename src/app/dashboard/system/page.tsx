'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import DashboardLayout from '@/layouts/dashboard/layout';
import Head from 'next/head';
import { useState } from 'react';

const SystemDashboard = () => {
  const [logs, setLogs] = useState<string[]>(['System initialized', 'Cache cleared', 'All systems operational']);
  const [isPerformingAction, setIsPerformingAction] = useState(false);

  const handleAction = async (action: string) => {
    setIsPerformingAction(true);
    console.log('Performing action:', action);
    setTimeout(() => setIsPerformingAction(false), 1000);
  };

  return (
    <div className="space-y-6 p-6">
      <Head>
        <title>System Management</title>
      </Head>

      <h1 className="text-3xl font-bold">System Management</h1>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Cache Management</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={() => handleAction('clear')} disabled={isPerformingAction}>
            Clear Cache
          </Button>
          <Button onClick={() => handleAction('optimize')} disabled={isPerformingAction}>
            Optimize Cache
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">System Logs</h3>
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-48 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="mb-1">{log}</div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SystemDashboard;
