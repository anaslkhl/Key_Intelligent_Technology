<?php

namespace App\Http\Controllers;

use App\Http\Resources\RobotResource;
use App\Models\Robot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RobotController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $robots = Robot::query()
            ->with(['product.family:id,name'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate($this->perPage());

        return $this->paginated($robots, RobotResource::class, 'Robots retrieved successfully.');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'uuid', 'exists:products,id'],
            'serial_number' => ['required', 'string', 'max:255', 'unique:robots,serial_number'],
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

        $robot->load('product.family:id,name');

        return $this->success(new RobotResource($robot), 'Robot registered successfully.', 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $robot = Robot::query()
            ->with('product.family:id,name')
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return $this->success(new RobotResource($robot), 'Robot retrieved successfully.');
    }
}


