<?php

namespace App\Http\Controllers;

use App\Models\DocumentCategory;
use Illuminate\Http\JsonResponse;

class DocumentCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = DocumentCategory::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return $this->success($categories, 'Document categories retrieved successfully.');
    }
}
