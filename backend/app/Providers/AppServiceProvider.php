<?php

namespace App\Providers;

use App\Models\FeatureRequest;
use App\Models\ForumAnswer;
use App\Models\ForumQuestion;
use App\Models\Review;
use App\Policies\AnswerPolicy;
use App\Policies\AdminPolicy;
use App\Policies\FeatureRequestPolicy;
use App\Policies\QuestionPolicy;
use App\Policies\ReviewPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Review::class, ReviewPolicy::class);
        Gate::policy(FeatureRequest::class, FeatureRequestPolicy::class);
        Gate::policy(ForumQuestion::class, QuestionPolicy::class);
        Gate::policy(ForumAnswer::class, AnswerPolicy::class);
        Gate::define('viewAdminDashboard', [AdminPolicy::class, 'viewAdminDashboard']);
    }
}
