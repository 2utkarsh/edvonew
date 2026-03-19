import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DashboardLayout from '@/layouts/dashboard/layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { SharedData } from '@/types/global';

interface BackupProps extends SharedData {
  backups: Array<{
    filename: string;
    size: number;
    created_at: number;
    type: string;
  }>;
}

const Backup = ({ backups, translate }: BackupProps) => {
  const { frontend } = translate;
  const [isCreating, setIsCreating] = useState(false);
  const [selectedType, setSelectedType] = useState('full');

  const handleCreateBackup = async (type: string) => {
    setIsCreating(true);
    try {
      const response = await fetch('/dashboard/backup/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh the page to show the new backup
        window.location.reload();
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error creating backup:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownload = (filename: string) => {
    window.open(`/dashboard/backup/download/${filename}`, '_blank');
  };

  const handleDelete = async (filename: string) => {
    if (!confirm('Are you sure you want to delete this backup?')) {
      return;
    }

    try {
      const response = await fetch(`/dashboard/backup/delete/${filename}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      const data = await response.json();
      if (data.success) {
        // Refresh the page to remove the deleted backup
        window.location.reload();
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
    }
  };

  const handleRestore = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    try {
      const response = await fetch('/dashboard/backup/restore', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      const data = await response.json();
      if (data.success) {
        alert('Backup restored successfully! The page will refresh.');
        window.location.reload();
      } else {
        alert('Failed to restore backup: ' + data.message);
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      alert('Error restoring backup');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <Head title="Backup Management" />

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Backup Management</h1>
      </div>

      {/* Create Backup */}
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
          <div className="flex gap-2">
            <Button
              onClick={() => handleCreateBackup(selectedType)}
              disabled={isCreating}
              className="flex-1"
            >
              {isCreating ? 'Creating Backup...' : `Create ${selectedType} Backup`}
            </Button>
          </div>
        </div>
      </Card>

      {/* Restore Backup */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Restore Backup</h3>
        <form onSubmit={handleRestore} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Backup File</label>
            <input
              type="file"
              name="backup_file"
              accept=".zip,.sql"
              className="w-full rounded border border-gray-300 px-3 py-2"
              required
            />
          </div>
          <Button type="submit" variant="outline" className="w-full">
            Restore Backup
          </Button>
        </form>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Warning:</strong> Restoring a backup will overwrite current data. This action cannot be undone.
          </p>
        </div>
      </Card>

      {/* Existing Backups */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Existing Backups</h3>
        {backups.length > 0 ? (
          <div className="space-y-4">
            {backups.map((backup) => (
              <div key={backup.filename} className="flex items-center justify-between p-4 border border-gray-200 rounded">
                <div className="flex-1">
                  <div className="font-medium">{backup.filename}</div>
                  <div className="text-sm text-gray-600">
                    Size: {formatFileSize(backup.size)} | 
                    Created: {formatDate(backup.created_at)} | 
                    Type: {backup.type}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDownload(backup.filename)}
                    variant="outline"
                    size="sm"
                  >
                    Download
                  </Button>
                  <Button
                    onClick={() => handleDelete(backup.filename)}
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No backups found. Create your first backup above.</p>
          </div>
        )}
      </Card>

      {/* Backup Information */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Backup Information</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Full Backup:</strong> Includes database, uploaded files, and configuration files.</p>
          <p><strong>Database Backup:</strong> Includes only the MySQL database.</p>
          <p><strong>Files Backup:</strong> Includes uploaded files and storage directory.</p>
          <p><strong>Storage Location:</strong> Backups are stored in <code>storage/app/backups</code> directory.</p>
          <p><strong>Recommended:</strong> Create regular backups and download them for safe storage.</p>
        </div>
      </Card>
    </div>
  );
};

Backup.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;

export default Backup;
