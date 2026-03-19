<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactMessageRequest;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ContactMessageController extends Controller
{
    public function store(StoreContactMessageRequest $request): Response|RedirectResponse
    {
        $data = $request->validated();

        ContactMessage::create([
            ...$data,
            'ip' => $request->ip(),
            'user_agent' => (string) $request->userAgent(),
        ]);

        if ($request->expectsJson()) {
            return response(['message' => 'Message saved'], 201);
        }

        return back()->with('success', 'Message sent successfully');
    }
}

