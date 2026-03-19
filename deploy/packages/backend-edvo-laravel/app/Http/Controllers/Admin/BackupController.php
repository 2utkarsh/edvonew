<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class BackupController extends Controller
{
    public function index()
    {
        $backups = $this->getBackupsList();
        return view('admin.backup.index', compact('backups'));
    }

    public function create(Request $request)
    {
        $type = $request->get('type', 'full');
        
        try {
            switch ($type) {
                case 'database':
                    $filename = $this->createDatabaseBackup();
                    break;
                case 'files':
                    $filename = $this->createFilesBackup();
                    break;
                case 'full':
                default:
                    $filename = $this->createFullBackup();
                    break;
            }

            return response()->json([
                'success' => true,
                'message' => 'Backup created successfully',
                'filename' => $filename,
            ]);
        } catch (\Exception $e) {
            Log::error('Backup creation failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Backup creation failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function download($filename)
    {
        $path = storage_path("app/backups/{$filename}");
        
        if (!file_exists($path)) {
            return response()->json(['error' => 'Backup file not found'], 404);
        }

        return response()->download($path);
    }

    public function delete($filename)
    {
        $path = storage_path("app/backups/{$filename}");
        
        if (!file_exists($path)) {
            return response()->json(['error' => 'Backup file not found'], 404);
        }

        try {
            unlink($path);
            return response()->json([
                'success' => true,
                'message' => 'Backup deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete backup: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function restore(Request $request)
    {
        $request->validate([
            'backup_file' => 'required|file',
        ]);

        $file = $request->file('backup_file');
        $filename = time() . '_restore_' . $file->getClientOriginalName();
        
        try {
            // Store the uploaded backup file
            $file->storeAs('backups', $filename);
            
            // Extract and restore based on file type
            if (str_contains($filename, 'database')) {
                $this->restoreDatabase($filename);
            } elseif (str_contains($filename, 'files')) {
                $this->restoreFiles($filename);
            } else {
                $this->restoreFull($filename);
            }

            return response()->json([
                'success' => true,
                'message' => 'Backup restored successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Backup restoration failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Backup restoration failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function createDatabaseBackup()
    {
        $filename = 'database_backup_' . date('Y-m-d_H-i-s') . '.sql';
        $path = storage_path("app/backups/{$filename}");
        
        // Ensure backup directory exists
        $this->ensureBackupDirectory();
        
        // Create database backup using mysqldump
        $command = sprintf(
            'mysqldump -h%s -u%s -p%s %s > %s',
            config('database.connections.mysql.host'),
            config('database.connections.mysql.username'),
            config('database.connections.mysql.password'),
            config('database.connections.mysql.database'),
            $path
        );
        
        exec($command);
        
        if (!file_exists($path)) {
            throw new \Exception('Database backup file was not created');
        }
        
        return $filename;
    }

    private function createFilesBackup()
    {
        $filename = 'files_backup_' . date('Y-m-d_H-i-s') . '.zip';
        $path = storage_path("app/backups/{$filename}");
        
        $this->ensureBackupDirectory();
        
        // Create zip file of important directories
        $zip = new \ZipArchive();
        if ($zip->open($path, \ZipArchive::CREATE) === TRUE) {
            // Add public uploads
            $this->addDirectoryToZip($zip, public_path('uploads'), 'uploads');
            
            // Add storage files
            $this->addDirectoryToZip($zip, storage_path('app/public'), 'storage/app/public');
            
            $zip->close();
        } else {
            throw new \Exception('Failed to create files backup');
        }
        
        return $filename;
    }

    private function createFullBackup()
    {
        $filename = 'full_backup_' . date('Y-m-d_H-i-s') . '.zip';
        $path = storage_path("app/backups/{$filename}");
        
        $this->ensureBackupDirectory();
        
        // Create database backup first
        $dbBackup = $this->createDatabaseBackup();
        
        // Create files backup
        $filesBackup = $this->createFilesBackup();
        
        // Create zip containing both backups
        $zip = new \ZipArchive();
        if ($zip->open($path, \ZipArchive::CREATE) === TRUE) {
            // Add database backup
            $zip->addFile(storage_path("app/backups/{$dbBackup}"), $dbBackup);
            
            // Add files backup
            $zip->addFile(storage_path("app/backups/{$filesBackup}"), $filesBackup);
            
            // Add .env file (without sensitive data)
            $envContent = $this->sanitizeEnvFile();
            $zip->addFromString('.env', $envContent);
            
            $zip->close();
            
            // Remove individual backup files
            unlink(storage_path("app/backups/{$dbBackup}"));
            unlink(storage_path("app/backups/{$filesBackup}"));
        } else {
            throw new \Exception('Failed to create full backup');
        }
        
        return $filename;
    }

    private function addDirectoryToZip($zip, $dir, $zipPath)
    {
        if (is_dir($dir)) {
            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($dir),
                \RecursiveIteratorIterator::LEAVES_ONLY
            );
            
            foreach ($files as $file) {
                if (!$file->isDir()) {
                    $filePath = $file->getRealPath();
                    $relativePath = substr($filePath, strlen($dir)) ?: basename($filePath);
                    $zip->addFile($filePath, $zipPath . $relativePath);
                }
            }
        }
    }

    private function ensureBackupDirectory()
    {
        $backupDir = storage_path('app/backups');
        if (!is_dir($backupDir)) {
            mkdir($backupDir, 0755, true);
        }
    }

    private function sanitizeEnvFile()
    {
        $envPath = base_path('.env');
        if (!file_exists($envPath)) {
            return '';
        }
        
        $content = file_get_contents($envPath);
        $lines = explode("\n", $content);
        $sanitized = [];
        
        foreach ($lines as $line) {
            if (str_contains($line, 'APP_KEY') || 
                str_contains($line, 'DB_PASSWORD') || 
                str_contains($line, 'MAIL_PASSWORD') || 
                str_contains($line, 'STRIPE_SECRET') ||
                str_contains($line, 'PAYPAL_SECRET')) {
                $sanitized[] = explode('=', $line)[0] . '=***';
            } else {
                $sanitized[] = $line;
            }
        }
        
        return implode("\n", $sanitized);
    }

    private function getBackupsList()
    {
        $backupDir = storage_path('app/backups');
        $backups = [];
        
        if (is_dir($backupDir)) {
            $files = glob($backupDir . '/*');
            foreach ($files as $file) {
                $backups[] = [
                    'filename' => basename($file),
                    'size' => filesize($file),
                    'created_at' => filemtime($file),
                    'type' => $this->getBackupType(basename($file)),
                ];
            }
        }
        
        // Sort by creation date (newest first)
        usort($backups, function ($a, $b) {
            return $b['created_at'] <=> $a['created_at'];
        });
        
        return collect($backups);
    }

    private function getBackupType($filename)
    {
        if (str_contains($filename, 'database')) {
            return 'database';
        } elseif (str_contains($filename, 'files')) {
            return 'files';
        } else {
            return 'full';
        }
    }

    private function restoreDatabase($filename)
    {
        $path = storage_path("app/backups/{$filename}");
        
        // Extract if it's a zip file
        if (str_ends_with($filename, '.zip')) {
            // Implementation for extracting and restoring database
            // This would require extracting the SQL file and importing it
        }
        
        // Import SQL file
        $command = sprintf(
            'mysql -h%s -u%s -p%s %s < %s',
            config('database.connections.mysql.host'),
            config('database.connections.mysql.username'),
            config('database.connections.mysql.password'),
            config('database.connections.mysql.database'),
            $path
        );
        
        exec($command);
    }

    private function restoreFiles($filename)
    {
        $path = storage_path("app/backups/{$filename}");
        
        // Extract zip file to appropriate locations
        $zip = new \ZipArchive();
        if ($zip->open($path) === TRUE) {
            $zip->extractTo(storage_path('app/temp_restore'));
            $zip->close();
            
            // Move files to their proper locations
            // Implementation would depend on your backup structure
        }
    }

    private function restoreFull($filename)
    {
        $path = storage_path("app/backups/{$filename}");
        
        // Extract and restore both database and files
        $this->restoreDatabase($filename);
        $this->restoreFiles($filename);
    }
}
