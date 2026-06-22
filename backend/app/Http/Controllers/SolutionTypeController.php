<?php

namespace App\Http\Controllers;

use App\Models\SolutionType;
use Illuminate\Http\JsonResponse;

class SolutionTypeController extends Controller
{
    public function index(): JsonResponse
    {
        return $this->success(
            SolutionType::query()->orderBy('name')->get(),
            'Solution types retrieved successfully.',
        );
    }
}
