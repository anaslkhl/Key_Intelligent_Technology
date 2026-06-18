<?php

namespace App\Http\Controllers;

use App\Models\Robot;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RobotController extends Controller
{
    public function index(Request $request)
    {
        $robots = Robot::with(['product', 'user'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(15);

        return response()->json($robots);
    }

    public function store(Request $request)
    {
        if (!$request->user()) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }
        $validated = $request->validate([
            'product_id' => ['required', 'string', 'exists:products,id'],
            'serial_number' => ['required', 'string', 'unique:robots,serial_number'],
            'name' => ['nullable', 'string', 'max:255'],
            'purchase_date' => ['nullable', 'date'],
            'warranty_end' => ['nullable', 'date', 'after:purchase_date'],
        ]);

        $robot = Robot::create([
            'user_id' => $request->user()->id,
            'product_id' => $validated['product_id'],
            'serial_number' => $validated['serial_number'],
            'name' => $validated['name'] ?? null,
            'purchase_date' => $validated['purchase_date'] ?? null,
            'warranty_end' => $validated['warranty_end'] ?? null,
            'status' => 'active',
        ]);

        return response()->json($robot, 201);
    }

    public function show(Request $request, $id)
    {
        $robot = Robot::with(['product', 'user'])->findOrFail($id);

        if ($robot->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($robot);
    }
}



