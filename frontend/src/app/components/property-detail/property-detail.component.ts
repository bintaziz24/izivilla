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
              {{ property.price_fcfa | number }} <span class="text-sm font-bold text-slate-500">{{ countryService.currentCountry.currency }} {{ property.transaction_type === 'rent' ? '/mois' : '' }}</span>
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

              <!-- Action Direct Buttons (Prompt Section 13 & 34 Requirements) -->
              <div class="space-y-3 pt-2">
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
    <div *ngIf="showContactModal" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 text-left relative">
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

    <!-- REPORT MODAL (PROMPT SECTION 23) -->
    <div *ngIf="showReportModal" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 text-left relative">
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
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.propertyService.getPropertyById(id).subscribe(prop => {
        this.property = prop;
        if (prop.images && prop.images.length > 0) {
          this.selectedImage = prop.images[0].image_url;
        }
        setTimeout(() => this.initDetailMap(), 400);
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

    this.propertyService.sendDirectMessage({
      property_id: this.property.id,
      receiver_name: this.property.owner_name,
      property_title: this.property.title,
      ...this.msgForm
    }).subscribe(res => {
      this.messageSuccessMsg = res.message;
      setTimeout(() => {
        this.showContactModal = false;
        this.messageSuccessMsg = '';
        this.msgForm = { sender_name: '', sender_phone: '', sender_email: '', message: '' };
      }, 2000);
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
      .bindPopup(`<b>${this.property.title}</b><br/>${this.property.price_fcfa.toLocaleString()} FCFA`)
      .openPopup();
  }
}

