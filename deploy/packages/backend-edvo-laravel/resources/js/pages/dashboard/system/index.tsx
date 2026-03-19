import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DashboardLayout from '@/layouts/dashboard/layout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { SharedData } from '@/types/global';

interface SystemProps extends SharedData {
  systemInfo: {
    server: any;
    laravel: any;
    database: any;
    storage: any;
    cache: any;
  };
}

const System = ({ systemInfo, translate }: SystemProps) => {
  const { frontend } = translate;
  const [logs, setLogs] = useState<string[]>([]);
  const [isPerformingAction, setIsPerformingAction] = useState(false);

  const handleAction = async (endpoint: string, action: string) => {
    setIsPerformingAction(true);
    try {
      const response = await fetch(`/dashboard/system/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();
      if (data.success) {
        // Show success message
        console.log(data.message);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setIsPerformingAction(false);
    }
  };

  const fetchLogs = async (type: string = 'laravel') => {
    try {
      const response = await fetch(`/dashboard/system/logs?type=${type}`);
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <Head title="System Management" />

      <h1 className="text-3xl font-bold">System Management</h1>

      {/* Server Information */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Server Information</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <span className="font-medium">PHP Version:</span> {systemInfo.server.php_version}
          </div>
          <div>
            <span className="font-medium">Server Software:</span> {systemInfo.server.server_software}
          </div>
          <div>
            <span className="font-medium">Server OS:</span> {systemInfo.server.server_os}
          </div>
          <div>
            <span className="font-medium">Memory Limit:</span> {systemInfo.server.memory_limit}
          </div>
          <div>
            <span className="font-medium">Upload Max Filesize:</span> {systemInfo.server.upload_max_filesize}
          </div>
          <div>
            <span className="font-medium">Disk Free Space:</span> {(systemInfo.server.disk_free_space / 1024 / 1024 / 1024).toFixed(2)} GB
          </div>
        </div>
      </Card>

      {/* Laravel Information */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Laravel Information</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <span className="font-medium">Laravel Version:</span> {systemInfo.laravel.version}
          </div>
          <div>
            <span className="font-medium">Environment:</span> {systemInfo.laravel.environment}
          </div>
          <div>
            <span className="font-medium">Debug Mode:</span> {systemInfo.laravel.debug_mode ? 'Enabled' : 'Disabled'}
          </div>
          <div>
            <span className="font-medium">Cache Driver:</span> {systemInfo.laravel.cache_driver}
          </div>
          <div>
            <span className="font-medium">Session Driver:</span> {systemInfo.laravel.session_driver}
          </div>
          <div>
            <span className="font-medium">Queue Driver:</span> {systemInfo.laravel.queue_driver}
          </div>
        </div>
      </Card>

      {/* Database Information */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Database Information</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <span className="font-medium">Driver:</span> {systemInfo.database.driver}
          </div>
          <div>
            <span className="font-medium">Version:</span> {systemInfo.database.version}
          </div>
          <div>
            <span className="font-medium">Database:</span> {systemInfo.database.database}
          </div>
          <div>
            <span className="font-medium">Host:</span> {systemInfo.database.host}
          </div>
        </div>
      </Card>

      {/* Cache Management */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Cache Management</h3>
        <div className="mb-4">
          <span className="font-medium">Status:</span> 
          <span className={`ml-2 px-2 py-1 rounded text-sm ${
            systemInfo.cache.status === 'Working' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {systemInfo.cache.status}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={() => handleAction('cache', 'clear')} disabled={isPerformingAction}>
            Clear Cache
          </Button>
          <Button onClick={() => handleAction('cache', 'optimize')} disabled={isPerformingAction}>
            Optimize Cache
          </Button>
          <Button onClick={() => handleAction('cache', 'config_clear')} disabled={isPerformingAction} variant="outline">
            Clear Config
          </Button>
          <Button onClick={() => handleAction('cache', 'route_clear')} disabled={isPerformingAction} variant="outline">
            Clear Routes
          </Button>
        </div>
      </Card>

      {/* Maintenance Mode */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Maintenance Mode</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={() => handleAction('maintenance', 'enable')} disabled={isPerformingAction} variant="destructive">
            Enable Maintenance
          </Button>
          <Button onClick={() => handleAction('maintenance', 'disable')} disabled={isPerformingAction}>
            Disable Maintenance
          </Button>
        </div>
      </Card>

      {/* Storage Management */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Storage Management</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={() => handleAction('storage', 'link')} disabled={isPerformingAction}>
            Create Storage Link
          </Button>
          <Button onClick={() => handleAction('storage', 'clear_uploads')} disabled={isPerformingAction} variant="outline">
            Clear Uploads
          </Button>
          <Button onClick={() => handleAction('storage', 'clear_logs')} disabled={isPerformingAction} variant="outline">
            Clear Logs
          </Button>
          <Button onClick={() => handleAction('storage', 'clear_cache')} disabled={isPerformingAction} variant="outline">
            Clear Storage Cache
          </Button>
        </div>
      </Card>

      {/* Queue Management */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Queue Management</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={() => handleAction('queue', 'restart')} disabled={isPerformingAction}>
            Restart Queue
          </Button>
          <Button onClick={() => handleAction('queue', 'retry_all')} disabled={isPerformingAction} variant="outline">
            Retry All Failed
          </Button>
          <Button onClick={() => handleAction('queue', 'clear_failed')} disabled={isPerformingAction} variant="destructive">
            Clear Failed Jobs
          </Button>
        </div>
      </Card>

      {/* System Logs */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">System Logs</h3>
        <div className="mb-4">
          <select 
            onChange={(e) => fetchLogs(e.target.value)} 
            className="rounded border border-gray-300 px-3 py-2"
          >
            <option value="laravel">Laravel Logs</option>
            <option value="php">PHP Error Logs</option>
            <option value="nginx">Nginx Logs</option>
          </select>
        </div>
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))
          ) : (
            <div className="text-gray-500">No logs available</div>
          )}
        </div>
      </Card>
    </div>
  );
};

System.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;

export default System;
