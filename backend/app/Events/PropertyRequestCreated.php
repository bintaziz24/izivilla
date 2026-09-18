<?php

namespace App\Events;

use App\Models\PropertyRequest;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PropertyRequestCreated
{
    use Dispatchable, SerializesModels;

    public $request;

    public function __construct(PropertyRequest $request)
    {
        $this->request = $request;
    }
}
