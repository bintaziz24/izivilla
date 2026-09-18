<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\Boost;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PropertyController extends Controller
{
    public function index(Request $request)
    {
        $query = Property::with(['agency', 'images']);

        // Exclude expired listings for public queries
        if (!filter_var($request->get('include_expired', false), FILTER_VALIDATE_BOOLEAN)) {
            $query->where(function ($q) {
                $q->where('status', '!=', 'expired')
                  ->where(function ($sub) {
                      $sub->whereNull('expires_at')
                          ->orWhere('expires_at', '>', Carbon::now());
                  });
            });
        }

        // Search filters
        if ($request->filled('transaction_type')) {
            $query->where('transaction_type', $request->transaction_type);
        }

        if ($request->filled('city')) {
            $query->where('city', 'LIKE', '%' . $request->city . '%');
        }

        if ($request->filled('quartier') && $request->quartier !== 'Tous les quartiers') {
            $query->where('quartier', 'LIKE', '%' . $request->quartier . '%');
        }

        if ($request->filled('property_type') && $request->property_type !== 'Tous les types') {
            $query->where('property_type', 'LIKE', '%' . $request->property_type . '%');
        }

        if ($request->filled('advertiser_type') && $request->advertiser_type !== 'all') {
            $target = $request->advertiser_type === 'owner' ? 'Propriétaire' : 'Agence';
            $query->where('owner_type', 'LIKE', '%' . $target . '%');
        }

        if ($request->filled('verified_only') && filter_var($request->verified_only, FILTER_VALIDATE_BOOLEAN)) {
            $query->where('is_verified', true);
        }

        if ($request->filled('max_price')) {
            $query->where('price_fcfa', '<=', (int)$request->max_price);
        }

        if ($request->filled('min_price')) {
            $query->where('price_fcfa', '>=', (int)$request->min_price);
        }

        if ($request->filled('bedrooms')) {
            $query->where('bedrooms', '>=', (int)$request->bedrooms);
        }

        if ($request->filled('is_furnished') && filter_var($request->is_furnished, FILTER_VALIDATE_BOOLEAN)) {
            $query->where('is_furnished', true);
        }


        // Sorting
        $sortBy = $request->get('sort', 'featured');
        if ($sortBy === 'price_asc') {
            $query->orderBy('price_fcfa', 'asc');
        } elseif ($sortBy === 'price_desc') {
            $query->orderBy('price_fcfa', 'desc');
        } elseif ($sortBy === 'recent') {
            $query->orderBy('created_at', 'desc');
        } else {
            // Default: boosted and featured first
            $query->orderBy('is_boosted', 'desc')
                  ->orderBy('is_featured', 'desc')
                  ->orderBy('created_at', 'desc');
        }

        $properties = $query->paginate($request->get('per_page', 12));

        return response()->json($properties);
    }

    public function show($id)
    {
        $property = Property::with(['agency', 'images', 'appointments'])->findOrFail($id);
        
        // Increment view count
        $property->increment('views_count');

        return response()->json($property);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'property_type' => 'required|string',
            'price_fcfa' => 'required|numeric|min:0',
            'city' => 'required|string',
            'quartier' => 'required|string',
            'bedrooms' => 'nullable|integer',
            'bathrooms' => 'nullable|integer',
            'surface_sqm' => 'nullable|integer',
            'is_furnished' => 'nullable|boolean',
            'has_air_con' => 'nullable|boolean',
            'has_generator' => 'nullable|boolean',
            'has_security' => 'nullable|boolean',
            'has_parking' => 'nullable|boolean',
            'has_pool' => 'nullable|boolean',
            'agency_profile_id' => 'nullable|exists:agency_profiles,id',
            'images' => 'nullable|array',
            'images.*' => 'string'
        ]);

        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(5);
        $validated['contact_phone'] = $request->get('contact_phone', '+221 77 000 00 00');
        $validated['contact_whatsapp'] = $request->get('contact_whatsapp', '+221 77 000 00 00');
        $validated['expires_at'] = Carbon::now()->addDays(60);
        $validated['last_confirmed_at'] = Carbon::now();

        // Lat/Lng presets by quartier for Dakar / Senegal map markers
        $coords = $this->getCoordinates($validated['city'], $validated['quartier']);
        $validated['latitude'] = $coords['lat'];
        $validated['longitude'] = $coords['lng'];

        $property = Property::create($validated);

        // Save image URLs
        if (!empty($validated['images'])) {
            foreach ($validated['images'] as $index => $imageUrl) {
                PropertyImage::create([
                    'property_id' => $property->id,
                    'image_url' => $imageUrl,
                    'is_primary' => $index === 0,
                ]);
            }
        } else {
            // Default placeholder luxury real estate image
            PropertyImage::create([
                'property_id' => $property->id,
                'image_url' => 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
                'is_primary' => true,
            ]);
        }

        // Trigger automated matching alert notifications (Étape I - Priorité 13)
        $matchingAlerts = \App\Models\PropertyAlert::where('is_active', true)->get();
        foreach ($matchingAlerts as $alert) {
            $cityMatch = empty($alert->city) || strcasecmp($alert->city, $property->city) === 0;
            $typeMatch = empty($alert->property_type) || strcasecmp($alert->property_type, $property->property_type) === 0;
            $priceMatch = empty($alert->max_price) || $property->price_fcfa <= $alert->max_price;
            $bedroomMatch = empty($alert->bedrooms) || ($property->bedrooms ?? 0) >= $alert->bedrooms;
            $transactionMatch = empty($alert->transaction_type) || strcasecmp($alert->transaction_type, $property->transaction_type) === 0;

            if ($cityMatch && $typeMatch && $priceMatch && $bedroomMatch && $transactionMatch) {
                \App\Models\Notification::create([
                    'recipient_email' => $alert->user_email,
                    'title' => '🔔 Nouveau bien correspondant à votre recherche',
                    'message' => "Un nouveau bien correspondant à vos critères vient d'être publié sur Izivilla !\n\n{$property->title}\n📍 {$property->city} ({$property->quartier})\nPrix : " . number_format($property->price_fcfa) . " FCFA",
                    'type' => 'SEARCH_ALERT',
                    'link' => '/annonces/' . $property->id,
                    'is_read' => false,
                    'data' => [
                        'property_id' => $property->id,
                        'alert_id' => $alert->id,
                    ],
                ]);
            }
        }

        return response()->json([
            'message' => 'Annonce créée avec succès sur Izivilla !',
            'property' => $property->load(['agency', 'images']),
        ], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:available,rented,sold,paused,expired'
        ]);

        $property = Property::findOrFail($id);
        $property->status = $validated['status'];
        $property->save();

        $statusLabels = [
            'available' => 'Disponible',
            'rented' => 'Loué',
            'sold' => 'Vendu',
            'paused' => 'En pause / Indisponible',
            'expired' => 'Expirée',
        ];

        return response()->json([
            'message' => 'Le statut du bien a été mis à jour : ' . ($statusLabels[$property->status] ?? $property->status),
            'property' => $property
        ]);
    }

    public function renew($id)
    {
        $property = Property::findOrFail($id);
        $property->expires_at = Carbon::now()->addDays(60);
        $property->last_confirmed_at = Carbon::now();
        $property->status = 'available';
        $property->is_expiration_warning_sent = false;
        $property->is_inactivity_warning_sent = false;
        $property->save();

        return response()->json([
            'message' => 'Annonce renouvelée avec succès pour 60 jours supplémentaires !',
            'property' => $property
        ]);
    }

    public function confirmAvailability($id)
    {
        $property = Property::findOrFail($id);
        $property->last_confirmed_at = Carbon::now();
        $property->is_inactivity_warning_sent = false;
        if ($property->status === 'expired') {
            $property->status = 'available';
        }
        $property->save();

        return response()->json([
            'message' => 'Disponibilité confirmée avec succès !',
            'property' => $property
        ]);
    }

    public function checkExpirations()
    {
        \Illuminate\Support\Facades\Artisan::call('izivilla:check-property-expiration');

        return response()->json([
            'message' => 'Contrôle automatisé des expirations et des relances d\'inactivité (30j) exécuté avec succès.',
            'output' => \Illuminate\Support\Facades\Artisan::output()
        ]);
    }

    public function stats()
    {
        return response()->json([
            'total_listings' => Property::count(),
            'active_agencies' => \App\Models\AgencyProfile::count(),
            'boosted_listings' => Property::where('is_boosted', true)->count(),
            'total_views' => Property::sum('views_count'),
            'city_breakdown' => [
                'Dakar' => Property::where('city', 'Dakar')->count(),
                'Saly' => Property::where('city', 'Saly')->count(),
                'Thiès' => Property::where('city', 'Thiès')->count(),
                'Rufisque' => Property::where('city', 'Rufisque')->count(),
            ]
        ]);
    }

    private function getCoordinates($city, $quartier)
    {
        // Coordinates mapping for Senegalese neighborhoods
        $map = [
            'Almadies' => ['lat' => 14.7454, 'lng' => -17.5194],
            'Mermoz' => ['lat' => 14.7081, 'lng' => -17.4697],
            'Plateau' => ['lat' => 14.6685, 'lng' => -17.4357],
            'VDN' => ['lat' => 14.7230, 'lng' => -17.4620],
            'Ngor' => ['lat' => 14.7550, 'lng' => -17.5140],
            'Ouakam' => ['lat' => 14.7250, 'lng' => -17.4850],
            'Fann' => ['lat' => 14.6850, 'lng' => -17.4620],
            'Saly' => ['lat' => 14.4447, 'lng' => -17.0094],
            'Thiès' => ['lat' => 14.7833, 'lng' => -16.9333],
            'Rufisque' => ['lat' => 14.7167, 'lng' => -17.2667],
        ];

        foreach ($map as $key => $pos) {
            if (stripos($quartier, $key) !== false || stripos($city, $key) !== false) {
                return $pos;
            }
        }

        return ['lat' => 14.7167, 'lng' => -17.4677]; // Dakar central default
    }
}
