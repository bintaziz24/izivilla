<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use Illuminate\Support\Facades\Event;
use App\Events\PropertyRequestCreated;
use App\Listeners\SendAdvertiserNotification;
use App\Listeners\SendClientConfirmationNotification;

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
        Event::listen(
            PropertyRequestCreated::class,
            SendAdvertiserNotification::class
        );

        Event::listen(
            PropertyRequestCreated::class,
            SendClientConfirmationNotification::class
        );
    }
}


