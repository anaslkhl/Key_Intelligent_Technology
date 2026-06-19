<?php

namespace App\Http\Controllers;

use App\Models\ProductFamily;
use Illuminate\Http\JsonResponse;

class ProductFamilyController extends Controller
{
    public function index(): JsonResponse
    {
        $families = ProductFamily::query()
            ->select(['id', 'name', 'description', 'sort_order'])
            ->with([
                'products:id,family_id,model,name,image_url',
                'ticketCategories:id,family_id,name,description',
            ])
            ->orderBy('sort_order')
            ->get();

        return $this->success($families, 'Product families retrieved successfully.');
    }
}
