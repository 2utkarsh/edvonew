<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class OpsController
{
    public function migrate(Request $request)
    {
        $token = $request->query('token');
        $opsToken = env('OPS_TOKEN');

        if (empty($opsToken) || $token !== $opsToken) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        Artisan::call('migrate', ['--force' => true]);
        $output = Artisan::output();

        return response()->json(['success' => true, 'output' => $output], 200);
    }
}
