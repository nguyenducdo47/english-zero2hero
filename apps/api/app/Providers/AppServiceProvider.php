<?php

namespace App\Providers;

use App\Services\SettingsService;
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
        try {
            $this->app->make(SettingsService::class)->applyToConfig();
        } catch (\Throwable) {
            // DB/migrations chưa sẵn sàng (migrate, install)
        }
    }
}
