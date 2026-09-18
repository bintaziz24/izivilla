<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $query = Notification::query();

        if ($request->filled('recipient_email')) {
            $query->where('recipient_email', $request->recipient_email);
        }

        $notifications = $query->latest()->get();
        $unreadCount = (clone $query)->where('is_read', false)->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markAsRead($id)
    {
        $notification = Notification::findOrFail($id);
        $notification->is_read = true;
        $notification->read_at = now();
        $notification->save();

        return response()->json([
            'message' => 'Notification marquée comme lue',
            'notification' => $notification,
        ]);
    }

    public function markAllAsRead(Request $request)
    {
        $query = Notification::where('is_read', false);

        if ($request->filled('recipient_email')) {
            $query->where('recipient_email', $request->recipient_email);
        }

        $query->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json([
            'message' => 'Toutes les notifications ont été marquées comme lues.',
        ]);
    }
}
