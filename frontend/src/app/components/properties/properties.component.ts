import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { CountryService } from '../../services/country.service';
import { Property, PropertyFilter } from '../../models/property.model';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="bg-slate-100 min-h-screen py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header & Breadcrumb -->
        <div class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 text-xs font-black uppercase text-orange-600 tracking-wider">
              <i class="fa-solid fa-house-chimney"></i> IZIVILLA DAKAR & SÉNÉGAL
            </div>
            <h1 class="text-3xl font-black text-slate-900 tracking-tight">Biens Immobiliers Disponibles</h1>
            <p class="text-slate-500 text-xs font-extrabold mt-0.5">{{ filteredProperties.length }} biens trouvés · Contact direct avec les annonceurs</p>
          </div>

          <!-- View Switchers & Sorting -->
          <div class="flex items-center gap-3">
            
            <div class="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex items-center gap-1 text-xs font-black">
              <button (click)="viewMode = 'grid'" [class.bg-slate-950]="viewMode === 'grid'" [class.text-white]="viewMode === 'grid'" class="px-3 py-1.5 rounded-lg transition-colors text-slate-600">
                <i class="fa-solid fa-grid-2 mr-1"></i> Grille
              </button>
              <button (click)="viewMode = 'list'" [class.bg-slate-950]="viewMode === 'list'" [class.text-white]="viewMode === 'list'" class="px-3 py-1.5 rounded-lg transition-colors text-slate-600">
                <i class="fa-solid fa-list mr-1"></i> Liste
              </button>
            </div>

            <div class="bg-white rounded-xl border border-slate-200 shadow-sm px-3 py-1.5 text-xs font-extrabold">
              <select [(ngModel)]="filter.sort" (change)="applyFilters()" class="bg-transparent focus:outline-none text-slate-800 cursor-pointer">
                <option value="featured">Trier par pertinence</option>
                <option value="recent">Plus récent</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
              </select>
            </div>

          </div>
        </div>

        <!-- Main Search Layout (Sidebar Filters + Results Area) -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <!-- SIDEBAR FILTRES (Prompt Section 11 Specification) -->
          <div class="lg:col-span-1">
            <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-md sticky top-28 space-y-5">
              
              <div class="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 class="font-black text-slate-900 text-sm flex items-center gap-2">
                  <i class="fa-solid fa-sliders text-orange-500"></i> Filtres de Recherche
                </h3>
                <button (click)="resetFilters()" class="text-[11px] text-orange-600 font-extrabold hover:underline">Réinitialiser</button>
              </div>

              <!-- 1. Vente / Location -->
              <div>
                <label class="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Transaction</label>
                <div class="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button (click)="filter.transaction_type = ''; applyFilters()" [class.bg-white]="!filter.transaction_type" [class.shadow-sm]="!filter.transaction_type" class="py-1.5 rounded-lg text-slate-700">Tous</button>
                  <button (click)="filter.transaction_type = 'sale'; applyFilters()" [class.bg-white]="filter.transaction_type === 'sale'" [class.shadow-sm]="filter.transaction_type === 'sale'" class="py-1.5 rounded-lg text-slate-700">Vente</button>
                  <button (click)="filter.transaction_type = 'rent'; applyFilters()" [class.bg-white]="filter.transaction_type === 'rent'" [class.shadow-sm]="filter.transaction_type === 'rent'" class="py-1.5 rounded-lg text-slate-700">Location</button>
                </div>
              </div>

              <!-- 2. Type de bien (Prompt Section 4) -->
              <div>
                <label class="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Type de bien</label>
                <select [(ngModel)]="filter.property_type" (change)="applyFilters()" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-800">
                  <option value="">Tous les types</option>
                  <option value="Maison">Maison</option>
                  <option value="Appartement">Appartement</option>
                  <option value="Villa">Villa</option>
                  <option value="Terrain">Terrain</option>
                  <option value="Studio">Studio</option>
                  <option value="Chambre">Chambre</option>
                  <option value="Immeuble">Immeuble</option>
                  <option value="Local commercial">Local commercial</option>
                  <option value="Bureau">Bureau</option>
                  <option value="Boutique">Boutique</option>
                  <option value="Entrepôt">Entrepôt</option>
                </select>
              </div>

              <!-- 3. Ville & Quartier -->
              <div>
                <label class="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Ville / Région</label>
                <select [(ngModel)]="filter.city" (change)="applyFilters()" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-800 mb-2">
                  <option value="">Toutes les villes</option>
                  <option value="Dakar">Dakar</option>
                  <option value="Saly">Saly / Mbour</option>
                  <option value="Thiès">Thiès</option>
                  <option value="Saint-Louis">Saint-Louis</option>
                </select>

                <input type="text" [(ngModel)]="filter.quartier" (keyup.enter)="applyFilters()" placeholder="Rechercher par quartier (ex: Almadies)" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
              </div>

              <!-- 4. Budget Min & Max -->
              <div>
                <div class="flex justify-between items-center mb-1">
                  <label class="text-[11px] font-black uppercase text-slate-400 tracking-wider">Prix Max</label>
                  <span class="text-xs font-black text-orange-600">{{ filter.max_price | number }} {{ countryService.currentCountry.currency }}</span>
                </div>
                <input type="range" min="100000" max="500000000" step="500000" [(ngModel)]="filter.max_price" (change)="applyFilters()" class="w-full accent-orange-600 cursor-pointer">
              </div>

              <!-- 5. Propriétaire vs Agence (Section 11) -->
              <div>
                <label class="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Annonceur</label>
                <select [(ngModel)]="filter.advertiser_type" (change)="applyFilters()" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-800">
                  <option value="all">Tous (Propriétaires & Agences)</option>
                  <option value="owner">Propriétaires uniquement</option>
                  <option value="agency">Agences uniquement</option>
                </select>
              </div>

              <!-- 6. Vérifié Uniquement (Section 11) -->
              <div class="pt-2 border-t border-slate-100">
                <label class="flex items-center gap-2 cursor-pointer text-xs font-black text-slate-800">
                  <input type="checkbox" [(ngModel)]="filter.verified_only" (change)="applyFilters()" class="w-4 h-4 accent-emerald-600 rounded">
                  <span class="flex items-center gap-1 text-emerald-700">
                    <i class="fa-solid fa-shield-check"></i> Annonceurs vérifiés uniquement
                  </span>
                </label>
              </div>

              <!-- 7. Options meublé -->
              <div>
                <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input type="checkbox" [(ngModel)]="filter.is_furnished" (change)="applyFilters()" class="w-4 h-4 accent-orange-600 rounded">
                  <span>Logement meublé uniquement</span>
                </label>
              </div>

            </div>
          </div>


          <!-- RESULTS ZONE (Prompt Section 11) -->
          <div class="lg:col-span-3">
            
            <!-- Empty state -->
            <div *ngIf="filteredProperties.length === 0" class="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
              <div class="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                <i class="fa-solid fa-house-circle-xmark"></i>
              </div>
              <h3 class="text-xl font-extrabold text-slate-900">Aucun bien ne correspond à ces critères</h3>
              <p class="text-slate-500 text-xs font-medium">Essayez d'élargir le budget ou de réinitialiser certains filtres.</p>
              <button (click)="resetFilters()" class="bg-slate-950 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow">Réinitialiser tous les filtres</button>
            </div>

            <!-- GRID DISPLAY MODE -->
            <div *ngIf="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div *ngFor="let prop of filteredProperties" class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group">
                
                <div class="relative h-56 bg-slate-950 overflow-hidden">
                  <img [src]="getPrimaryImage(prop)" [alt]="prop.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                  
                  <div class="absolute top-3 left-3 flex gap-2">
                    <span [class.bg-emerald-600]="prop.transaction_type === 'sale'" [class.bg-orange-600]="prop.transaction_type === 'rent'" class="text-white text-[10px] font-black px-2.5 py-0.5 rounded-lg shadow uppercase">
                      {{ prop.transaction_type === 'sale' ? 'Vente' : 'Location' }}
                    </span>
                    <span *ngIf="prop.is_furnished" class="bg-slate-950/80 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg">Meublé</span>
                  </div>

                  <button (click)="toggleFav(prop.id)" class="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 text-slate-700 hover:text-orange-600 flex items-center justify-center shadow">
                    <i [class.fa-solid]="isFav(prop.id)" [class.fa-regular]="!isFav(prop.id)" [class.text-orange-600]="isFav(prop.id)" class="fa-heart text-base"></i>
                  </button>
                </div>

                <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div class="flex justify-between items-baseline">
                      <span class="text-xl font-black text-orange-600">{{ prop.price_fcfa | number }} <span class="text-xs font-bold text-slate-500">{{ countryService.currentCountry.currency }}</span></span>
                      <span class="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{{ prop.property_type }}</span>
                    </div>

                    <h3 class="font-extrabold text-slate-900 text-base mt-1 line-clamp-1 group-hover:text-orange-600 transition-colors">
                      {{ prop.title }}
                    </h3>

                    <p class="text-slate-500 text-xs font-semibold mt-1">
                      <i class="fa-solid fa-location-dot text-orange-500 mr-1"></i> {{ prop.quartier }}, {{ prop.city }}
                    </p>
                  </div>

                  <div class="pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-extrabold text-slate-600">
                    <span><i class="fa-solid fa-bed text-orange-500 mr-1"></i> {{ prop.bedrooms }} Ch.</span>
                    <span><i class="fa-solid fa-bath text-orange-500 mr-1"></i> {{ prop.bathrooms }} SdB</span>
                    <span><i class="fa-solid fa-ruler-combined text-orange-500 mr-1"></i> {{ prop.surface_sqm }} m²</span>
                  </div>

                  <!-- Direct Advertiser Card Footer -->
                  <div class="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-slate-950 text-white font-bold text-[10px] flex items-center justify-center">
                        {{ getAdvertiserInitial(prop) }}
                      </div>
                      <div>
                        <p class="text-xs font-black text-slate-900 leading-none">{{ prop.owner_name }}</p>
                        <span class="text-[9px] font-bold text-slate-500">{{ prop.owner_type }}</span>
                      </div>
                    </div>
                    <span class="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded"><i class="fa-solid fa-check"></i> Vérifié</span>
                  </div>

                  <a [routerLink]="['/annonces', prop.id]" class="w-full bg-slate-950 hover:bg-slate-900 text-white text-xs font-extrabold py-2.5 rounded-2xl flex items-center justify-center gap-1.5 shadow">
                    <span>Voir la fiche & Contacter</span>
                    <i class="fa-solid fa-arrow-right text-[10px]"></i>
                  </a>
                </div>

              </div>

            </div>

            <!-- LIST DISPLAY MODE -->
            <div *ngIf="viewMode === 'list'" class="space-y-4">
              
              <div *ngFor="let prop of filteredProperties" class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row group">
                
                <div class="sm:w-64 h-48 sm:h-auto relative bg-slate-950 flex-shrink-0">
                  <img [src]="getPrimaryImage(prop)" [alt]="prop.title" class="w-full h-full object-cover">
                  <span [class.bg-emerald-600]="prop.transaction_type === 'sale'" [class.bg-orange-600]="prop.transaction_type === 'rent'" class="absolute top-2 left-2 text-white font-black text-[10px] px-2 py-0.5 rounded shadow uppercase">
                    {{ prop.transaction_type === 'sale' ? 'Vente' : 'Location' }}
                  </span>
                </div>

                <div class="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div class="flex justify-between items-baseline">
                      <span class="text-2xl font-black text-orange-600">{{ prop.price_fcfa | number }} <span class="text-xs font-bold text-slate-500">{{ countryService.currentCountry.currency }}</span></span>
                      <span class="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">{{ prop.property_type }}</span>
                    </div>

                    <h3 class="font-extrabold text-slate-900 text-lg mt-1 group-hover:text-orange-600 transition-colors">
                      {{ prop.title }}
                    </h3>

                    <p class="text-slate-500 text-xs font-semibold mt-1">
                      <i class="fa-solid fa-location-dot text-orange-500 mr-1"></i> {{ prop.quartier }}, {{ prop.city }}
                    </p>

                    <p class="text-slate-600 text-xs mt-2 line-clamp-2">{{ prop.description }}</p>
                  </div>

                  <div class="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-3 text-xs font-bold text-slate-700">
                      <span><i class="fa-solid fa-user text-orange-500"></i> {{ prop.owner_name }} ({{ prop.owner_type }})</span>
                      <span class="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-black text-[10px]"><i class="fa-solid fa-shield-check"></i> Vérifié</span>
                    </div>

                    <a [routerLink]="['/annonces', prop.id]" class="bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow">
                      Contacter directement
                    </a>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  `
})
export class PropertiesComponent implements OnInit {
  filteredProperties: Property[] = [];
  allProperties: Property[] = [];
  viewMode: 'grid' | 'list' = 'grid';

  filter: PropertyFilter = {
    transaction_type: '',
    city: '',
    quartier: '',
    property_type: '',
    max_price: 500000000,
    is_furnished: false,
    advertiser_type: 'all',
    verified_only: false,
    sort: 'featured'
  };

  constructor(
    private propertyService: PropertyService,
    private route: ActivatedRoute,
    public countryService: CountryService
  ) {
    this.allProperties = this.propertyService.getAllPropertiesCombined();
    this.filteredProperties = [...this.allProperties];
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.filter = {
        transaction_type: params['transaction_type'] || '',
        city: params['city'] || '',
        quartier: params['quartier'] || '',
        property_type: params['property_type'] || '',
        max_price: params['max_price'] ? +params['max_price'] : 500000000,
        is_furnished: params['is_furnished'] === 'true',
        advertiser_type: params['advertiser_type'] || 'all',
        verified_only: params['verified_only'] === 'true',
        sort: params['sort'] || 'featured'
      };

      this.fetchProperties();
    });
  }

  fetchProperties(): void {
    this.propertyService.getProperties(this.filter).subscribe(res => {
      const list = (res && res.data && res.data.length > 0) ? res.data : (Array.isArray(res) && res.length > 0 ? res : this.propertyService.getAllPropertiesCombined());
      this.allProperties = list;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let result = [...this.allProperties];

    if (this.filter.transaction_type) {
      result = result.filter(p => p.transaction_type === this.filter.transaction_type);
    }

    if (this.filter.city) {
      result = result.filter(p => p.city?.toLowerCase().includes(this.filter.city!.toLowerCase()));
    }

    if (this.filter.quartier) {
      result = result.filter(p => p.quartier?.toLowerCase().includes(this.filter.quartier!.toLowerCase()));
    }

    if (this.filter.property_type) {
      const targetType = this.filter.property_type.toLowerCase();
      result = result.filter(p => {
        const pType = (p.property_type || '').toLowerCase();
        if (targetType === 'bureau' || targetType === 'local commercial') {
          return pType.includes('bureau') || pType.includes('local') || pType.includes('commerce') || pType.includes('boutique');
        }
        return pType.includes(targetType);
      });
    }

    if (this.filter.max_price && this.filter.max_price < 500000000) {
      result = result.filter(p => p.price_fcfa <= (this.filter.max_price || 500000000));
    }

    if (this.filter.is_furnished) {
      result = result.filter(p => p.is_furnished);
    }

    if (this.filter.advertiser_type && this.filter.advertiser_type !== 'all') {
      const target = this.filter.advertiser_type === 'owner' ? 'propriétaire' : 'agence';
      result = result.filter(p => (p.owner_type || '').toLowerCase().includes(target));
    }

    if (this.filter.verified_only) {
      result = result.filter(p => p.is_verified);
    }

    // Sorting
    if (this.filter.sort === 'price_asc') {
      result.sort((a, b) => a.price_fcfa - b.price_fcfa);
    } else if (this.filter.sort === 'price_desc') {
      result.sort((a, b) => b.price_fcfa - a.price_fcfa);
    } else if (this.filter.sort === 'recent') {
      result.sort((a, b) => b.id - a.id);
    } else {
      result.sort((a, b) => (b.is_boosted ? 1 : 0) - (a.is_boosted ? 1 : 0));
    }

    this.filteredProperties = result;
  }


  resetFilters(): void {
    this.filter = {
      transaction_type: '',
      city: '',
      quartier: '',
      property_type: '',
      max_price: 500000000,
      is_furnished: false,
      advertiser_type: 'all',
      verified_only: false,
      sort: 'featured'
    };
    this.applyFilters();
  }

  getPrimaryImage(prop: Property): string {
    if (prop.images && prop.images.length > 0) {
      return prop.images[0].image_url;
    }
    return 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';
  }

  getAdvertiserInitial(prop: Property): string {
    const name = prop.owner_name || prop.agency?.name;
    return name && name.length > 0 ? name.charAt(0).toUpperCase() : 'I';
  }

  isFav(id: number): boolean {
    return this.propertyService.isFavorite(id);
  }

  toggleFav(id: number): void {
    this.propertyService.toggleFavorite(id);
  }
}

