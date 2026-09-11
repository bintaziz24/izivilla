import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { LanguageService } from '../../services/language.service';
import { CountryService } from '../../services/country.service';
import { Property, PropertyAlert, AppointmentRequest, DirectMessage } from '../../models/property.model';

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="bg-slate-100 min-h-screen py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <!-- Header Banner -->
        <div class="bg-slate-950 text-white p-8 rounded-3xl border-2 border-slate-900 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="bg-orange-600 text-white text-xs font-black uppercase px-2.5 py-0.5 rounded-full">Espace Chercheur & Locataire</span>
              <span class="text-slate-400 text-xs font-semibold">• Izivilla Direct</span>
            </div>
            <h1 class="text-3xl font-black text-white tracking-tight">Mon Espace Personnel</h1>
            <p class="text-slate-400 text-xs mt-1">Gérez vos biens favoris, vos messages directs avec les annonceurs et vos alertes email.</p>
          </div>

          <div class="flex items-center gap-3">
            <button (click)="activeTab = 'alerts'; showCreateAlertModal = true" class="btn-orange py-3.5 px-6 rounded-xl font-bold text-sm shadow-lg">
              <i class="fa-solid fa-bell text-lg"></i> Créer une alerte email
            </button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2 text-xs font-extrabold">
          
          <button (click)="activeTab = 'messages'" 
                  [class.bg-slate-950]="activeTab === 'messages'"
                  [class.text-white]="activeTab === 'messages'"
                  [class.text-slate-600]="activeTab !== 'messages'"
                  class="px-5 py-3 rounded-xl transition-all flex items-center gap-2">
            <i class="fa-solid fa-comments text-orange-500"></i>
            <span>Messages & Contacts Directs</span>
            <span class="bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black ml-1">{{ directMessages.length }}</span>
          </button>

          <button (click)="activeTab = 'appointments'" 
                  [class.bg-slate-950]="activeTab === 'appointments'"
                  [class.text-white]="activeTab === 'appointments'"
                  [class.text-slate-600]="activeTab !== 'appointments'"
                  class="px-5 py-3 rounded-xl transition-all flex items-center gap-2">
            <i class="fa-solid fa-calendar-check text-orange-500"></i>
            <span>Demandes de visite</span>
            <span class="bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black ml-1">{{ appointments.length }}</span>
          </button>

          <button (click)="activeTab = 'favorites'" 
                  [class.bg-slate-950]="activeTab === 'favorites'"
                  [class.text-white]="activeTab === 'favorites'"
                  [class.text-slate-600]="activeTab !== 'favorites'"
                  class="px-5 py-3 rounded-xl transition-all flex items-center gap-2">
            <i class="fa-solid fa-heart text-orange-500"></i>
            <span>Biens favoris</span>
            <span class="bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black ml-1">{{ favoriteProperties.length }}</span>
          </button>

          <button (click)="activeTab = 'alerts'" 
                  [class.bg-slate-950]="activeTab === 'alerts'"
                  [class.text-white]="activeTab === 'alerts'"
                  [class.text-slate-600]="activeTab !== 'alerts'"
                  class="px-5 py-3 rounded-xl transition-all flex items-center gap-2">
            <i class="fa-solid fa-bell text-orange-500"></i>
            <span>Alertes email</span>
            <span class="bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black ml-1">{{ alerts.length }}</span>
          </button>

        </div>

        <!-- TAB 0: MESSAGES DIRECTS -->
        <div *ngIf="activeTab === 'messages'" class="space-y-6">
          <div *ngIf="directMessages.length === 0" class="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
            <div class="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
              <i class="fa-solid fa-comments"></i>
            </div>
            <h3 class="text-xl font-bold text-slate-900">Aucun message direct envoyé</h3>
            <p class="text-slate-500 text-xs max-w-md mx-auto">Lorsque vous contactez directement un annonceur via le formulaire de message, la discussion s'affiche ici.</p>
            <a routerLink="/annonces" class="btn-orange text-xs px-6 py-3 rounded-xl inline-flex items-center gap-2 font-bold">
              <i class="fa-solid fa-magnifying-glass"></i> Parcourir les annonces
            </a>
          </div>

          <div *ngIf="directMessages.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div *ngFor="let msg of directMessages" class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div class="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span class="text-xs font-black text-orange-600 uppercase">Bien #{{ msg.property_id }}</span>
                  <h4 class="font-extrabold text-slate-900 text-base mt-0.5">Contact avec l'annonceur</h4>
                  <p class="text-[11px] text-slate-400 font-semibold">{{ msg.created_at | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
                <span class="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                  Transmis à l'annonceur
                </span>
              </div>

              <div class="bg-slate-50 p-4 rounded-2xl text-xs text-slate-700 font-medium space-y-1">
                <p class="font-bold text-slate-900">Votre message :</p>
                <p class="italic">"{{ msg.message }}"</p>
              </div>

              <div class="flex items-center justify-between text-xs pt-2">
                <span class="text-slate-500 font-semibold"><i class="fa-solid fa-user mr-1 text-orange-500"></i> {{ msg.sender_name }}</span>
                <span class="text-slate-500 font-semibold"><i class="fa-solid fa-phone mr-1 text-emerald-500"></i> {{ msg.sender_phone }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 1: MES DEMANDES DE VISITE -->
        <div *ngIf="activeTab === 'appointments'" class="space-y-6">
          <div *ngIf="appointments.length === 0" class="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
            <div class="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
              <i class="fa-solid fa-calendar-xmark"></i>
            </div>
            <h3 class="text-xl font-bold text-slate-900">Aucune demande de visite enregistrée</h3>
            <a routerLink="/annonces" class="btn-dark text-xs px-6 py-3 rounded-xl inline-flex items-center gap-2">
              <i class="fa-solid fa-magnifying-glass"></i> Voir le catalogue
            </a>
          </div>

          <div *ngIf="appointments.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div *ngFor="let app of appointments" class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div class="p-6 space-y-4">
                <div class="flex justify-between items-start gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span [ngClass]="{
                      'bg-amber-100 text-amber-800 border-amber-300': app.status === 'pending',
                      'bg-emerald-100 text-emerald-800 border-emerald-300': app.status === 'confirmed',
                      'bg-red-100 text-red-800 border-red-300': app.status === 'cancelled'
                    }" class="px-3 py-1 rounded-full text-[11px] font-black uppercase border inline-flex items-center gap-1.5">
                      <i *ngIf="app.status === 'pending'" class="fa-solid fa-clock"></i>
                      <i *ngIf="app.status === 'confirmed'" class="fa-solid fa-circle-check"></i>
                      <i *ngIf="app.status === 'cancelled'" class="fa-solid fa-circle-xmark"></i>
                      <span>{{ app.status === 'pending' ? 'En attente de confirmation' : (app.status === 'confirmed' ? 'Visite Confirmée' : 'Annulée') }}</span>
                    </span>
                    <p class="text-xs text-slate-400 font-semibold mt-2">Demande n°#VIS-00{{ app.id }} • {{ app.created_at | date:'dd/MM/yyyy' }}</p>
                  </div>
                  
                  <span class="text-xs font-extrabold text-orange-600 bg-orange-50 px-3 py-1 rounded-xl">
                    <i class="fa-solid fa-calendar-day mr-1"></i> {{ app.preferred_date | date:'dd/MM/yyyy' }}
                  </span>
                </div>

                <div *ngIf="app.property" class="flex gap-4 items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <img [src]="getPrimaryImage(app.property)" class="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0">
                  <div>
                    <a [routerLink]="['/annonces', app.property.id]" class="font-extrabold text-slate-900 text-sm hover:text-orange-600 line-clamp-1">
                      {{ app.property.title }}
                    </a>
                    <p class="text-xs font-bold text-orange-600 mt-0.5">{{ app.property.price_fcfa | number }} FCFA</p>
                    <p class="text-[11px] text-slate-500 font-medium"><i class="fa-solid fa-location-dot text-orange-500 mr-1"></i> {{ app.property.quartier }}, {{ app.property.city }}</p>
                  </div>
                </div>

                <div class="text-xs text-slate-600 bg-slate-100/60 p-3 rounded-xl">
                  <span class="font-bold text-slate-800">Message envoyé :</span> "{{ app.message || 'Aucun message spécifique' }}"
                </div>
              </div>

              <div class="bg-slate-900 text-white p-4 px-6 flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-300">
                  <i class="fa-solid fa-user-check text-orange-500 mr-1"></i> {{ app.property?.owner_name || 'Annonceur Direct' }}
                </span>
                <a [href]="getWhatsAppUrl(app.property)" target="_blank" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                  <i class="fa-brands fa-whatsapp"></i> WhatsApp Direct
                </a>
              </div>

            </div>
          </div>
        </div>

        <!-- TAB 2: MES BIENS FAVORIS -->
        <div *ngIf="activeTab === 'favorites'" class="space-y-6">
          <div *ngIf="favoriteProperties.length === 0" class="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
            <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
              <i class="fa-regular fa-heart"></i>
            </div>
            <h3 class="text-xl font-bold text-slate-900">Aucun logement en favoris</h3>
            <p class="text-slate-500 text-xs max-w-md mx-auto">Cliquez sur le cœur d'un bien pour le sauvegarder dans votre liste de souhaits.</p>
            <a routerLink="/annonces" class="btn-dark text-xs px-6 py-3 rounded-xl inline-flex items-center gap-2">
              <i class="fa-solid fa-magnifying-glass"></i> Parcourir le catalogue
            </a>
          </div>

          <div *ngIf="favoriteProperties.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div *ngFor="let prop of favoriteProperties" class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group relative">
              
              <div class="relative h-48 bg-slate-950">
                <img [src]="getPrimaryImage(prop)" [alt]="prop.title" class="w-full h-full object-cover">
                <button (click)="removeFavorite(prop.id)" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white text-red-600 flex items-center justify-center shadow hover:scale-110 transition-transform">
                  <i class="fa-solid fa-trash-can text-sm"></i>
                </button>
              </div>

              <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span class="text-xl font-black text-orange-600">{{ prop.price_fcfa | number }} <span class="text-xs font-bold text-slate-500">{{ countryService.currentCountry.currency }}</span></span>
                  <h3 class="font-extrabold text-slate-900 text-base mt-1 line-clamp-1">{{ prop.title }}</h3>
                  <p class="text-slate-500 text-xs mt-1"><i class="fa-solid fa-location-dot text-orange-500 mr-1"></i> {{ prop.quartier }}, {{ prop.city }}</p>
                </div>

                <a [routerLink]="['/annonces', prop.id]" class="btn-orange text-xs w-full py-2.5 justify-center rounded-xl font-bold">
                  Voir l'annonce
                </a>
              </div>

            </div>
          </div>
        </div>

        <!-- TAB 3: MES ALERTES EMAIL -->
        <div *ngIf="activeTab === 'alerts'" class="space-y-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h3 class="font-extrabold text-slate-900 text-lg">Vos abonnements aux alertes email</h3>
              <p class="text-slate-500 text-xs mt-0.5">Recevez une notification instantanée dès qu'un propriétaire publie un bien correspondant à vos critères.</p>
            </div>
            <button (click)="showCreateAlertModal = true" class="btn-orange text-xs px-5 py-3 rounded-xl font-bold">
              <i class="fa-solid fa-plus-circle mr-1"></i> Nouvelle Alerte
            </button>
          </div>

          <div *ngIf="alerts.length === 0" class="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
            <div class="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
              <i class="fa-solid fa-bell-slash"></i>
            </div>
            <h3 class="text-xl font-bold text-slate-900">Aucune alerte email configurée</h3>
            <p class="text-slate-500 text-xs max-w-md mx-auto">Définissez vos critères de recherche pour recevoir un email dès qu'un bien correspondant est publié.</p>
            <button (click)="showCreateAlertModal = true" class="btn-orange text-xs px-6 py-3 rounded-xl inline-flex items-center gap-2 font-bold">
              <i class="fa-solid fa-plus-circle"></i> Créer ma première alerte
            </button>
          </div>

          <div *ngIf="alerts.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div *ngFor="let alert of alerts" class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 relative">
              <div class="flex justify-between items-start border-b border-slate-100 pb-3">
                <div class="flex items-center gap-2">
                  <div class="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-lg font-bold">
                    <i class="fa-solid fa-bell"></i>
                  </div>
                  <div>
                    <h4 class="font-extrabold text-slate-900 text-base">Alerte : {{ alert.city || 'Toutes les villes' }}</h4>
                    <p class="text-[11px] text-slate-400 font-semibold">{{ alert.user_email }}</p>
                  </div>
                </div>

                <button (click)="deleteAlert(alert.id)" class="text-slate-400 hover:text-red-600 p-2 text-sm transition-colors" title="Supprimer l'alerte">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span class="text-[10px] text-slate-400 uppercase font-black block">Ville & Quartier</span>
                  <span>{{ alert.city || 'Toutes' }} {{ alert.quartier ? '(' + alert.quartier + ')' : '' }}</span>
                </div>

                <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span class="text-[10px] text-slate-400 uppercase font-black block">Type de logement</span>
                  <span>{{ alert.property_type || 'Tous les types' }}</span>
                </div>

                <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span class="text-[10px] text-slate-400 uppercase font-black block">Budget Maximal</span>
                  <span class="text-orange-600 font-black">{{ (alert.max_price | number) || 'Sans limite' }} FCFA</span>
                </div>

                <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span class="text-[10px] text-slate-400 uppercase font-black block">Option Meublé</span>
                  <span>{{ alert.is_furnished ? 'Meublé uniquement' : 'Tous' }}</span>
                </div>
              </div>

              <div class="flex items-center justify-between text-[11px] text-slate-400 pt-2">
                <span>Statut : <strong class="text-emerald-600">Active</strong></span>
                <span>Créée le {{ alert.created_at | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- CREATE ALERT MODAL -->
      <div *ngIf="showCreateAlertModal" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 text-left relative">
          
          <button (click)="showCreateAlertModal = false" class="absolute top-6 right-6 text-slate-400 hover:text-slate-900 text-xl font-bold">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <div class="space-y-1">
            <div class="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold mb-3">
              <i class="fa-solid fa-bell"></i>
            </div>
            <h3 class="text-2xl font-black text-slate-900">Créer une Alerte Email sur Mesure</h3>
            <p class="text-xs text-slate-500 font-medium">Définissez vos critères de recherche et soyez prévenu avant tout le monde.</p>
          </div>

          <div *ngIf="alertCreatedMsg" class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <i class="fa-solid fa-circle-check text-emerald-600 text-lg"></i>
            <span>{{ alertCreatedMsg }}</span>
          </div>

          <form *ngIf="!alertCreatedMsg" (ngSubmit)="submitAlertForm()" class="space-y-4">
            
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Votre Adresse Email *</label>
              <input type="email" [(ngModel)]="newAlert.user_email" name="user_email" required placeholder="moussa@exemple.sn" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 shadow-sm">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Ville souhaitée</label>
                <select [(ngModel)]="newAlert.city" name="city" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-orange-500">
                  <option value="">Toutes les villes</option>
                  <option value="Dakar">Dakar</option>
                  <option value="Saly">Saly / Mbour</option>
                  <option value="Thiès">Thiès</option>
                  <option value="Rufisque">Rufisque</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Quartier (Optionnel)</label>
                <input type="text" [(ngModel)]="newAlert.quartier" name="quartier" placeholder="ex: Almadies" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 shadow-sm">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Type de bien</label>
                <select [(ngModel)]="newAlert.property_type" name="property_type" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-orange-500">
                  <option value="">Tous les types</option>
                  <option value="Studio">Studio</option>
                  <option value="F2">F2 (1 Chambre)</option>
                  <option value="F3">F3 (2 Chambres)</option>
                  <option value="F4">F4 (3 Chambres)</option>
                  <option value="Villa">Villa</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Budget Max ({{ countryService.currentCountry.currency }})</label>
                <input type="number" [(ngModel)]="newAlert.max_price" name="max_price" placeholder="750000" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500 shadow-sm">
              </div>
            </div>

            <div class="pt-2">
              <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input type="checkbox" [(ngModel)]="newAlert.is_furnished" name="is_furnished" class="w-4 h-4 accent-orange-600 rounded">
                <span>Logement meublé uniquement</span>
              </label>
            </div>

            <button type="submit" class="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs shadow-lg shadow-orange-600/20 transition-all">
              Activer mon alerte email
            </button>
          </form>

        </div>
      </div>

    </div>
  `
})
export class TenantDashboardComponent implements OnInit {
  activeTab: 'messages' | 'appointments' | 'favorites' | 'alerts' = 'messages';
  
  directMessages: DirectMessage[] = [
    {
      id: 1,
      property_id: 1,
      sender_name: 'Cheikh Ndiaye',
      sender_email: 'cheikh@gmail.com',
      sender_phone: '+221 77 123 45 67',
      message: 'Bonjour, je suis très intéressé par cet appartement aux Almadies. Est-il disponible pour une visite ce samedi ?',
      created_at: new Date().toISOString()
    }
  ];

  appointments: AppointmentRequest[] = [];
  favoriteProperties: Property[] = [];
  alerts: PropertyAlert[] = [];

  showCreateAlertModal = false;
  alertCreatedMsg = '';

  newAlert: any = {
    user_email: 'moussa@gmail.com',
    city: 'Dakar',
    quartier: 'Almadies',
    property_type: 'F4',
    max_price: 1000000,
    is_furnished: true
  };

  constructor(
    private propertyService: PropertyService,
    public langService: LanguageService,
    public countryService: CountryService
  ) {}

  t(key: string): string {
    return this.langService.translate(key);
  }

  ngOnInit(): void {
    this.loadTenantData();
  }

  loadTenantData(): void {
    const tenantEmail = 'moussa@gmail.com';

    this.propertyService.getTenantAppointments(tenantEmail).subscribe(res => {
      this.appointments = res;
    });

    this.propertyService.getProperties().subscribe(res => {
      const all: Property[] = res.data || res;
      this.propertyService.favorites$.subscribe(favIds => {
        this.favoriteProperties = all.filter(p => favIds.includes(p.id));
      });
    });

    this.propertyService.getAlertsByEmail(tenantEmail).subscribe(res => {
      this.alerts = res;
    });
  }

  getPrimaryImage(prop?: Property): string {
    return prop?.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';
  }

  getWhatsAppUrl(prop?: Property): string {
    const phone = (prop?.owner_phone || prop?.contact_whatsapp || '221778451234').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`Bonjour, je vous relance concernant ma demande pour le bien : ${prop?.title || ''}`);
    return `https://wa.me/${phone}?text=${text}`;
  }

  removeFavorite(id: number): void {
    this.propertyService.toggleFavorite(id);
  }

  deleteAlert(id?: number): void {
    if (!id) return;
    this.propertyService.deleteAlert(id).subscribe(() => {
      this.alerts = this.alerts.filter(a => a.id !== id);
    });
  }

  submitAlertForm(): void {
    if (!this.newAlert.user_email) return;

    this.propertyService.createAlert(this.newAlert).subscribe(res => {
      this.alertCreatedMsg = res.message || 'Alerte email activée avec succès !';
      this.loadTenantData();
      setTimeout(() => {
        this.showCreateAlertModal = false;
        this.alertCreatedMsg = '';
      }, 2000);
    });
  }
}
