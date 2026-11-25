<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpKernel\Exception\HttpException;

class StrukController extends Controller
{
    public function show(Request $request, Order $order): \Illuminate\Contracts\View\View
    {
        $user = $request->user();

        if ($user->role !== 'admin' && $order->user_id !== $user->id) {
            abort(403);
        }

        $order->load(['items', 'payment', 'user']);

        return view('struk', ['order' => $order]);
    }
}