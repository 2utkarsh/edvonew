<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SystemController extends Controller
{
    public function dashboard()
    {
        $systemInfo = [
            'server' => $this->getServerInfo(),
            'laravel' => $this->getLaravelInfo(),
            'database' => $this->getDatabaseInfo(),
            'storage' => $this->getStorageInfo(),
            'cache' => $this->getCacheInfo(),
        ];

        return response()->json($systemInfo);
    }

    public function maintenance(Request $request)
    {
        $action = $request->get('action');
        
        try {
            switch ($action) {
                case 'enable':
                    Artisan::call('down', ['--message' => $request->get('message', 'System under maintenance')]);
                    break;
                case 'disable':
                    Artisan::call('up');
                    break;
                default:
                    return response()->json(['error' => 'Invalid action'], 400);
            }

            return response()->json([
                'success' => true,
                'message' => "Maintenance mode {$action}d successfully",
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle maintenance mode: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function cache(Request $request)
    {
        $action = $request->get('action');
        
        try {
            switch ($action) {
                case 'clear':
                    Artisan::call('cache:clear');
                    break;
                case 'config_clear':
                    Artisan::call('config:clear');
                    break;
                case 'route_clear':
                    Artisan::call('route:clear');
                    break;
                case 'view_clear':
                    Artisan::call('view:clear');
                    break;
                case 'optimize':
                    Artisan::call('optimize');
                    break;
                case 'optimize_clear':
                    Artisan::call('optimize:clear');
                    break;
                default:
                    return response()->json(['error' => 'Invalid action'], 400);
            }

            return response()->json([
                'success' => true,
                'message' => ucfirst(str_replace('_', ' ', $action)) . ' completed successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Cache operation failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function storage(Request $request)
    {
        $action = $request->get('action');
        
        try {
            switch ($action) {
                case 'link':
                    Artisan::call('storage:link');
                    break;
                case 'clear_uploads':
                    $this->clearUploads();
                    break;
                case 'clear_logs':
                    $this->clearLogs();
                    break;
                case 'clear_cache':
                    $this->clearStorageCache();
                    break;
                default:
                    return response()->json(['error' => 'Invalid action'], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Storage operation completed successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Storage operation failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function logs(Request $request)
    {
        $type = $request->get('type', 'laravel');
        $lines = $request->get('lines', 100);
        
        try {
            switch ($type) {
                case 'laravel':
                    $logFile = storage_path('logs/laravel.log');
                    break;
                case 'php':
                    $logFile = storage_path('logs/php_errors.log');
                    break;
                case 'nginx':
                    $logFile = '/var/log/nginx/error.log';
                    break;
                default:
                    return response()->json(['error' => 'Invalid log type'], 400);
            }

            if (!file_exists($logFile)) {
                return response()->json(['logs' => 'Log file not found']);
            }

            $logs = $this->tailFile($logFile, $lines);
            
            return response()->json([
                'logs' => $logs,
                'file' => basename($logFile),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to read logs: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function queue(Request $request)
    {
        $action = $request->get('action');
        
        try {
            switch ($action) {
                case 'restart':
                    Artisan::call('queue:restart');
                    break;
                case 'failed':
                    Artisan::call('queue:failed');
                    $output = Artisan::output();
                    break;
                case 'retry_all':
                    Artisan::call('queue:retry all');
                    break;
                case 'clear_failed':
                    Artisan::call('queue:flush');
                    break;
                default:
                    return response()->json(['error' => 'Invalid action'], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Queue operation completed successfully',
                'output' => $output ?? null,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Queue operation failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function getServerInfo()
    {
        return [
            'php_version' => PHP_VERSION,
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
            'server_os' => PHP_OS,
            'memory_limit' => ini_get('memory_limit'),
            'max_execution_time' => ini_get('max_execution_time'),
            'upload_max_filesize' => ini_get('upload_max_filesize'),
            'post_max_size' => ini_get('post_max_size'),
            'disk_free_space' => disk_free_space('/'),
            'disk_total_space' => disk_total_space('/'),
        ];
    }

    private function getLaravelInfo()
    {
        return [
            'version' => app()->version(),
            'environment' => config('app.env'),
            'debug_mode' => config('app.debug'),
            'timezone' => config('app.timezone'),
            'locale' => config('app.locale'),
            'cache_driver' => config('cache.default'),
            'session_driver' => config('session.driver'),
            'queue_driver' => config('queue.default'),
            'log_channel' => config('logging.default'),
        ];
    }

    private function getDatabaseInfo()
    {
        try {
            $connection = \DB::connection();
            $pdo = $connection->getPdo();
            
            return [
                'driver' => $connection->getDriverName(),
                'version' => $pdo->getAttribute(\PDO::ATTR_SERVER_VERSION),
                'database' => $connection->getDatabaseName(),
                'host' => $connection->getConfig('host'),
                'port' => $connection->getConfig('port'),
                'max_connections' => $pdo->getAttribute(\PDO::ATTR_MAX_CONNECTIONS),
            ];
        } catch (\Exception $e) {
            return ['error' => 'Database connection failed: ' . $e->getMessage()];
        }
    }

    private function getStorageInfo()
    {
        $storagePath = storage_path();
        $publicPath = public_path();
        
        return [
            'storage_path' => $storagePath,
            'storage_size' => $this->getDirectorySize($storagePath),
            'public_path' => $publicPath,
            'public_size' => $this->getDirectorySize($publicPath),
            'storage_link_exists' => is_link(public_path('storage')),
            'writable' => is_writable($storagePath),
        ];
    }

    private function getCacheInfo()
    {
        try {
            Cache::put('system_check', 'test', 60);
            $cacheTest = Cache::get('system_check');
            Cache::forget('system_check');
            
            return [
                'status' => $cacheTest === 'test' ? 'Working' : 'Not Working',
                'driver' => config('cache.default'),
                'redis_connected' => $this->checkRedisConnection(),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'Error',
                'error' => $e->getMessage(),
            ];
        }
    }

    private function checkRedisConnection()
    {
        try {
            if (config('cache.default') === 'redis') {
                $redis = Cache::driver('redis');
                $redis->ping();
                return true;
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    private function getDirectorySize($dir)
    {
        $size = 0;
        foreach (glob(rtrim($dir, '/') . '/*', GLOB_NOSORT) as $each) {
            $size += is_file($each) ? filesize($each) : $this->getDirectorySize($each);
        }
        return $size;
    }

    private function clearUploads()
    {
        $uploadPath = public_path('uploads');
        if (is_dir($uploadPath)) {
            $files = glob($uploadPath . '/*');
            foreach ($files as $file) {
                if (is_file($file)) {
                    unlink($file);
                }
            }
        }
    }

    private function clearLogs()
    {
        $logPath = storage_path('logs');
        if (is_dir($logPath)) {
            $files = glob($logPath . '/*.log');
            foreach ($files as $file) {
                if (is_file($file)) {
                    file_put_contents($file, ''); // Clear the file
                }
            }
        }
    }

    private function clearStorageCache()
    {
        $cachePath = storage_path('framework/cache');
        if (is_dir($cachePath)) {
            $files = glob($cachePath . '/*');
            foreach ($files as $file) {
                if (is_file($file)) {
                    unlink($file);
                }
            }
        }
    }

    private function tailFile($file, $lines)
    {
        $handle = fopen($file, "r");
        $linecounter = $lines;
        $pos = -2;
        $beginning = false;
        $text = [];

        while ($linecounter > 0) {
            $t = " ";
            while ($t != "\n") {
                if (fseek($handle, $pos, SEEK_END) == -1) {
                    $beginning = true;
                    break;
                }
                $t = fgetc($handle);
                $pos--;
            }
            $linecounter--;
            if ($beginning) {
                rewind($handle);
            }
            $text[$lines - $linecounter - 1] = fgets($handle);
            if ($beginning) break;
        }
        fclose($handle);
        return array_reverse($text);
    }
}
