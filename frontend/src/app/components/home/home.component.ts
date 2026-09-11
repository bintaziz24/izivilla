import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { CountryService } from '../../services/country.service';
import { Property } from '../../models/property.model';

declare var L: any; // Leaflet JS

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <!-- HERO SECTION (Prompt Section 7) -->
    <section class="relative bg-slate-950 text-white overflow-hidden pt-12 pb-20 border-b border-slate-800">
      
      <!-- Background Ambient Glows -->
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <!-- Slogan & Headlines -->
        <div class="max-w-4xl mx-auto space-y-4">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-orange-400 text-xs font-black uppercase tracking-wider mb-2 shadow-inner">
            <i class="fa-solid fa-shield-halved text-emerald-400"></i> Plateforme Immobilière Directe
          </div>
          
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Trouvez votre bien. Contactez directement l’annonceur.
          </h1>
          
          <p class="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto font-medium leading-relaxed">
            Maisons, appartements, villas, terrains, locaux commerciaux et autres biens immobiliers.
          </p>
        </div>

        <!-- Visual Path (Prompt Section 7): Rechercher -> Trouver -> Contacter -->
        <div class="mt-8 flex justify-center items-center gap-3 text-xs font-black text-slate-300 uppercase tracking-wider">
          <span class="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5 text-orange-400">
            <i class="fa-solid fa-magnifying-glass"></i> 1. RECHERCHER
          </span>
          <i class="fa-solid fa-arrow-right text-slate-600"></i>
          <span class="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5 text-orange-400">
            <i class="fa-solid fa-house-circle-check"></i> 2. TROUVER
          </span>
          <i class="fa-solid fa-arrow-right text-slate-600"></i>
          <span class="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <i class="fa-solid fa-comments"></i> 3. CONTACTER DIRECTEMENT
          </span>
        </div>

        <!-- Modern Real Estate Search Bar (Prompt Section 7) -->
        <div class="mt-8 max-w-5xl mx-auto bg-white text-slate-900 rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-100 text-left">
          
          <!-- Transaction Type Toggle (Acheter / Louer) -->
          <div class="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
            <button (click)="searchTransactionType = 'all'" 
                    [class.bg-slate-950]="searchTransactionType === 'all'" 
                    [class.text-white]="searchTransactionType === 'all'" 
                    class="px-5 py-2 rounded-xl text-xs font-black transition-all bg-slate-100 text-slate-700">
              Tous les biens
            </button>
            <button (click)="searchTransactionType = 'sale'" 
                    [class.bg-orange-600]="searchTransactionType === 'sale'" 
                    [class.text-white]="searchTransactionType === 'sale'" 
                    class="px-5 py-2 rounded-xl text-xs font-black transition-all bg-slate-100 text-slate-700">
              Acheter (Vente)
            </button>
            <button (click)="searchTransactionType = 'rent'" 
                    [class.bg-orange-600]="searchTransactionType === 'rent'" 
                    [class.text-white]="searchTransactionType === 'rent'" 
                    class="px-5 py-2 rounded-xl text-xs font-black transition-all bg-slate-100 text-slate-700">
              Louer (Location)
            </button>
          </div>

          <!-- Main Controls Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
            
            <!-- Type de bien (Section 4 Types) -->
            <div class="lg:col-span-3">
              <label class="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Type de bien</label>
              <select [(ngModel)]="searchCategory" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-orange-500 shadow-sm">
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

            <!-- Ville / Région -->
            <div class="lg:col-span-3">
              <label class="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Ville / Région</label>
              <select [(ngModel)]="searchCity" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-orange-500 shadow-sm">
                <option value="">Toutes les zones (Sénégal)</option>
                <option value="Dakar">Dakar (Almadies, Mermoz, Ngor...)</option>
                <option value="Saly">Saly & Petite Côte</option>
                <option value="Thiès">Thiès</option>
                <option value="Saint-Louis">Saint-Louis</option>
                <option value="Ziguinchor">Ziguinchor</option>
              </select>
            </div>

            <!-- Budget Max -->
            <div class="lg:col-span-2">
              <label class="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Budget Max</label>
              <input type="number" [(ngModel)]="maxBudget" [placeholder]="countryService.currentCountry.currency" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-orange-500 shadow-sm">
            </div>

            <!-- Nb Chambres -->
            <div class="lg:col-span-2">
              <label class="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Chambres</label>
              <select [(ngModel)]="searchBedrooms" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-orange-500 shadow-sm">
                <option value="">Toutes</option>
                <option value="1">1+ chambre</option>
                <option value="2">2+ chambres</option>
                <option value="3">3+ chambres</option>
                <option value="4">4+ chambres</option>
              </select>
            </div>

            <!-- Submit Button -->
            <div class="lg:col-span-2">
              <button (click)="executeSearch()" class="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 transition-all text-xs">
                <i class="fa-solid fa-magnifying-glass"></i>
                <span>Rechercher</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>

    <!-- SECTION DES 3 PROFILS (Prompt Section 8) -->
    <section class="py-16 bg-white border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <span class="text-xs font-black uppercase text-orange-600 tracking-wider">Trois profils · Une même simplicité</span>
          <h2 class="text-3xl font-black text-slate-900">Le bon bien. Le bon annonceur. Directement.</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <!-- Card 1: Je recherche un bien -->
          <div class="bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:border-orange-500 shadow-sm hover:shadow-xl transition-all space-y-5 flex flex-col justify-between">
            <div class="space-y-3">
              <div class="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl font-bold">
                <i class="fa-solid fa-magnifying-glass-location"></i>
              </div>
              <h3 class="text-xl font-black text-slate-900">Je recherche un bien</h3>
              <p class="text-xs text-slate-600 leading-relaxed font-medium">
                « Recherchez facilement votre prochain logement ou investissement et contactez directement l’annonceur. »
              </p>
            </div>

            <a routerLink="/annonces" class="w-full bg-slate-950 hover:bg-slate-900 text-white font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow transition-all">
              <span>Rechercher un bien</span>
              <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </a>
          </div>

          <!-- Card 2: Je suis propriétaire -->
          <div class="bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-xl transition-all space-y-5 flex flex-col justify-between relative">
            
            <div class="absolute top-6 right-6 bg-emerald-100 text-emerald-800 text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-300">
              <i class="fa-solid fa-circle-check text-emerald-600"></i> Propriétaire vérifié
            </div>

            <div class="space-y-3">
              <div class="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold">
                <i class="fa-solid fa-key"></i>
              </div>
              <h3 class="text-xl font-black text-slate-900">Je suis propriétaire</h3>
              <p class="text-xs text-slate-600 leading-relaxed font-medium">
                « Publiez votre bien directement et recevez les demandes des personnes intéressées. »
              </p>
            </div>

            <button (click)="onPublishPropertyClick()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow shadow-emerald-600/20 transition-all cursor-pointer">
              <span>Publier mon bien</span>
              <i class="fa-solid fa-plus text-[10px]"></i>
            </button>
          </div>

          <!-- Card 3: Je suis une agence -->
          <div class="bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all space-y-5 flex flex-col justify-between relative">
            
            <div class="absolute top-6 right-6 bg-blue-100 text-blue-800 text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 border border-blue-300">
              <i class="fa-solid fa-shield-halved text-blue-600"></i> Agence vérifiée
            </div>

            <div class="space-y-3">
              <div class="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
                <i class="fa-solid fa-building text-blue-600"></i>
              </div>
              <h3 class="text-xl font-black text-slate-900">Je suis une agence</h3>
              <p class="text-xs text-slate-600 leading-relaxed font-medium">
                « Développez votre visibilité, publiez vos biens et échangez directement avec vos clients. »
              </p>
            </div>

            <button (click)="onCreateSpaceClick()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow shadow-blue-600/20 transition-all cursor-pointer">
              <span>Créer mon espace</span>
              <i class="fa-solid fa-chart-line text-[10px]"></i>
            </button>
          </div>

        </div>

      </div>
    </section>

    <!-- SECTION COMMENT ÇA MARCHE (Prompt Section 9) -->
    <section class="py-16 bg-slate-950 text-white relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        
        <div class="max-w-3xl mx-auto space-y-2">
          <span class="text-xs font-black uppercase text-orange-400 tracking-wider">Parcours Simplifié</span>
          <h2 class="text-3xl font-black text-white">Comment ça marche ?</h2>
          <p class="text-slate-400 text-xs font-medium">Un processus transparent en 4 étapes clés.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          
          <div class="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3 relative overflow-hidden">
            <span class="text-4xl font-black text-orange-500/20 absolute top-4 right-4">01</span>
            <div class="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-lg font-bold">
              <i class="fa-solid fa-sliders"></i>
            </div>
            <h4 class="text-lg font-extrabold text-white">01 — Rechercher</h4>
            <p class="text-xs text-slate-400 font-medium">Définissez vos critères (Ville, Budget, Type de bien, Nb de chambres).</p>
          </div>

          <div class="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3 relative overflow-hidden">
            <span class="text-4xl font-black text-orange-500/20 absolute top-4 right-4">02</span>
            <div class="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-lg font-bold">
              <i class="fa-solid fa-list-check"></i>
            </div>
            <h4 class="text-lg font-extrabold text-white">02 — Trouver</h4>
            <p class="text-xs text-slate-400 font-medium">Consultez les biens qui correspondent exactement à votre recherche.</p>
          </div>

          <div class="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3 relative overflow-hidden">
            <span class="text-4xl font-black text-orange-500/20 absolute top-4 right-4">03</span>
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg font-bold">
              <i class="fa-solid fa-user-check"></i>
            </div>
            <h4 class="text-lg font-extrabold text-white">03 — Identifier</h4>
            <p class="text-xs text-slate-400 font-medium">Découvrez qui propose réellement le bien (Propriétaire ou Agence certifiée).</p>
          </div>

          <div class="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3 relative overflow-hidden">
            <span class="text-4xl font-black text-emerald-500/20 absolute top-4 right-4">04</span>
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg font-bold">
              <i class="fa-solid fa-phone"></i>
            </div>
            <h4 class="text-lg font-extrabold text-white">04 — Contacter</h4>
            <p class="text-xs text-slate-400 font-medium">Contactez directement le propriétaire ou l'agence sans intermédiaire.</p>
          </div>

        </div>

        <div class="pt-6">
          <div class="inline-block bg-orange-600 text-white font-black text-sm uppercase px-8 py-3.5 rounded-2xl shadow-xl shadow-orange-600/30">
            Zéro intermédiaire inutile.
          </div>
        </div>

      </div>
    </section>

    <!-- SECTION ANNONCES RÉCENTES (Prompt Section 10) -->
    <section class="py-16 bg-slate-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span class="text-xs font-black uppercase text-orange-600 tracking-wider">Dernières Publications</span>
            <h2 class="text-3xl font-black text-slate-900 mt-1">Biens Récemment Publiés</h2>
            <p class="text-slate-500 text-xs mt-1">Identifiez immédiatement l'annonceur et contactez-le directement.</p>
          </div>

          <a routerLink="/annonces" class="px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-black text-slate-800 hover:border-orange-500 hover:text-orange-600 shadow-sm transition-all flex items-center gap-2">
            <span>Toutes les annonces</span>
            <i class="fa-solid fa-arrow-right text-[10px]"></i>
          </a>
        </div>

        <!-- Property Cards Grid (Prompt Section 10 Specification) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div *ngFor="let prop of featuredProperties" class="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group">
            
            <!-- Photo Container with Badges -->
            <div class="relative h-64 overflow-hidden bg-slate-950">
              <img [src]="getPrimaryImage(prop)" [alt]="prop.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

              <!-- Badge Vente ou Location -->
              <div class="absolute top-4 left-4 flex gap-2">
                <span [class.bg-emerald-600]="prop.transaction_type === 'sale'" [class.bg-orange-600]="prop.transaction_type === 'rent'" class="text-white text-[11px] font-black px-3 py-1 rounded-xl shadow uppercase">
                  {{ prop.transaction_type === 'sale' ? 'Vente' : 'Location' }}
                </span>
                <span *ngIf="prop.is_furnished" class="bg-slate-900/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-xl backdrop-blur">
                  Meublé
                </span>
              </div>

              <!-- Favorite Button -->
              <button (click)="toggleFav(prop.id)" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur text-slate-700 hover:text-orange-600 flex items-center justify-center shadow-md transition-colors">
                <i [class.fa-solid]="isFav(prop.id)" [class.fa-regular]="!isFav(prop.id)" [class.text-orange-600]="isFav(prop.id)" class="fa-heart text-lg"></i>
              </button>

              <!-- Category Tag -->
              <div class="absolute bottom-3 left-4 text-white text-xs font-bold bg-slate-950/80 px-2.5 py-1 rounded-lg border border-white/10">
                <i class="fa-solid fa-tag text-orange-400 mr-1"></i> {{ prop.property_type }}
              </div>
            </div>

            <!-- Card Content Body -->
            <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
              
              <div>
                <!-- Price & Location -->
                <div class="flex justify-between items-baseline mb-1">
                  <span class="text-2xl font-black text-orange-600">
                    {{ prop.price_fcfa | number }} <span class="text-xs font-bold text-slate-500">{{ countryService.currentCountry.currency }} {{ prop.transaction_type === 'rent' ? '/mois' : '' }}</span>
                  </span>
                </div>

                <!-- Title -->
                <h3 class="font-extrabold text-slate-900 text-base line-clamp-1 group-hover:text-orange-600 transition-colors">
                  {{ prop.title }}
                </h3>

                <!-- Location -->
                <p class="text-slate-500 text-xs font-semibold mt-1">
                  <i class="fa-solid fa-location-dot text-orange-500 mr-1"></i>
                  {{ prop.quartier }}, {{ prop.city }}
                </p>
              </div>

              <!-- Features (Bedrooms, Bathrooms, Surface) -->
              <div class="py-2 border-y border-slate-100 flex items-center justify-between text-slate-600 text-xs font-bold">
                <span><i class="fa-solid fa-bed text-orange-500 mr-1"></i> {{ prop.bedrooms }} ch.</span>
                <span><i class="fa-solid fa-bath text-orange-500 mr-1"></i> {{ prop.bathrooms }} sdb</span>
                <span><i class="fa-solid fa-ruler-combined text-orange-500 mr-1"></i> {{ prop.surface_sqm }} m²</span>
              </div>

              <!-- Advertiser Info Section (Prompt Section 10 Key Requirement) -->
              <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow shrink-0">
                    {{ getAdvertiserInitial(prop) }}
                  </div>
                  <div class="text-left leading-tight">
                    <p class="text-xs font-extrabold text-slate-900 truncate max-w-[130px]">{{ prop.owner_name }}</p>
                    <span class="text-[10px] font-bold text-slate-500">{{ prop.owner_type }}</span>
                  </div>
                </div>

                <!-- Verified Badge -->
                <span class="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                  <i class="fa-solid fa-shield-check text-emerald-600"></i> Vérifié
                </span>
              </div>

              <!-- Primary Action CTA Button: Voir le bien -->
              <a [routerLink]="['/annonces', prop.id]" class="w-full bg-slate-950 hover:bg-slate-900 text-white text-xs font-extrabold py-3 rounded-2xl flex items-center justify-center gap-2 shadow transition-all">
                <span>Voir le bien</span>
                <i class="fa-solid fa-arrow-right text-[10px]"></i>
              </a>

            </div>

          </div>

        </div>

      </div>
    </section>

    <!-- MAP SECTION -->
    <section class="py-16 bg-slate-950 text-white relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
          <div>
            <span class="text-xs font-black uppercase text-orange-500 tracking-wider">Carte Interactive Sénégal</span>
            <h2 class="text-3xl font-black text-white mt-1">Localisez les biens à Dakar, Saly et Thiès</h2>
          </div>
          <a routerLink="/annonces" class="btn-orange text-xs px-5 py-2.5">Ouvrir la carte de recherche</a>
        </div>

        <div class="relative bg-slate-900 rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl h-[400px]">
          <div id="homeMap" class="w-full h-full"></div>
        </div>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  featuredProperties: Property[] = [];
  searchTransactionType = 'all';
  searchCategory = '';
  searchCity = '';
  searchBedrooms = '';
  maxBudget = 500000000;
  private map: any;

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    public countryService: CountryService
  ) {
    this.featuredProperties = this.propertyService.getAllPropertiesCombined().slice(0, 6);
  }

  ngOnInit(): void {
    this.propertyService.getProperties().subscribe(res => {
      const list = (res && res.data && res.data.length > 0) ? res.data : (Array.isArray(res) && res.length > 0 ? res : this.propertyService.getAllPropertiesCombined());
      this.featuredProperties = list.slice(0, 6);
      this.initMap();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 500);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  onPublishPropertyClick(): void {
    if (this.propertyService.isLoggedIn$.getValue()) {
      this.router.navigate(['/deposer-annonce']);
    } else {
      this.propertyService.openAuthModal(
        'register',
        'Veuillez créer votre compte propriétaire ou vous connecter pour publier votre bien.',
        '/deposer-annonce'
      );
    }
  }

  onCreateSpaceClick(): void {
    if (this.propertyService.isLoggedIn$.getValue()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.propertyService.openAuthModal(
        'register',
        'Veuillez créer votre compte agence / propriétaire ou vous connecter pour accéder à votre espace pro.',
        '/dashboard'
      );
    }
  }

  executeSearch(): void {
    this.router.navigate(['/annonces'], {
      queryParams: {
        transaction_type: this.searchTransactionType !== 'all' ? this.searchTransactionType : null,
        city: this.searchCity || null,
        property_type: this.searchCategory || null,
        bedrooms: this.searchBedrooms || null,
        max_price: this.maxBudget || null
      }
    });
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

  private initMap(): void {
    if (typeof L === 'undefined') return;
    const mapElement = document.getElementById('homeMap');
    if (!mapElement || this.map) return;

    this.map = L.map('homeMap').setView([14.7167, -17.4677], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.featuredProperties.forEach(p => {
      if (p.latitude && p.longitude) {
        const marker = L.marker([p.latitude, p.longitude]).addTo(this.map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; width: 180px;">
            <img src="${this.getPrimaryImage(p)}" style="width:100%; height:80px; object-fit:cover; border-radius:6px; margin-bottom:4px;"/>
            <strong style="font-size:11px; color:#0f172a;">${p.title}</strong>
            <p style="font-size:11px; color:#ea580c; font-weight:bold; margin-top:2px;">${p.price_fcfa.toLocaleString()} ${this.countryService.currentCountry.currency}</p>
          </div>
        `);
      }
    });
  }
}

