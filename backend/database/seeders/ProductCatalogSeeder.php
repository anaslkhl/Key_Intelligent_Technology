<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductFamily;
use App\Models\TicketCategory;
use Illuminate\Database\Seeder;

class ProductCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $families = [
            [
                'name' => 'AMR & Forklifts',
                'description' => 'Autonomous forklifts, tote-to-person picking, and sorting robots.',
                'sort_order' => 1,
                'products' => [
                    ['model' => 'F20MT', 'name' => 'F20MT Autonomous Forklift', 'specifications' => ['type' => 'autonomous_forklift']],
                    ['model' => 'M200C', 'name' => 'M200C Mobile Robot', 'specifications' => ['type' => 'mobile_robot']],
                    ['model' => 'Tote-to-Person', 'name' => 'Tote-to-Person Picking Robot', 'specifications' => ['type' => 'picking_robot']],
                    ['model' => 'Sorting Robot', 'name' => 'Autonomous Sorting Robot', 'specifications' => ['type' => 'sorting_robot']],
                ],
                'categories' => [
                    ['name' => 'Navigation', 'description' => 'Localization, routing, mapping, and obstacle avoidance issues.'],
                    ['name' => 'Battery', 'description' => 'Charging, runtime, battery health, and docking issues.'],
                    ['name' => 'Payload', 'description' => 'Fork, tote, lift, and load handling issues.'],
                    ['name' => 'Sensors', 'description' => 'LiDAR, camera, bumper, and safety sensor issues.'],
                    ['name' => 'Fleet Integration', 'description' => 'WMS, FMS, network, and multi-robot coordination issues.'],
                ],
            ],
            [
                'name' => 'Cleaning Robots',
                'description' => 'Autonomous floor scrubbers, sweepers, and cleaning robots.',
                'sort_order' => 2,
                'products' => [
                    ['model' => 'OMNIE', 'name' => 'OMNIE Cleaning Robot', 'specifications' => ['type' => 'cleaning_robot']],
                    ['model' => 'SC50', 'name' => 'SC50 Floor Scrubber', 'specifications' => ['type' => 'floor_scrubber']],
                    ['model' => 'SC75', 'name' => 'SC75 Floor Scrubber', 'specifications' => ['type' => 'floor_scrubber']],
                    ['model' => 'Gausium Beetle', 'name' => 'Gausium Beetle Sweeper', 'specifications' => ['type' => 'sweeper']],
                ],
                'categories' => [
                    ['name' => 'Brushes', 'description' => 'Brush wear, pressure, rotation, and replacement issues.'],
                    ['name' => 'Water Filtration', 'description' => 'Clean water, wastewater, filter, and tank issues.'],
                    ['name' => 'Battery', 'description' => 'Charging, runtime, and docking issues.'],
                    ['name' => 'Cleaning Quality', 'description' => 'Streaking, missed areas, suction, and detergent issues.'],
                    ['name' => 'Navigation', 'description' => 'Map, route, obstacle, and coverage issues.'],
                ],
            ],
            [
                'name' => 'AI Inspection',
                'description' => 'Drone-based infrastructure inspection, X-ray tyre inspection, and paint inspection.',
                'sort_order' => 3,
                'products' => [
                    ['model' => 'Drone Inspection', 'name' => 'Drone-Based Infrastructure Inspection', 'specifications' => ['type' => 'drone_inspection']],
                    ['model' => 'X-ray Tyre Inspection', 'name' => 'X-ray Tyre Inspection System', 'specifications' => ['type' => 'xray_inspection']],
                    ['model' => 'Paint Inspection', 'name' => 'AI Paint Inspection System', 'specifications' => ['type' => 'vision_inspection']],
                ],
                'categories' => [
                    ['name' => 'Image Quality', 'description' => 'Camera, lighting, X-ray, and visual capture issues.'],
                    ['name' => 'AI Detection', 'description' => 'False positives, missed defects, and model confidence issues.'],
                    ['name' => 'Flight Operations', 'description' => 'Drone path, mission, battery, and flight control issues.'],
                    ['name' => 'Reporting', 'description' => 'Inspection reports, exports, and defect classification issues.'],
                    ['name' => 'Integration', 'description' => 'Factory, infrastructure, and data integration issues.'],
                ],
            ],
            [
                'name' => 'Greeting Robots',
                'description' => 'Reception, marketing, and customer engagement robots.',
                'sort_order' => 4,
                'products' => [
                    ['model' => 'T10', 'name' => 'T10 Greeting Robot', 'specifications' => ['type' => 'greeting_robot']],
                    ['model' => 'T5', 'name' => 'T5 Greeting Robot', 'specifications' => ['type' => 'greeting_robot']],
                ],
                'categories' => [
                    ['name' => 'Speech Interaction', 'description' => 'Voice recognition, text-to-speech, and conversation issues.'],
                    ['name' => 'Display', 'description' => 'Screen, content, media, and touch interaction issues.'],
                    ['name' => 'Navigation', 'description' => 'Reception route, movement, and obstacle issues.'],
                    ['name' => 'Connectivity', 'description' => 'Wi-Fi, cloud service, and remote content issues.'],
                    ['name' => 'Content Management', 'description' => 'Marketing content, scripts, and language configuration issues.'],
                ],
            ],
            [
                'name' => 'Restaurant Robots',
                'description' => 'Food delivery robots and multi-robot restaurant collaboration.',
                'sort_order' => 5,
                'products' => [
                    ['model' => 'Food Delivery Robot', 'name' => 'Restaurant Food Delivery Robot', 'specifications' => ['type' => 'food_delivery']],
                    ['model' => 'Multi-Robot Collaboration', 'name' => 'Restaurant Multi-Robot Collaboration System', 'specifications' => ['type' => 'multi_robot_system']],
                ],
                'categories' => [
                    ['name' => 'Tray Delivery', 'description' => 'Tray loading, unloading, stability, and route delivery issues.'],
                    ['name' => 'Navigation', 'description' => 'Table routing, obstacle, map, and localization issues.'],
                    ['name' => 'Multi-Robot Coordination', 'description' => 'Traffic, scheduling, and collaboration issues.'],
                    ['name' => 'Battery', 'description' => 'Charging, runtime, and docking issues.'],
                    ['name' => 'User Interface', 'description' => 'Table selection, display, audio, and operator workflow issues.'],
                ],
            ],
            [
                'name' => 'Medical Transport',
                'description' => 'Secure transport robots for sensitive medical equipment.',
                'sort_order' => 6,
                'products' => [
                    ['model' => 'Secure Medical Transport', 'name' => 'Secure Medical Transport Robot', 'specifications' => ['type' => 'medical_transport']],
                    ['model' => 'Sensitive Equipment Transport', 'name' => 'Sensitive Medical Equipment Transport Robot', 'specifications' => ['type' => 'sensitive_equipment_transport']],
                ],
                'categories' => [
                    ['name' => 'Secure Access', 'description' => 'Authentication, lock, access control, and chain-of-custody issues.'],
                    ['name' => 'Temperature Control', 'description' => 'Temperature monitoring, alerts, and cold-chain issues.'],
                    ['name' => 'Navigation', 'description' => 'Hospital route, elevator, corridor, and obstacle issues.'],
                    ['name' => 'Battery', 'description' => 'Charging, runtime, and docking issues.'],
                    ['name' => 'Compliance Reporting', 'description' => 'Audit logs, reports, and traceability issues.'],
                ],
            ],
        ];

        foreach ($families as $familyData) {
            $family = ProductFamily::updateOrCreate(
                ['name' => $familyData['name']],
                [
                    'description' => $familyData['description'],
                    'sort_order' => $familyData['sort_order'],
                ],
            );

            foreach ($familyData['products'] as $productData) {
                Product::updateOrCreate(
                    [
                        'family_id' => $family->id,
                        'model' => $productData['model'],
                    ],
                    [
                        'name' => $productData['name'],
                        'specifications' => $productData['specifications'],
                        'image_url' => null,
                    ],
                );
            }

            foreach ($familyData['categories'] as $categoryData) {
                TicketCategory::updateOrCreate(
                    [
                        'family_id' => $family->id,
                        'name' => $categoryData['name'],
                    ],
                    [
                        'description' => $categoryData['description'],
                    ],
                );
            }
        }
    }
}
