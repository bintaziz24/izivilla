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
    <!-- HERO SECTION avec Visuel Villa d'Exception & Ambiance Lumineuse -->
    <section class="relative min-h-[580px] lg:min-h-[640px] flex items-center text-white overflow-hidden py-16 sm:py-24 border-b border-slate-200/60">
      
      <!-- Photo d'arrière-plan avec villa contemporaine & piscine au coucher du soleil -->
      <div class="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
           style="background-image: url('/images/hero-villa.jpg');">
      </div>

      <!-- Superposition de dégradé cinématique & lumineux pour contraste parfait -->
      <div class="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/60 to-slate-950/85 backdrop-blur-[2px]"></div>

      <div class="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        
        <!-- Badge Chapeau -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-semibold tracking-wide mb-6 shadow-sm">
          <i class="fa-solid fa-sparkles text-amber-400"></i>
          <span>La 1ère plateforme immobilière directe {{ countryService.currentCountry.preposition }} {{ countryService.currentCountry.name }}</span>
        </div>
        
        <!-- Grand Titre Raffiné -->
        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto font-['Outfit']">
          Trouvez votre bien d'exception.<br class="hidden sm:inline" />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-300">
            En direct avec l'annonceur.
          </span>
        </h1>
        
        <p class="text-slate-200 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto mt-4 font-normal leading-relaxed drop-shadow-sm">
          Maisons, villas de prestige, appartements et terrains à Dakar, Saly et Thiès. Zéro commission d'agence abusive.
        </p>

        <!-- Parcours en 3 étapes subtiles -->
        <div class="mt-6 flex flex-wrap justify-center items-center gap-2 sm:gap-4 text-xs font-medium text-slate-300">
          <span class="bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 flex items-center gap-2">
            <i class="fa-solid fa-magnifying-glass text-orange-400 text-[11px]"></i> 1. Rechercher
          </span>
          <i class="fa-solid fa-arrow-right text-slate-400/80 text-[10px] hidden sm:inline"></i>
          <span class="bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 flex items-center gap-2">
            <i class="fa-solid fa-house-circle-check text-orange-400 text-[11px]"></i> 2. Trouver
          </span>
          <i class="fa-solid fa-arrow-right text-slate-400/80 text-[10px] hidden sm:inline"></i>
          <span class="bg-orange-500/25 backdrop-blur-md text-amber-300 border border-orange-400/30 px-3.5 py-1.5 rounded-full flex items-center gap-2 font-semibold">
            <i class="fa-solid fa-comments text-amber-300 text-[11px]"></i> 3. Contacter en direct
          </span>
        </div>

        <!-- BARRE DE RECHERCHE FLOTTANTE ÉPURÉE (Style Airbnb / Bien'ici) -->
        <div class="mt-10 max-w-5xl mx-auto text-left">
          <div class="bg-white/95 backdrop-blur-xl rounded-3xl p-3 sm:p-5 shadow-2xl shadow-black/25 border border-white/80 ring-1 ring-slate-900/5">
            
            <!-- Onglets de Transaction Segmentés -->
            <div class="flex items-center gap-1 sm:gap-2 pb-3 mb-3 border-b border-slate-100">
              <button (click)="searchTransactionType = 'all'" 
                      [class.bg-slate-900]="searchTransactionType === 'all'" 
                      [class.text-white]="searchTransactionType === 'all'" 
                      [class.shadow-sm]="searchTransactionType === 'all'"
                      class="px-4 py-1.5 rounded-full text-xs font-bold transition-all text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer">
                Tous les biens
              </button>
              <button (click)="searchTransactionType = 'sale'" 
                      [class.bg-gradient-to-r]="searchTransactionType === 'sale'" 
                      [class.from-orange-600]="searchTransactionType === 'sale'" 
                      [class.to-amber-500]="searchTransactionType === 'sale'" 
                      [class.text-white]="searchTransactionType === 'sale'" 
                      [class.shadow-sm]="searchTransactionType === 'sale'"
                      class="px-4 py-1.5 rounded-full text-xs font-bold transition-all text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer">
                Acheter
              </button>
              <button (click)="searchTransactionType = 'rent'" 
                      [class.bg-gradient-to-r]="searchTransactionType === 'rent'" 
                      [class.from-orange-600]="searchTransactionType === 'rent'" 
                      [class.to-amber-500]="searchTransactionType === 'rent'" 
                      [class.text-white]="searchTransactionType === 'rent'" 
                      [class.shadow-sm]="searchTransactionType === 'rent'"
                      class="px-4 py-1.5 rounded-full text-xs font-bold transition-all text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer">
                Louer
              </button>
            </div>

            <!-- Grille de Contrôles Aérés & Interactifs -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 sm:gap-3 items-center">
              
              <!-- 1. Type de bien -->
              <div class="lg:col-span-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                <label class="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-0.5">
                  <i class="fa-solid fa-house text-orange-500 text-[10px]"></i>
                  <span>Type de bien</span>
                </label>
                <select [(ngModel)]="searchCategory" class="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer py-1">
                  <option value="">Tous les types</option>
                  <option value="Villa">Villa d'exception</option>
                  <option value="Appartement">Appartement</option>
                  <option value="Maison">Maison</option>
                  <option value="Terrain">Terrain & Parcelle</option>
                  <option value="Studio">Studio</option>
                  <option value="Immeuble">Immeuble</option>
                  <option value="Local commercial">Local commercial</option>
                  <option value="Bureau">Bureau</option>
                </select>
              </div>

              <!-- 2. Ville / Secteur -->
              <div class="lg:col-span-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                <label class="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-0.5">
                  <i class="fa-solid fa-location-dot text-orange-500 text-[10px]"></i>
                  <span>Localisation</span>
                </label>
                <select [(ngModel)]="searchCity" class="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer py-1">
                  <option value="">Toutes les zones ({{ countryService.currentCountry.name }})</option>
                  <option value="Dakar">Dakar (Almadies, Ngor, Mermoz)</option>
                  <option value="Saly">Saly & Petite Côte</option>
                  <option value="Thiès">Thiès & Environs</option>
                  <option value="Saint-Louis">Saint-Louis</option>
                  <option value="Ziguinchor">Ziguinchor & Casamance</option>
                </select>
              </div>

              <!-- 3. Budget Max -->
              <div class="lg:col-span-2 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                <label class="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-0.5">
                  <i class="fa-solid fa-wallet text-orange-500 text-[10px]"></i>
                  <span>Budget max</span>
                </label>
                <input type="number" [(ngModel)]="maxBudget" [placeholder]="'Budget en ' + countryService.currentCountry.currency" 
                       class="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none py-1 placeholder-slate-400">
              </div>

              <!-- 4. Nb de Chambres -->
              <div class="lg:col-span-2 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                <label class="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-0.5">
                  <i class="fa-solid fa-bed text-orange-500 text-[10px]"></i>
                  <span>Chambres</span>
                </label>
                <select [(ngModel)]="searchBedrooms" class="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer py-1">
                  <option value="">Toutes</option>
                  <option value="1">1+ chambre</option>
                  <option value="2">2+ chambres</option>
                  <option value="3">3+ chambres</option>
                  <option value="4">4+ chambres</option>
                </select>
              </div>

              <!-- 5. Bouton Rechercher -->
              <div class="lg:col-span-2 pt-1 lg:pt-0">
                <button (click)="executeSearch()" class="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-bold py-3.5 px-4 rounded-2xl lg:rounded-full flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] transition-all text-xs cursor-pointer">
                  <i class="fa-solid fa-magnifying-glass text-xs"></i>
                  <span>Rechercher</span>
                </button>
              </div>

            </div>

          </div>

          <!-- Suggestions populaires sous la barre -->
          <div class="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300 font-medium">
            <span class="text-slate-400 text-[11px]">Populaire :</span>
            <button (click)="quickSearch('Dakar', 'Villa')" class="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full border border-white/15 text-white text-[11px] transition-colors cursor-pointer">
              🏡 Villas Almadies
            </button>
            <button (click)="quickSearch('Saly', 'Villa')" class="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full border border-white/15 text-white text-[11px] transition-colors cursor-pointer">
              🏖️ Villas à Saly
            </button>
            <button (click)="quickSearch('Dakar', 'Appartement')" class="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full border border-white/15 text-white text-[11px] transition-colors cursor-pointer">
              🏢 Appartements Mermoz
            </button>
            <button (click)="quickSearch('Thiès', 'Terrain')" class="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full border border-white/15 text-white text-[11px] transition-colors cursor-pointer">
              🌱 Terrains Thiès
            </button>
          </div>

        </div>

      </div>
    </section>

    <!-- SECTION DES 3 PROFILS : Design Épuré, Lumineux & Rassurant -->
    <section class="py-20 bg-slate-50/70 border-b border-slate-200/70">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="text-center max-w-3xl mx-auto mb-14 space-y-2">
          <span class="text-xs font-bold uppercase text-orange-600 tracking-wider">Trois profils · Une même simplicité</span>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 font-['Outfit']">Le bon bien. Le bon annonceur. Directement.</h2>
          <p class="text-slate-500 text-sm">Que vous cherchiez votre futur lieu de vie ou que vous vendiez un bien, bénéficiez du contact direct.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <!-- Card 1: Je recherche un bien -->
          <div class="bg-white rounded-3xl p-8 border border-slate-200/80 hover:border-orange-500/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-6 flex flex-col justify-between">
            <div class="space-y-4">
              <div class="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl font-bold shadow-xs">
                <i class="fa-solid fa-magnifying-glass-location"></i>
              </div>
              <h3 class="text-xl font-bold text-slate-900 font-['Outfit']">Je recherche un bien</h3>
              <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Recherchez facilement votre prochain logement ou investissement et contactez directement le véritable propriétaire sans commission inutile.
              </p>
            </div>

            <button (click)="onSearchPropertyClick()" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-full text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer">
              <span>Rechercher un bien</span>
              <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>

          <!-- Card 2: Je suis propriétaire -->
          <div class="bg-white rounded-3xl p-8 border border-orange-200/80 hover:border-orange-500 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-6 flex flex-col justify-between relative">
            
            <div class="absolute top-6 right-6 bg-orange-50 text-orange-700 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-orange-200/60">
              <i class="fa-solid fa-circle-check text-orange-600"></i> Propriétaire direct
            </div>

            <div class="space-y-4">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-orange-500/20">
                <i class="fa-solid fa-key"></i>
              </div>
              <h3 class="text-xl font-bold text-slate-900 font-['Outfit']">Je suis propriétaire</h3>
              <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Publiez votre bien directement et recevez les appels et messages des personnes réellement intéressées, sans intermédiaire parasite.
              </p>
            </div>

            <button (click)="onPublishPropertyClick()" class="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-bold py-3.5 px-4 rounded-full text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 transition-all cursor-pointer">
              <span>Publier mon bien</span>
              <i class="fa-solid fa-plus text-[10px]"></i>
            </button>
          </div>

          <!-- Card 3: Je suis une agence -->
          <div class="bg-white rounded-3xl p-8 border border-slate-200/80 hover:border-slate-400 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-6 flex flex-col justify-between relative">
            
            <div class="absolute top-6 right-6 bg-slate-100 text-slate-700 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-slate-200">
              <i class="fa-solid fa-shield-halved text-slate-600"></i> Agence certifiée
            </div>

            <div class="space-y-4">
              <div class="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-bold shadow-sm">
                <i class="fa-solid fa-building text-amber-400"></i>
              </div>
              <h3 class="text-xl font-bold text-slate-900 font-['Outfit']">Je suis une agence</h3>
              <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Développez votre visibilité auprès d'une audience qualifiée au Sénégal, gérez votre portefeuille de biens et concluez plus vite.
              </p>
            </div>

            <button (click)="onCreateSpaceClick()" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-full text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer">
              <span>Créer mon espace pro</span>
              <i class="fa-solid fa-chart-line text-[10px]"></i>
            </button>
          </div>

        </div>

      </div>
    </section>

    <!-- SECTION COMMENT ÇA MARCHE : Fond Clair & Parcours Fluide -->
    <section class="py-20 bg-white border-b border-slate-200/70">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        
        <div class="max-w-3xl mx-auto space-y-2">
          <span class="text-xs font-bold uppercase text-orange-600 tracking-wider">Parcours Simplifié</span>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 font-['Outfit']">Comment ça marche ?</h2>
          <p class="text-slate-500 text-sm">Un processus clair et 100% transparent en 4 étapes clés.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          
          <div class="bg-slate-50 rounded-3xl p-6 border border-slate-200/70 space-y-3 relative overflow-hidden group hover:bg-orange-50/30 hover:border-orange-200 transition-all">
            <span class="text-4xl font-black text-slate-200 group-hover:text-orange-200 transition-colors absolute top-4 right-4">01</span>
            <div class="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-lg font-bold">
              <i class="fa-solid fa-sliders"></i>
            </div>
            <h4 class="text-base font-bold text-slate-900 font-['Outfit']">01 — Rechercher</h4>
            <p class="text-xs text-slate-500 leading-relaxed">Définissez vos critères précis : ville, quartier, type de bien, budget et chambres.</p>
          </div>

          <div class="bg-slate-50 rounded-3xl p-6 border border-slate-200/70 space-y-3 relative overflow-hidden group hover:bg-orange-50/30 hover:border-orange-200 transition-all">
            <span class="text-4xl font-black text-slate-200 group-hover:text-orange-200 transition-colors absolute top-4 right-4">02</span>
            <div class="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-lg font-bold">
              <i class="fa-solid fa-list-check"></i>
            </div>
            <h4 class="text-base font-bold text-slate-900 font-['Outfit']">02 — Trouver</h4>
            <p class="text-xs text-slate-500 leading-relaxed">Parcourez les biens vérifiés correspondant exactement à votre budget et vos envies.</p>
          </div>

          <div class="bg-slate-50 rounded-3xl p-6 border border-slate-200/70 space-y-3 relative overflow-hidden group hover:bg-orange-50/30 hover:border-orange-200 transition-all">
            <span class="text-4xl font-black text-slate-200 group-hover:text-orange-200 transition-colors absolute top-4 right-4">03</span>
            <div class="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-lg font-bold">
              <i class="fa-solid fa-user-check"></i>
            </div>
            <h4 class="text-base font-bold text-slate-900 font-['Outfit']">03 — Identifier</h4>
            <p class="text-xs text-slate-500 leading-relaxed">Identifiez qui propose le bien : propriétaire direct ou agence certifiée enregistrée.</p>
          </div>

          <div class="bg-slate-50 rounded-3xl p-6 border border-slate-200/70 space-y-3 relative overflow-hidden group hover:bg-orange-50/30 hover:border-orange-200 transition-all">
            <span class="text-4xl font-black text-slate-200 group-hover:text-orange-200 transition-colors absolute top-4 right-4">04</span>
            <div class="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-lg font-bold">
              <i class="fa-solid fa-phone"></i>
            </div>
            <h4 class="text-base font-bold text-slate-900 font-['Outfit']">04 — Contacter</h4>
            <p class="text-xs text-slate-500 leading-relaxed">Appelez ou écrivez sur WhatsApp sans intermédiaire ni frais dissimulés.</p>
          </div>

        </div>

        <div class="pt-4">
          <div class="inline-flex items-center gap-2 bg-orange-50 border border-orange-200/80 text-orange-800 font-bold text-xs uppercase px-6 py-2.5 rounded-full shadow-xs">
            <i class="fa-solid fa-circle-check text-orange-600"></i>
            <span>Zéro intermédiaire inutile · 100% contact direct</span>
          </div>
        </div>

      </div>
    </section>

    <!-- SECTION ANNONCES RÉCENTES -->
    <section class="py-20 bg-slate-50/70 border-b border-slate-200/70">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span class="text-xs font-bold uppercase text-orange-600 tracking-wider">Sélection Immobilière</span>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 font-['Outfit'] mt-1">Biens Récemment Publiés</h2>
            <p class="text-slate-500 text-sm mt-1">Identifiez immédiatement l'annonceur et organisez votre visite directement.</p>
          </div>

          <a routerLink="/annonces" class="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:border-orange-500 hover:text-orange-600 shadow-sm transition-all flex items-center gap-2 self-start md:self-auto">
            <span>Toutes les annonces</span>
            <i class="fa-solid fa-arrow-right text-[10px]"></i>
          </a>
        </div>

        <!-- Grille de Cartes Immobilières Haut de Gamme -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div *ngFor="let prop of featuredProperties" class="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
            
            <!-- Photo Container avec Badges -->
            <div class="relative h-64 overflow-hidden bg-slate-900">
              <img [src]="getPrimaryImage(prop)" [alt]="prop.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>

              <!-- Badge Vente ou Location -->
              <div class="absolute top-4 left-4 flex gap-2">
                <span [class.bg-slate-900]="prop.transaction_type === 'sale'" [class.bg-orange-600]="prop.transaction_type === 'rent'" class="text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide">
                  {{ prop.transaction_type === 'sale' ? 'Vente' : 'Location' }}
                </span>
                <span *ngIf="prop.is_furnished" class="bg-white/90 backdrop-blur text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                  Meublé
                </span>
              </div>

              <!-- Bouton Favoris -->
              <button (click)="toggleFav(prop.id)" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur text-slate-700 hover:text-orange-600 flex items-center justify-center shadow-md transition-colors cursor-pointer">
                <i [class.fa-solid]="isFav(prop.id)" [class.fa-regular]="!isFav(prop.id)" [class.text-orange-600]="isFav(prop.id)" class="fa-heart text-base"></i>
              </button>

              <!-- Category Tag -->
              <div class="absolute bottom-3 left-4 text-white text-xs font-semibold bg-black/50 backdrop-blur px-2.5 py-1 rounded-full border border-white/15">
                <i class="fa-solid fa-tag text-orange-400 mr-1"></i> {{ prop.property_type }}
              </div>
            </div>

            <!-- Card Content Body -->
            <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
              
              <div>
                <!-- Prix & Localisation -->
                <div class="flex justify-between items-baseline mb-1">
                  <span class="text-2xl font-extrabold text-orange-600 font-['Outfit']">
                    {{ countryService.convertPrice(prop.price_fcfa) | number }} <span class="text-xs font-bold text-slate-400">{{ countryService.currentCountry.currency }} {{ prop.transaction_type === 'rent' ? '/mois' : '' }}</span>
                  </span>
                </div>

                <!-- Titre -->
                <h3 class="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-orange-600 transition-colors font-['Outfit']">
                  {{ prop.title }}
                </h3>

                <!-- Localisation -->
                <p class="text-slate-500 text-xs font-medium mt-1">
                  <i class="fa-solid fa-location-dot text-orange-500 mr-1"></i>
                  {{ prop.quartier }}, {{ prop.city }}
                </p>
              </div>

              <!-- Caractéristiques (Chambres, Salles de bain, Surface) -->
              <div class="py-2.5 border-y border-slate-100 flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span><i class="fa-solid fa-bed text-orange-500 mr-1"></i> {{ prop.bedrooms }} ch.</span>
                <span><i class="fa-solid fa-bath text-orange-500 mr-1"></i> {{ prop.bathrooms }} sdb</span>
                <span><i class="fa-solid fa-ruler-combined text-orange-500 mr-1"></i> {{ prop.surface_sqm }} m²</span>
              </div>

              <!-- Annonceur vérifié -->
              <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                    {{ getAdvertiserInitial(prop) }}
                  </div>
                  <div class="text-left leading-tight">
                    <p class="text-xs font-bold text-slate-800 truncate max-w-[130px]">{{ prop.owner_name }}</p>
                    <span class="text-[10px] text-slate-400">{{ prop.owner_type }}</span>
                  </div>
                </div>

                <!-- Verified Badge -->
                <span class="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200/60">
                  <i class="fa-solid fa-shield-check text-emerald-600"></i> Vérifié
                </span>
              </div>

              <!-- Action Principale CTA -->
              <a [routerLink]="['/annonces', prop.id]" class="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3.5 rounded-full flex items-center justify-center gap-2 shadow-xs transition-all">
                <span>Voir le bien</span>
                <i class="fa-solid fa-arrow-right text-[10px]"></i>
              </a>

            </div>

          </div>

        </div>

      </div>
    </section>

    <!-- SECTION CARTE INTERACTIVE : Moderne & Séduisante -->
    <section class="py-20 bg-slate-900 text-white relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
          <div>
            <span class="text-xs font-bold uppercase text-amber-400 tracking-wider">Carte Interactive {{ countryService.currentCountry.name }}</span>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-white mt-1 font-['Outfit']">Localisez les biens à Dakar, Saly et Thiès</h2>
            <p class="text-slate-400 text-xs sm:text-sm mt-1">Explorez les zones les plus recherchées au Sénégal en temps réel.</p>
          </div>
          <a routerLink="/annonces" class="btn-orange text-xs px-5 py-2.5">Ouvrir la carte de recherche</a>
        </div>

        <div class="relative bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl h-[420px]">
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

  onSearchPropertyClick(): void {
    if (this.propertyService.isLoggedIn$.getValue()) {
      this.router.navigate(['/annonces']);
    } else {
      this.propertyService.openAuthModal(
        'register',
        'Créez votre compte chercheur pour enregistrer vos alertes, favoris et contacter directement les propriétaires.',
        '/annonces',
        'tenant'
      );
    }
  }

  onPublishPropertyClick(): void {
    const user = this.propertyService.getCurrentUser();
    if (this.propertyService.isLoggedIn$.getValue() && user && user.role !== 'tenant') {
      this.router.navigate(['/deposer-annonce']);
    } else {
      this.propertyService.openAuthModal(
        'register',
        'Veuillez créer votre compte propriétaire ou vous connecter pour publier votre bien.',
        '/deposer-annonce',
        'owner'
      );
    }
  }

  onCreateSpaceClick(): void {
    const user = this.propertyService.getCurrentUser();
    if (this.propertyService.isLoggedIn$.getValue() && user && (user.role === 'agency' || user.role === 'owner')) {
      this.router.navigate(['/dashboard']);
    } else {
      this.propertyService.openAuthModal(
        'register',
        'Veuillez créer votre compte agence / professionnel ou vous connecter pour accéder à votre espace pro.',
        '/dashboard',
        'agency'
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

  quickSearch(city: string, type: string): void {
    this.searchCity = city;
    this.searchCategory = type;
    this.executeSearch();
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
            <p style="font-size:11px; color:#ea580c; font-weight:bold; margin-top:2px;">${this.countryService.formatPrice(p.price_fcfa)} ${this.countryService.currentCountry.currency}</p>
          </div>
        `);
      }
    });
  }
}

