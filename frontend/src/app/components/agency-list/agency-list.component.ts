import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../services/property.service';
import { LanguageService } from '../../services/language.service';
import { Agency } from '../../models/property.model';

@Component({
  selector: 'app-agency-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="bg-slate-50 min-h-screen py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Top Pill & Title Header -->
        <div class="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-xs font-extrabold shadow-sm">
            <i class="fa-solid fa-circle-check text-blue-500"></i>
            <span>{{ t('agency.verified') }}</span>
          </div>

          <h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {{ t('agency.title') }}
          </h1>

          <p class="text-slate-500 text-sm font-medium">
            {{ t('agency.subtitle') }}
          </p>
        </div>

        <!-- Filter & Search Controls Bar -->
        <div class="max-w-2xl mx-auto mb-12 flex flex-col sm:flex-row items-center gap-3">
          <!-- Search Input -->
          <div class="relative flex-1 w-full">
            <i class="fa-solid fa-magnifying-glass absolute left-4 top-3.5 text-slate-400 text-sm"></i>
            <input type="text" 
                   [(ngModel)]="searchTerm" 
                   [placeholder]="t('agency.search')" 
                   class="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm">
          </div>

          <!-- City Dropdown -->
          <div class="relative w-full sm:w-48">
            <select [(ngModel)]="selectedCity" class="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-sm pr-10">
              <option value="">{{ t('props.allCities') }}</option>
              <option value="Dakar">Dakar</option>
              <option value="Saly">Saly / Mbour</option>
              <option value="Thiès">Thiès</option>
            </select>
            <i class="fa-solid fa-chevron-down absolute right-4 top-4 text-xs text-slate-400 pointer-events-none"></i>
          </div>
        </div>

        <!-- Agency Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          
          <div *ngFor="let agency of filteredAgencies()" class="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4">
            
            <div>
              <!-- Header Row: Photo + Name + Badge -->
              <div class="flex items-start gap-4">
                <img [src]="agency.logo_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&q=80'" 
                     [alt]="agency.name"
                     class="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm shrink-0">
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <h3 class="font-extrabold text-slate-900 text-lg leading-tight truncate">
                      {{ agency.name }}
                    </h3>
                    <i *ngIf="agency.is_verified" class="fa-solid fa-circle-check text-blue-500 text-sm" title="Vérifiée"></i>
                  </div>
                  
                  <p class="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                    <i class="fa-solid fa-location-dot text-slate-400"></i> {{ agency.city }}
                  </p>

                  <!-- Rating & Listings count -->
                  <div class="flex items-center gap-2 mt-1 text-xs">
                    <span class="font-bold text-amber-500 flex items-center gap-1">
                      <i class="fa-solid fa-star"></i> {{ agency.rating || '4.8' }}
                    </span>
                    <span class="text-slate-400 font-medium">({{ agency.reviews_count || '24' }} avis)</span>
                    <span class="text-slate-300">•</span>
                    <a routerLink="/annonces" [queryParams]="{agency: agency.id}" class="text-blue-600 font-bold hover:underline">
                      {{ agency.active_listings_count }} {{ t('agency.activeListings') }}
                    </a>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <p class="text-slate-600 text-xs mt-3.5 leading-relaxed line-clamp-2">
                {{ agency.description }}
              </p>
            </div>

            <!-- Footer Action Row -->
            <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div class="flex items-center gap-3 text-slate-500 font-semibold">
                <span><i class="fa-solid fa-phone text-slate-400 mr-1"></i> {{ agency.phone_whatsapp || '+221 33 800 00 00' }}</span>
              </div>

              <a routerLink="/annonces" [queryParams]="{agency: agency.id}" class="text-blue-600 hover:text-blue-700 font-extrabold flex items-center gap-1 group">
                {{ t('agency.viewProperties') }} <i class="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1"></i>
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  `
})
export class AgencyListComponent implements OnInit {
  searchTerm: string = '';
  selectedCity: string = '';
  agencies: any[] = [];

  constructor(
    private propertyService: PropertyService,
    public langService: LanguageService
  ) {}

  t(key: string): string {
    return this.langService.translate(key);
  }

  ngOnInit(): void {
    this.propertyService.getAgencies().subscribe(res => {
      this.agencies = [
        {
          id: 1,
          name: 'IziVilla Prestige',
          city: 'Dakar',
          rating: '4.9',
          reviews_count: 42,
          active_listings_count: 3,
          is_verified: true,
          phone_whatsapp: '+221 33 820 45 45',
          description: 'Leader de l\'immobilier résidentiel haut de gamme à Dakar. Spécialiste Almadies, Ngor, Fann Résidence et Plateau.',
          logo_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&q=80'
        },
        {
          id: 2,
          name: 'SunuKeur Immobilier',
          city: 'Dakar',
          rating: '4.7',
          reviews_count: 29,
          active_listings_count: 2,
          is_verified: true,
          phone_whatsapp: '+221 33 864 12 12',
          description: 'Votre partenaire de confiance pour des appartements familiaux et studios modernes à Sacré-Cœur, Mermoz et Liberté 6.',
          logo_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80'
        },
        {
          id: 3,
          name: 'Petite Côte Living (Saly)',
          city: 'Saly',
          rating: '4.8',
          reviews_count: 35,
          active_listings_count: 1,
          is_verified: true,
          phone_whatsapp: '+221 33 957 88 99',
          description: 'Villas de vacances et résidences avec piscine à Saly Portudal, Somone et Ngaparou.',
          logo_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=200&q=80'
        },
        {
          id: 4,
          name: 'Baol Immo Thiès',
          city: 'Thiès',
          rating: '4.6',
          reviews_count: 18,
          active_listings_count: 1,
          is_verified: true,
          phone_whatsapp: '+221 33 951 10 20',
          description: 'Maisons meublées spacieuses et logements étudiants accessibles au cœur de la cité du Rail.',
          logo_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=200&q=80'
        }
      ];
    });
  }

  filteredAgencies(): any[] {
    return this.agencies.filter(agency => {
      const matchesSearch = !this.searchTerm || agency.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || agency.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCity = !this.selectedCity || agency.city === this.selectedCity;
      return matchesSearch && matchesCity;
    });
  }
}
