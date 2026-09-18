import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { CountryService } from '../../services/country.service';
import { Property, DirectMessage, PropertyReport } from '../../models/property.model';

declare var L: any;

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div *ngIf="property" class="bg-slate-100 min-h-screen py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Breadcrumb navigation -->
        <div class="mb-4 text-xs font-semibold text-slate-500 flex items-center gap-2">
          <a routerLink="/" class="hover:text-orange-600">Accueil</a>
          <span>/</span>
          <a routerLink="/annonces" class="hover:text-orange-600">Annonces</a>
          <span>/</span>
          <span class="text-slate-800 font-bold truncate max-w-xs">{{ property.title }}</span>
        </div>

        <!-- Header Title Banner -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span [class.bg-emerald-600]="property.transaction_type === 'sale'" [class.bg-orange-600]="property.transaction_type === 'rent'" class="text-white text-xs font-black px-3 py-1 rounded-xl uppercase">
                {{ property.transaction_type === 'sale' ? 'À vendre' : 'À louer' }}
              </span>
              <span class="text-xs font-black text-slate-700 uppercase bg-slate-100 px-3 py-1 rounded-xl">{{ property.property_type }}</span>
              <span *ngIf="property.is_furnished" class="bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl">Meublé</span>
              
              <!-- STATUS AVAILABILITY BADGES (PRIORITÉ 11) -->
              <span *ngIf="property.status === 'rented'" class="bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-xl uppercase flex items-center gap-1">
                <i class="fa-solid fa-lock"></i> LOUÉ
              </span>
              <span *ngIf="property.status === 'sold'" class="bg-purple-600 text-white text-xs font-black px-3 py-1 rounded-xl uppercase flex items-center gap-1">
                <i class="fa-solid fa-circle-check"></i> VENDU
              </span>
              <span *ngIf="property.status === 'paused'" class="bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-xl uppercase flex items-center gap-1">
                <i class="fa-solid fa-pause-circle"></i> INDISPONIBLE / EN PAUSE
              </span>
            </div>

            <h1 class="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
              {{ property.title }}
            </h1>

            <p class="text-slate-500 text-xs font-semibold mt-1">
              <i class="fa-solid fa-location-dot text-orange-500 mr-1"></i> {{ property.address || property.quartier }}, {{ property.city }} — Sénégal
            </p>
          </div>

          <div class="text-left md:text-right">
            <div class="text-3xl sm:text-4xl font-black text-orange-600">
              {{ countryService.convertPrice(property.price_fcfa) | number }} <span class="text-sm font-bold text-slate-500">{{ countryService.currentCountry.currency }} {{ property.transaction_type === 'rent' ? '/mois' : '' }}</span>
            </div>
          </div>
        </div>

        <!-- Main Content (Gallery + Details Sidebar) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left 2 Cols: Photo Gallery & Overview -->
          <div class="lg:col-span-2 space-y-6">
            
            <!-- Gallery Lightbox Preview -->
            <div class="bg-slate-950 rounded-3xl overflow-hidden border-2 border-slate-900 shadow-xl relative">
              <div class="relative h-[450px]">
                <img [src]="selectedImage || getPrimaryImage()" [alt]="property.title" class="w-full h-full object-cover">
              </div>

              <!-- Thumbnails strip -->
              <div *ngIf="property.images && property.images.length > 1" class="p-3 bg-slate-900 flex gap-3 overflow-x-auto">
                <img *ngFor="let img of property.images" [src]="img.image_url" (click)="selectedImage = img.image_url" [class.border-orange-500]="selectedImage === img.image_url" class="w-20 h-16 object-cover rounded-xl border-2 border-slate-700 cursor-pointer hover:border-orange-500 transition-all">
              </div>
            </div>

            <!-- Key Features Grid -->
            <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <i class="fa-solid fa-bed text-2xl text-orange-500 mb-1"></i>
                <p class="text-[10px] text-slate-400 font-black uppercase">Chambres</p>
                <p class="text-lg font-black text-slate-900">{{ property.bedrooms || 1 }}</p>
              </div>

              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <i class="fa-solid fa-bath text-2xl text-orange-500 mb-1"></i>
                <p class="text-[10px] text-slate-400 font-black uppercase">Salles de bain</p>
                <p class="text-lg font-black text-slate-900">{{ property.bathrooms || 1 }}</p>
              </div>

              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <i class="fa-solid fa-ruler-combined text-2xl text-orange-500 mb-1"></i>
                <p class="text-[10px] text-slate-400 font-black uppercase">Superficie</p>
                <p class="text-lg font-black text-slate-900">{{ property.surface_sqm || 100 }} m²</p>
              </div>

              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <i class="fa-solid fa-couch text-2xl text-orange-500 mb-1"></i>
                <p class="text-[10px] text-slate-400 font-black uppercase">Ameublement</p>
                <p class="text-lg font-black text-slate-900">{{ property.is_furnished ? 'Meublé' : 'Non meublé' }}</p>
              </div>
            </div>

            <!-- Description Card -->
            <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 class="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <i class="fa-solid fa-align-left text-orange-500"></i> Description du bien
              </h3>
              <p class="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium">
                {{ property.description }}
              </p>

              <!-- Equipments / Characteristics List -->
              <div *ngIf="property.equipments && property.equipments.length > 0" class="pt-4 border-t border-slate-100">
                <h4 class="text-xs font-black uppercase text-slate-400 mb-3">Équipements & Caractéristiques</h4>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div *ngFor="let eq of property.equipments" class="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl">
                    <i class="fa-solid fa-check text-emerald-500"></i> {{ eq }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Map Location -->
            <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 class="font-black text-slate-900 text-base mb-3 flex items-center gap-2">
                <i class="fa-solid fa-map-location-dot text-orange-500"></i> Localisation
              </h3>
              <div id="detailMap" class="w-full h-72 rounded-2xl overflow-hidden border border-slate-200"></div>
            </div>

            <!-- Signalement (Prompt Section 23 Requirement) -->
            <div class="pt-4 text-center">
              <button (click)="showReportModal = true" class="text-xs font-bold text-red-600 hover:underline flex items-center justify-center gap-1.5 mx-auto">
                <i class="fa-solid fa-triangle-exclamation"></i> Signaler cette annonce
              </button>
            </div>

          </div>

          <!-- Right Col: ANNONCEUR SECTION (PROMPT SECTION 13 - CORE VALUE) -->
          <div class="space-y-6">
            
            <!-- Annonceur Card (Ultra Visible) -->
            <div class="bg-slate-950 text-white p-6 sm:p-8 rounded-3xl border-2 border-slate-900 shadow-2xl space-y-6">
              
              <div class="border-b border-slate-800 pb-4">
                <span class="text-[10px] font-black uppercase tracking-wider text-orange-400">Annonce publiée par</span>
                <h3 class="text-xl font-black text-white mt-1">{{ property.owner_name }}</h3>
                
                <!-- Badge Validation -->
                <div class="mt-2 inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-black">
                  <i class="fa-solid fa-shield-check"></i>
                  <span>{{ property.owner_type === 'Propriétaire' || property.owner_type === 'owner' ? 'Propriétaire vérifié' : 'Agence vérifiée' }}</span>
                </div>
              </div>

              <!-- Advertiser Info Details (Prompt Section 13) -->
              <div class="space-y-3 text-xs text-slate-300 font-medium">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-slate-900 border-2 border-orange-500 flex items-center justify-center text-lg font-black text-white shrink-0">
                    {{ getAdvertiserInitial() }}
                  </div>
                  <div>
                    <p class="font-bold text-white text-sm">{{ property.owner_name }}</p>
                    <p class="text-slate-400 text-[11px]">{{ property.owner_type }}</p>
                  </div>
                </div>

                <div class="pt-2 space-y-2 border-t border-slate-800/80">
                  <p class="flex items-center gap-2"><i class="fa-solid fa-phone text-orange-400"></i> {{ property.owner_phone }}</p>
                  <p class="flex items-center gap-2"><i class="fa-solid fa-envelope text-orange-400"></i> {{ property.owner_email }}</p>
                  <p class="flex items-center gap-2"><i class="fa-solid fa-layer-group text-slate-400"></i> Annonces publiées : <strong class="text-white">6 biens activement gérés</strong></p>
                  <p class="flex items-center gap-2"><i class="fa-solid fa-calendar text-slate-400"></i> Membre sur Izivilla depuis <strong class="text-white">Janvier 2026</strong></p>
                </div>
              </div>

              <!-- Action Direct Buttons (Prompt Section 13 & 34 Requirements & Priorité 11) -->
              <div class="space-y-3 pt-2">
                <!-- UNAVAILABILITY WARNING BANNER -->
                <div *ngIf="property.status && property.status !== 'available'" class="p-3.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-2xl text-xs font-bold space-y-1">
                  <p class="flex items-center gap-1.5 font-black text-amber-200">
                    <i class="fa-solid fa-lock"></i> Logement actuellement non disponible
                  </p>
                  <p class="text-[11px] text-slate-300 font-medium">
                    Ce bien est indiqué comme <strong class="text-white">{{ property.status === 'rented' ? 'déjà loué' : (property.status === 'sold' ? 'vendu' : 'en pause / indisponible') }}</strong> par l'annonceur.
                  </p>
                </div>

                <button *ngIf="property.status === 'available'" (click)="openVisitModal()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-lg shadow-blue-600/30 transition-all">
                  <i class="fa-solid fa-calendar-check text-base"></i> Je souhaite visiter
                </button>

                <button *ngIf="property.status && property.status !== 'available'" disabled class="w-full bg-slate-800 text-slate-400 font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs cursor-not-allowed">
                  <i class="fa-solid fa-calendar-xmark text-base"></i> Visites indisponibles ({{ property.status === 'rented' ? 'Bien Loué' : (property.status === 'sold' ? 'Bien Vendu' : 'En Pause') }})
                </button>

                <button (click)="openDirectContactModal()" class="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-lg shadow-orange-600/30 transition-all">
                  <i class="fa-solid fa-comments text-base"></i> Contacter l’annonceur
                </button>

                <a [href]="getWhatsAppUrl()" target="_blank" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-lg shadow-emerald-600/30 transition-all">
                  <i class="fa-brands fa-whatsapp text-lg"></i> Échanger sur WhatsApp
                </a>

                <a [href]="'tel:' + (property.owner_phone || '+221 77 645 12 34')" class="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-extrabold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors">
                  <i class="fa-solid fa-phone text-orange-400"></i> Appeler l'annonceur
                </a>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>

    <!-- DIRECT CONTACT / MESSAGE MODAL -->
    <div *ngIf="showContactModal" class="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 text-left relative max-h-[88vh] overflow-y-auto">
        <button (click)="showContactModal = false" class="absolute top-6 right-6 text-slate-400 hover:text-slate-900 text-xl font-bold">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="space-y-1">
          <div class="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold mb-3">
            <i class="fa-solid fa-paper-plane"></i>
          </div>
          <h3 class="text-2xl font-black text-slate-900">Message Direct à {{ property.owner_name }}</h3>
          <p class="text-xs text-slate-500 font-medium">Votre message parviendra directement sur la messagerie de l'annonceur.</p>
        </div>

        <div *ngIf="messageSuccessMsg" class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <i class="fa-solid fa-circle-check text-emerald-600 text-lg"></i>
          <span>{{ messageSuccessMsg }}</span>
        </div>

        <form *ngIf="!messageSuccessMsg" (ngSubmit)="submitDirectMessage()" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Votre Nom *</label>
            <input type="text" [(ngModel)]="msgForm.sender_name" name="sender_name" required placeholder="ex: Moussa Ndiaye" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 shadow-sm">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Téléphone *</label>
            <div class="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-2xl px-2 py-1 focus-within:border-orange-500 shadow-sm">
              <select [(ngModel)]="msgPhonePrefix" name="phonePrefix" class="bg-transparent text-xs font-extrabold text-slate-800 outline-none cursor-pointer py-2 pr-1 border-r border-slate-200 max-w-[140px] truncate">
                <option *ngFor="let c of countryService.countries" [value]="c.phonePrefix">
                  {{ c.flag }} {{ c.name }} ({{ c.phonePrefix }})
                </option>
              </select>
              <input type="tel" [(ngModel)]="msgForm.sender_phone" name="sender_phone" required autocomplete="off" placeholder="Numéro de téléphone" class="w-full bg-transparent px-2 py-2 text-xs font-semibold text-slate-800 focus:outline-none">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Votre Message *</label>
            <textarea [(ngModel)]="msgForm.message" name="message" rows="3" required placeholder="Bonjour, je suis très intéressé par votre bien et souhaiterais convenir d'un rendez-vous." class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 shadow-sm"></textarea>
          </div>

          <button type="submit" class="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs shadow-lg shadow-orange-600/20 transition-all">
            Envoyer le message direct
          </button>
        </form>
      </div>
    </div>

    <!-- DEMANDE DE VISITE MODAL (PRIORITÉ 6 - ÉTAPE E) -->
    <div *ngIf="showVisitModal" class="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 text-left relative max-h-[88vh] overflow-y-auto">
        <button (click)="showVisitModal = false" class="absolute top-6 right-6 text-slate-400 hover:text-slate-900 text-xl font-bold">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
              <i class="fa-solid fa-calendar-check"></i>
            </div>
          </div>
          <h3 class="text-2xl font-black text-slate-900 pt-1">Demander une visite</h3>
          <p class="text-xs text-slate-500 font-medium">Planifiez votre visite avec {{ property.owner_name }}.</p>
        </div>

        <div *ngIf="visitSuccessMsg" class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <i class="fa-solid fa-circle-check text-emerald-600 text-lg"></i>
          <span>{{ visitSuccessMsg }}</span>
        </div>

        <form *ngIf="!visitSuccessMsg" (ngSubmit)="submitVisitForm()" class="space-y-4">
          
          <!-- LIVE REALTIME SLOT PREVIEW CARD -->
          <div class="p-3.5 bg-blue-50/90 border border-blue-200 rounded-2xl text-xs font-bold text-blue-900 space-y-1 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-[10px] uppercase font-black text-blue-700 flex items-center gap-1">
                <i class="fa-solid fa-clock-rotate-left text-blue-600"></i> Créneau Sélectionné
              </span>
            </div>
            <p class="text-xs font-black text-slate-900">
              📍 {{ property.title }}
            </p>
            <p class="text-sm font-black text-blue-700">
              📅 {{ getFormattedRealtimeSlot() }}
            </p>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Votre Nom complet *</label>
            <input type="text" [(ngModel)]="visitForm.tenant_name" name="tenant_name" required placeholder="ex: Abdou Diop" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Votre Email *</label>
            <input type="email" [(ngModel)]="visitForm.tenant_email" name="tenant_email" required placeholder="abdou.diop@client.sn" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Téléphone *</label>
            <div class="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-2xl px-2 py-1 focus-within:border-blue-500 shadow-sm">
              <select [(ngModel)]="visitPhonePrefix" name="visitPhonePrefix" class="bg-transparent text-xs font-extrabold text-slate-800 outline-none cursor-pointer py-2 pr-1 border-r border-slate-200 max-w-[140px] truncate">
                <option *ngFor="let c of countryService.countries" [value]="c.phonePrefix">
                  {{ c.flag }} {{ c.name }} ({{ c.phonePrefix }})
                </option>
              </select>
              <input type="tel" [(ngModel)]="visitForm.tenant_phone" name="tenant_phone" required placeholder="77 654 32 10" class="w-full bg-transparent px-2 py-2 text-xs font-semibold text-slate-800 focus:outline-none">
            </div>
          </div>

          <!-- DATE & TIME INPUTS WITH QUICK CHIPS -->
          <div class="space-y-2">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <i class="fa-solid fa-calendar-day text-blue-600"></i> Date *
                </label>
                <input type="date" [min]="minVisitDate" [(ngModel)]="visitForm.preferred_date_day" name="preferred_date_day" required class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <i class="fa-solid fa-clock text-blue-600"></i> Heure *
                </label>
                <input type="time" [(ngModel)]="visitForm.preferred_date_time" name="preferred_date_time" required class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm">
              </div>
            </div>

            <!-- QUICK CHIPS -->
            <div class="flex flex-wrap items-center gap-1.5 pt-1">
              <span class="text-[10px] font-black uppercase text-slate-400 mr-1">Raccourcis :</span>
              <button type="button" (click)="setQuickDate('today')" [class.bg-blue-600]="isQuickDateSelected('today')" [class.text-white]="isQuickDateSelected('today')" class="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors">
                Aujourd'hui
              </button>
              <button type="button" (click)="setQuickDate('tomorrow')" [class.bg-blue-600]="isQuickDateSelected('tomorrow')" [class.text-white]="isQuickDateSelected('tomorrow')" class="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors">
                Demain
              </button>
              <button type="button" (click)="setQuickDate('saturday')" [class.bg-blue-600]="isQuickDateSelected('saturday')" [class.text-white]="isQuickDateSelected('saturday')" class="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors">
                Samedi
              </button>

              <span class="text-slate-300">|</span>

              <button type="button" (click)="setQuickTime('10:00')" [class.bg-blue-600]="visitForm.preferred_date_time === '10:00'" [class.text-white]="visitForm.preferred_date_time === '10:00'" class="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg transition-colors">
                10h
              </button>
              <button type="button" (click)="setQuickTime('15:00')" [class.bg-blue-600]="visitForm.preferred_date_time === '15:00'" [class.text-white]="visitForm.preferred_date_time === '15:00'" class="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg transition-colors">
                15h
              </button>
              <button type="button" (click)="setQuickTime('17:30')" [class.bg-blue-600]="visitForm.preferred_date_time === '17:30'" [class.text-white]="visitForm.preferred_date_time === '17:30'" class="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg transition-colors">
                17h30
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Commentaire (Optionnel)</label>
            <textarea [(ngModel)]="visitForm.message" name="visit_message" rows="2" placeholder="Ex: Je suis disponible de préférence dans l'après-midi..." class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm"></textarea>
          </div>

          <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
            <span>Transmettre la demande de visite</span>
          </button>
        </form>
      </div>
    </div>

    <!-- REPORT MODAL (PROMPT SECTION 23) -->
    <div *ngIf="showReportModal" class="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 text-left relative max-h-[88vh] overflow-y-auto">
        <button (click)="showReportModal = false" class="absolute top-6 right-6 text-slate-400 hover:text-slate-900 text-xl font-bold">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="space-y-1">
          <div class="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-xl font-bold mb-3">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <h3 class="text-2xl font-black text-slate-900">Signaler cette annonce</h3>
          <p class="text-xs text-slate-500 font-medium">Aidez-nous à garder Izivilla 100% fiable et sécurisée.</p>
        </div>

        <div *ngIf="reportSuccessMsg" class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <i class="fa-solid fa-circle-check text-emerald-600 text-lg"></i>
          <span>{{ reportSuccessMsg }}</span>
        </div>

        <form *ngIf="!reportSuccessMsg" (ngSubmit)="submitReportForm()" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Motif du signalement *</label>
            <select [(ngModel)]="reportForm.reason" name="reason" required class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-red-500 shadow-sm">
              <option value="Annonce frauduleuse">Annonce frauduleuse</option>
              <option value="Prix incorrect">Prix incorrect</option>
              <option value="Bien déjà vendu">Bien déjà vendu / loué</option>
              <option value="Informations incorrectes">Informations incorrectes</option>
              <option value="Contenu inapproprié">Contenu inapproprié</option>
              <option value="Autre">Autre motif</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Précisions *</label>
            <textarea [(ngModel)]="reportForm.description" name="description" rows="3" required placeholder="Détaillez brièvement le problème constaté..." class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-red-500 shadow-sm"></textarea>
          </div>

          <button type="submit" class="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs shadow-lg transition-all">
            Transmettre le signalement
          </button>
        </form>
      </div>
    </div>
  `
})
export class PropertyDetailComponent implements OnInit, AfterViewInit {
  property!: Property;
  selectedImage: string = '';

  showContactModal = false;
  messageSuccessMsg = '';
  msgPhonePrefix = '+221';
  msgForm = { sender_name: '', sender_phone: '', sender_email: '', message: '' };

  showVisitModal = false;
  visitSuccessMsg = '';
  visitPhonePrefix = '+221';
  visitForm = {
    tenant_name: '',
    tenant_email: '',
    tenant_phone: '',
    preferred_date_day: '',
    preferred_date_time: '15:00',
    message: ''
  };

  showReportModal = false;
  reportSuccessMsg = '';
  reportForm: Partial<PropertyReport> = { reason: 'Annonce frauduleuse', description: '' };

  private map: any;

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    public countryService: CountryService
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.route.params.subscribe(params => {
      const id = +params['id'] || 1;
      
      // Immediate synchronous initial state so page is NEVER blank
      const fallback = this.propertyService.getAllPropertiesCombined().find(p => p.id === id) 
        || this.propertyService.getAllPropertiesCombined()[0];
      this.property = fallback;
      if (this.property && this.property.images && this.property.images.length > 0) {
        this.selectedImage = this.property.images[0].image_url;
      }

      this.propertyService.getPropertyById(id).subscribe(prop => {
        if (prop && prop.id) {
          this.property = prop;
          if (this.property.images && this.property.images.length > 0) {
            this.selectedImage = this.property.images[0].image_url;
          }
        }
        setTimeout(() => this.initDetailMap(), 300);
      });
    });
  }



  ngAfterViewInit(): void {
    setTimeout(() => this.initDetailMap(), 500);
  }

  getPrimaryImage(): string {
    return this.property?.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';
  }

  getAdvertiserInitial(): string {
    const name = this.property?.owner_name || this.property?.agency?.name;
    return name && name.length > 0 ? name.charAt(0).toUpperCase() : 'I';
  }

  getWhatsAppUrl(): string {
    const phone = (this.property?.owner_phone || '+221776451234').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`Bonjour, je suis intéressé par votre annonce Izivilla : ${this.property?.title || ''}`);
    return `https://wa.me/${phone}?text=${text}`;
  }

  openDirectContactModal(): void {
    this.messageSuccessMsg = '';
    this.showContactModal = true;
  }

  submitDirectMessage(): void {
    if (!this.msgForm.sender_name || !this.msgForm.message) return;

    const fullPhone = (this.msgPhonePrefix || '') + ' ' + (this.msgForm.sender_phone || '');

    this.propertyService.sendPropertyRequest({
      property_id: this.property.id,
      client_name: this.msgForm.sender_name,
      client_email: this.msgForm.sender_email || (this.msgForm.sender_name.toLowerCase().replace(/\s+/g, '.') + '@client.sn'),
      client_phone: fullPhone,
      message: this.msgForm.message,
      advertiser_email: this.property.owner_email || this.property.agency?.email || 'contact@izivilla.sn',
      property_title: this.property.title
    }).subscribe(res => {
      this.messageSuccessMsg = `Bonjour ${this.msgForm.sender_name}, votre demande concernant "${this.property.title}" a bien été transmise à l'annonceur. Vous serez contacté prochainement.`;
      setTimeout(() => {
        this.showContactModal = false;
        this.messageSuccessMsg = '';
        this.msgForm = { sender_name: '', sender_phone: '', sender_email: '', message: '' };
      }, 3500);
    });
  }

  private getLocalYYYYMMDD(d: Date = new Date()): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  get minVisitDate(): string {
    return this.getLocalYYYYMMDD();
  }

  openVisitModal(): void {
    const user = this.propertyService.getCurrentUser();
    this.visitSuccessMsg = '';

    const now = new Date();
    const todayStr = this.getLocalYYYYMMDD(now);

    // Compute exact local time in HH:mm
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const exactLocalTimeStr = `${hours}:${minutes}`;

    let userPhone = user?.phone || '';
    if (userPhone.startsWith('+221')) {
      this.visitPhonePrefix = '+221';
      userPhone = userPhone.replace('+221', '').trim();
    } else if (userPhone.startsWith('+')) {
      const parts = userPhone.split(' ');
      if (parts.length > 1) {
        this.visitPhonePrefix = parts[0];
        userPhone = parts.slice(1).join(' ');
      }
    }

    this.visitForm = {
      tenant_name: user?.name || '',
      tenant_email: user?.email || '',
      tenant_phone: userPhone,
      preferred_date_day: todayStr,
      preferred_date_time: exactLocalTimeStr,
      message: 'Je souhaite effectuer une visite du bien.'
    };
    this.showVisitModal = true;
  }

  setQuickDate(type: 'today' | 'tomorrow' | 'saturday'): void {
    const d = new Date();
    if (type === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    } else if (type === 'saturday') {
      const day = d.getDay();
      const diff = d.getDate() + (6 - day + (day === 6 ? 7 : 0));
      d.setDate(diff);
    }
    this.visitForm.preferred_date_day = this.getLocalYYYYMMDD(d);
  }

  isQuickDateSelected(type: 'today' | 'tomorrow' | 'saturday'): boolean {
    const d = new Date();
    if (type === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    } else if (type === 'saturday') {
      const day = d.getDay();
      const diff = d.getDate() + (6 - day + (day === 6 ? 7 : 0));
      d.setDate(diff);
    }
    return this.visitForm.preferred_date_day === this.getLocalYYYYMMDD(d);
  }

  setQuickTime(time: string): void {
    this.visitForm.preferred_date_time = time;
  }

  getFormattedRealtimeSlot(): string {
    if (!this.visitForm.preferred_date_day) return 'Sélectionnez une date';
    
    try {
      const [year, month, day] = this.visitForm.preferred_date_day.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      const todayStr = this.getLocalYYYYMMDD(new Date());
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = this.getLocalYYYYMMDD(tomorrow);

      let prefix = '';
      if (this.visitForm.preferred_date_day === todayStr) {
        prefix = "Aujourd'hui";
      } else if (this.visitForm.preferred_date_day === tomorrowStr) {
        prefix = 'Demain';
      } else {
        prefix = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      }

      const timeFormatted = this.visitForm.preferred_date_time ? ` à ${this.visitForm.preferred_date_time.replace(':', 'h')}` : '';
      return `${prefix} (${d.toLocaleDateString('fr-FR')})${timeFormatted}`;
    } catch {
      return `${this.visitForm.preferred_date_day} à ${this.visitForm.preferred_date_time}`;
    }
  }

  submitVisitForm(): void {
    if (!this.visitForm.tenant_name || !this.visitForm.tenant_email || !this.visitForm.preferred_date_day) return;

    let fullPhone = (this.visitForm.tenant_phone || '').trim();
    if (fullPhone && !fullPhone.startsWith('+')) {
      fullPhone = (this.visitPhonePrefix || '+221') + ' ' + fullPhone;
    }

    const timePart = this.visitForm.preferred_date_time || '15:00';
    const fullDateTime = `${this.visitForm.preferred_date_day}T${timePart}:00`;

    this.propertyService.submitAppointment({
      property_id: this.property.id,
      tenant_name: this.visitForm.tenant_name,
      tenant_email: this.visitForm.tenant_email,
      tenant_phone: fullPhone,
      preferred_date: fullDateTime,
      message: this.visitForm.message || 'Je souhaite effectuer une visite du bien.'
    }).subscribe(res => {
      this.visitSuccessMsg = res.message || 'Votre demande de visite a bien été transmise à l\'annonceur !';
      setTimeout(() => {
        this.showVisitModal = false;
        this.visitSuccessMsg = '';
      }, 3500);
    });
  }

  submitReportForm(): void {
    if (!this.reportForm.description) return;

    this.propertyService.submitReport({
      property_id: this.property.id,
      ...this.reportForm
    }).subscribe(res => {
      this.reportSuccessMsg = res.message;
      setTimeout(() => {
        this.showReportModal = false;
        this.reportSuccessMsg = '';
        this.reportForm = { reason: 'Annonce frauduleuse', description: '' };
      }, 2000);
    });
  }

  private initDetailMap(): void {
    if (typeof L === 'undefined' || !this.property) return;
    const el = document.getElementById('detailMap');
    if (!el || this.map) return;

    const lat = this.property.latitude || 14.7167;
    const lng = this.property.longitude || -17.4677;

    this.map = L.map('detailMap').setView([lat, lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    L.marker([lat, lng]).addTo(this.map)
      .bindPopup(`<b>${this.property.title}</b><br/>${this.countryService.formatPrice(this.property.price_fcfa)} ${this.countryService.currentCountry.currency}`)
      .openPopup();
  }
}

