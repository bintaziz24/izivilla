import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { LanguageService } from '../../services/language.service';
import { CountryService } from '../../services/country.service';
import { Property, VerificationRequest, PropertyRequest } from '../../models/property.model';

@Component({
  selector: 'app-agency-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],

  template: `
    <div class="bg-slate-100 min-h-screen py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <!-- Header & Action CTA -->
        <div class="bg-slate-950 text-white p-8 rounded-3xl border-2 border-slate-900 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="bg-orange-600 text-white text-xs font-black uppercase px-2.5 py-0.5 rounded-full">Espace Annonceur</span>
              <span [class.bg-emerald-600]="isVerified" [class.bg-amber-600]="verificationStatus === 'pending'" [class.bg-slate-700]="verificationStatus === 'none'" class="text-white text-xs font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <i *ngIf="isVerified" class="fa-solid fa-circle-check"></i>
                <i *ngIf="verificationStatus === 'pending'" class="fa-solid fa-hourglass-start"></i>
                {{ isVerified ? 'Badge Certified Actif' : (verificationStatus === 'pending' ? 'Vérification Admin En Cours' : 'Profil Non Vérifié') }}
              </span>
            </div>
            <h1 class="text-3xl font-black text-white tracking-tight">Tableau de Bord Annonceur</h1>
            <p class="text-slate-400 text-xs mt-1">Gérez vos biens immobiliers et soumettez votre dossier pour la vérification par l'Admin Izivilla.</p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button *ngIf="!isVerified && verificationStatus !== 'pending'" (click)="showVerifyModal = true" class="bg-amber-500 hover:bg-amber-600 text-slate-950 py-3.5 px-5 rounded-xl font-black text-xs shadow-lg flex items-center gap-2">
              <i class="fa-solid fa-shield-halved text-sm"></i> Demander le Badge (Validation Admin)
            </button>

            <button (click)="showCreateModal = true" class="btn-orange py-3.5 px-6 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2">
              <i class="fa-solid fa-plus-circle text-lg"></i> Publier une annonce
            </button>
          </div>
        </div>

        <!-- Pending Admin Verification Notice Banner -->
        <div *ngIf="verificationStatus === 'pending'" class="bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-amber-500/10 border-2 border-amber-400/40 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center text-2xl font-black shrink-0">
              <i class="fa-solid fa-hourglass-start animate-spin"></i>
            </div>
            <div>
              <h4 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <span>Dossier transmis à l'Admin IZIVILLA</span>
                <span class="text-xs bg-amber-200 text-amber-800 font-bold px-2 py-0.5 rounded-full">En cours de contrôle</span>
              </h4>
              <p class="text-xs text-slate-600 mt-0.5">Votre pièce justificative (CNI / NINEA) est en cours de vérification manuelle par l'équipe administrative Izivilla. Le badge certifié s'affichera dès validation par l'Admin.</p>
            </div>
          </div>
          <a routerLink="/admin" (click)="setAdminRole()" class="bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold text-xs px-5 py-3 rounded-xl shrink-0 transition-colors flex items-center gap-1.5 whitespace-nowrap">
            <i class="fa-solid fa-user-shield"></i> Espace Admin (Simuler la validation)
          </a>
        </div>

        <!-- Verification Notice Banner if unverified & not pending -->
        <div *ngIf="!isVerified && verificationStatus !== 'pending'" class="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-2 border-amber-400/30 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center text-2xl font-black shrink-0">
              <i class="fa-solid fa-shield-triangle-exclamation"></i>
            </div>
            <div>
              <h4 class="font-extrabold text-slate-900 text-base">La vérification est effectuée par l'Admin IZIVILLA</h4>
              <p class="text-xs text-slate-600 mt-0.5">Soumettez votre CNI, NINEA ou Registre du commerce. L'administration contrôlera et délivrera votre badge "Propriétaire Vérifié" ou "Agence Vérifiée".</p>
            </div>
          </div>
          <button (click)="showVerifyModal = true" class="bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs px-5 py-3 rounded-xl shrink-0 transition-colors">
            Soumettre mes pièces à l'Admin
          </button>
        </div>

        <!-- Metrics Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-slate-500 uppercase">Mes Annonces</p>
              <h3 class="text-3xl font-black text-slate-900 mt-1">{{ properties.length }}</h3>
            </div>
            <div class="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold">
              <i class="fa-solid fa-house-chimney"></i>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-slate-500 uppercase">Total Vues</p>
              <h3 class="text-3xl font-black text-slate-900 mt-1">{{ totalViews }}</h3>
            </div>
            <div class="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold">
              <i class="fa-solid fa-eye"></i>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-slate-500 uppercase">Contacts Directs</p>
              <h3 class="text-3xl font-black text-slate-900 mt-1">{{ directContactsCount }}</h3>
            </div>
            <div class="w-12 h-12 rounded-xl bg-slate-900 text-orange-500 flex items-center justify-center text-xl font-bold">
              <i class="fa-solid fa-comments"></i>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-slate-500 uppercase">Annonces Boostées</p>
              <h3 class="text-3xl font-black text-slate-900 mt-1">{{ boostedCount }}</h3>
            </div>
            <div class="w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
              <i class="fa-solid fa-bolt"></i>
            </div>
          </div>

        </div>

        <!-- Navigation Tabs: Demandes Clients, Visites & Catalogue d'Annonces -->
        <div class="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2 text-xs font-extrabold">
          <button (click)="activeTab = 'requests'" 
                  [class.bg-slate-950]="activeTab === 'requests'"
                  [class.text-white]="activeTab === 'requests'"
                  [class.text-slate-600]="activeTab !== 'requests'"
                  class="px-5 py-3 rounded-xl transition-all flex items-center gap-2">
            <i class="fa-solid fa-inbox text-orange-500"></i>
            <span>Demandes Clients & Prospects</span>
            <span class="bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black ml-1">{{ propertyRequests.length }}</span>
          </button>

          <button (click)="activeTab = 'appointments'" 
                  [class.bg-slate-950]="activeTab === 'appointments'"
                  [class.text-white]="activeTab === 'appointments'"
                  [class.text-slate-600]="activeTab !== 'appointments'"
                  class="px-5 py-3 rounded-xl transition-all flex items-center gap-2">
            <i class="fa-solid fa-calendar-check text-orange-500"></i>
            <span>Gestion des visites</span>
            <span class="bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black ml-1">{{ appointments.length }}</span>
          </button>

          <button (click)="activeTab = 'properties'" 
                  [class.bg-slate-950]="activeTab === 'properties'"
                  [class.text-white]="activeTab === 'properties'"
                  [class.text-slate-600]="activeTab !== 'properties'"
                  class="px-5 py-3 rounded-xl transition-all flex items-center gap-2">
            <i class="fa-solid fa-house-chimney text-orange-500"></i>
            <span>Mon Catalogue d'Annonces</span>
            <span class="bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black ml-1">{{ properties.length }}</span>
          </button>

          <button (click)="activeTab = 'stats'" 
                  [class.bg-slate-950]="activeTab === 'stats'"
                  [class.text-white]="activeTab === 'stats'"
                  [class.text-slate-600]="activeTab !== 'stats'"
                  class="px-5 py-3 rounded-xl transition-all flex items-center gap-2">
            <i class="fa-solid fa-chart-pie text-orange-500"></i>
            <span>Statistiques & Performances</span>
            <span class="bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black ml-1">IA</span>
          </button>
        </div>

        <!-- TAB 1: DEMANDES CLIENTS & PIPELINE PROSPECTS (IZIVILLA AUTOMATISATION PHASE 1 - ÉTAPE F) -->
        <div *ngIf="activeTab === 'requests'" class="space-y-6">
          
          <!-- PROSPECT PIPELINE HEADER METRICS (PRIORITÉ 9) -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-black shrink-0">
                <i class="fa-solid fa-users"></i>
              </div>
              <div>
                <p class="text-[10px] font-black uppercase text-slate-400">Total Prospects</p>
                <p class="text-2xl font-black text-slate-900">{{ propertyRequests.length }}</p>
              </div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center text-xl font-black shrink-0">
                <i class="fa-solid fa-chart-line"></i>
              </div>
              <div>
                <p class="text-[10px] font-black uppercase text-slate-400">Prospects Actifs</p>
                <p class="text-2xl font-black text-slate-900">{{ getActiveProspectsCount() }}</p>
              </div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl font-black shrink-0">
                <i class="fa-solid fa-user-clock"></i>
              </div>
              <div>
                <p class="text-[10px] font-black uppercase text-slate-400">Inactifs (>5 jours)</p>
                <p class="text-2xl font-black text-rose-600">{{ getInactiveProspectsCount() }}</p>
              </div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-black shrink-0">
                <i class="fa-solid fa-trophy"></i>
              </div>
              <div>
                <p class="text-[10px] font-black uppercase text-slate-400">Taux de Conversion</p>
                <p class="text-2xl font-black text-emerald-600">{{ getConversionRate() }}%</p>
              </div>
            </div>
          </div>

          <!-- TAB 1 MAIN CONTAINER -->
          <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
            
            <!-- HEADER TOOLBAR -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 class="font-extrabold text-slate-900 text-xl flex items-center gap-2">
                  <i class="fa-solid fa-kanban text-orange-500"></i> Pipeline Prospects & Suivi Automatisé
                </h3>
                <p class="text-slate-500 text-xs mt-0.5">Suivez la progression de vos prospects de la prise de contact jusqu'à la signature du bail ou vente.</p>
              </div>

              <div class="flex flex-wrap items-center gap-2 shrink-0">
                <!-- VIEW MODE SWITCHER -->
                <div class="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
                  <button (click)="prospectViewMode = 'kanban'" [class.bg-white]="prospectViewMode === 'kanban'" [class.shadow-sm]="prospectViewMode === 'kanban'" [class.text-slate-900]="prospectViewMode === 'kanban'" [class.text-slate-500]="prospectViewMode !== 'kanban'" class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5">
                    <i class="fa-solid fa-columns"></i> Pipeline (Kanban)
                  </button>
                  <button (click)="prospectViewMode = 'table'" [class.bg-white]="prospectViewMode === 'table'" [class.shadow-sm]="prospectViewMode === 'table'" [class.text-slate-900]="prospectViewMode === 'table'" [class.text-slate-500]="prospectViewMode !== 'table'" class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5">
                    <i class="fa-solid fa-list-check"></i> Vue Tableau
                  </button>
                </div>

                <button (click)="triggerReminders()" class="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5">
                  <i class="fa-solid fa-clock-rotate-left"></i>
                  <span>Relances Automatiques (>24h)</span>
                </button>
              </div>
            </div>

            <div *ngIf="reminderSuccessMsg" class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <i class="fa-solid fa-circle-check text-emerald-600 text-lg"></i>
              <span>{{ reminderSuccessMsg }}</span>
            </div>

            <!-- 1. KANBAN PIPELINE VIEW (PRIORITÉ 9) -->
            <div *ngIf="prospectViewMode === 'kanban'" class="overflow-x-auto pb-4">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 min-w-[1280px]">
                
                <div *ngFor="let col of kanbanColumns" class="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex flex-col justify-between space-y-3 min-h-[480px]">
                  
                  <!-- Column Header -->
                  <div class="flex items-center justify-between border-b border-slate-200 pb-2.5 px-1">
                    <span class="text-xs font-black text-slate-800 tracking-wider">{{ col.label }}</span>
                    <span [class]="col.badge + ' text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm'">
                      {{ getRequestsByStatus(col.key).length }}
                    </span>
                  </div>

                  <!-- Cards Container -->
                  <div class="flex-1 space-y-3 overflow-y-auto max-h-[620px] pr-0.5">
                    <div *ngIf="getRequestsByStatus(col.key).length === 0" class="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-center p-2 text-[11px] text-slate-400 font-semibold italic">
                      Aucun prospect
                    </div>

                    <div *ngFor="let req of getRequestsByStatus(col.key)" class="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm hover:shadow-md transition-all space-y-3 relative group">
                      
                      <!-- INACTIVITY BADGE (PRIORITÉ 10) -->
                      <div *ngIf="(req.is_inactive || (req.inactive_days && req.inactive_days >= 5)) && req.status !== 'CONCLU' && req.status !== 'PERDU'" class="bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                        <i class="fa-solid fa-triangle-exclamation text-rose-600"></i> Inactif ({{ req.inactive_days || 6 }} jours)
                      </div>

                      <div class="space-y-1">
                        <p class="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                          <i class="fa-solid fa-user-circle text-orange-500"></i> {{ req.client_name }}
                        </p>
                        <p class="text-[10px] text-slate-500 font-medium truncate"><i class="fa-solid fa-envelope mr-1 text-slate-400"></i> {{ req.client_email }}</p>
                        <p *ngIf="req.client_phone" class="text-[10px] text-slate-500 font-medium"><i class="fa-solid fa-phone mr-1 text-emerald-500"></i> {{ req.client_phone }}</p>
                      </div>

                      <div class="bg-slate-50 p-2 rounded-xl border border-slate-100 space-y-1">
                        <p class="text-[10px] font-black text-slate-800 line-clamp-1">📍 {{ req.property?.title || ('Bien #' + req.property_id) }}</p>
                        <p class="text-[10px] text-slate-600 italic line-clamp-2">"{{ req.message }}"</p>
                      </div>

                      <!-- STATUS SELECTOR (RAPID CHANGE) -->
                      <div>
                        <label class="block text-[9px] font-black uppercase text-slate-400 mb-0.5">Changer le statut :</label>
                        <select [ngModel]="req.status" (ngModelChange)="onStatusChange(req, $event)" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-[10px] font-extrabold text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer">
                          <option value="NOUVEAU">NOUVEAU</option>
                          <option value="CONTACTÉ">CONTACTÉ</option>
                          <option value="INTÉRESSÉ">INTÉRESSÉ</option>
                          <option value="VISITE">VISITE</option>
                          <option value="NÉGOCIATION">NÉGOCIATION</option>
                          <option value="CONCLU">CONCLU</option>
                          <option value="PERDU">PERDU</option>
                          <option value="ANNULÉ">ANNULÉ</option>
                        </select>
                      </div>

                      <!-- ACTION BUTTON: PRÉPARER UNE RELANCE (HUMAN-IN-THE-LOOP - PRIORITÉ 10) -->
                      <div class="pt-1 flex items-center gap-1.5">
                        <button (click)="openFollowupModal(req)" class="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[10px] py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm">
                          <i class="fa-solid fa-paper-plane"></i> Préparer une relance
                        </button>
                      </div>

                    </div>
                  </div>

                </div>

              </div>
            </div>

            <!-- 2. TABLE VIEW -->
            <div *ngIf="prospectViewMode === 'table'" class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200 text-xs font-extrabold text-slate-500 uppercase">
                    <th class="py-3.5 px-6">Client / Prospect</th>
                    <th class="py-3.5 px-6">Bien Concerné</th>
                    <th class="py-3.5 px-6">Message & Date</th>
                    <th class="py-3.5 px-6">Statut & Alerte Inactivité</th>
                    <th class="py-3.5 px-6 text-right">Action & Relance</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  <tr *ngFor="let req of propertyRequests" class="hover:bg-slate-50/80 transition-colors">
                    <td class="py-4 px-6">
                      <p class="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                        <i class="fa-solid fa-user-circle text-orange-500 text-base"></i> {{ req.client_name }}
                      </p>
                      <p class="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <i class="fa-solid fa-envelope text-slate-400"></i> {{ req.client_email }}
                      </p>
                      <p *ngIf="req.client_phone" class="text-[11px] text-slate-500 flex items-center gap-1">
                        <i class="fa-solid fa-phone text-emerald-500"></i> {{ req.client_phone }}
                      </p>
                    </td>

                    <td class="py-4 px-6">
                      <span class="font-extrabold text-slate-900 line-clamp-1 max-w-xs">{{ req.property?.title || ('Bien #' + req.property_id) }}</span>
                      <span class="text-[11px] text-slate-400 font-bold block">{{ req.property?.quartier || '' }} {{ req.property?.city || '' }}</span>
                    </td>

                    <td class="py-4 px-6 max-w-xs">
                      <p class="italic text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs font-medium line-clamp-3">"{{ req.message }}"</p>
                      <span class="text-[10px] text-slate-400 font-semibold block mt-1"><i class="fa-solid fa-clock mr-1"></i> {{ req.created_at | date:'dd/MM/yyyy HH:mm':'UTC' }}</span>
                    </td>

                    <td class="py-4 px-6 space-y-1.5">
                      <div>
                        <span [ngClass]="{
                          'bg-orange-100 text-orange-800 border-orange-300': req.status === 'NOUVEAU',
                          'bg-amber-100 text-amber-800 border-amber-300': req.status === 'CONTACTÉ',
                          'bg-purple-100 text-purple-800 border-purple-300': req.status === 'INTÉRESSÉ',
                          'bg-cyan-100 text-cyan-800 border-cyan-300': req.status === 'VISITE',
                          'bg-indigo-100 text-indigo-800 border-indigo-300': req.status === 'NÉGOCIATION',
                          'bg-emerald-100 text-emerald-800 border-emerald-300': req.status === 'CONCLU',
                          'bg-rose-100 text-rose-800 border-rose-300': req.status === 'PERDU',
                          'bg-slate-100 text-slate-700 border-slate-300': req.status === 'ANNULÉ'
                        }" class="px-3 py-1 rounded-full text-[11px] font-black uppercase border inline-flex items-center gap-1.5 shadow-sm">
                          <span class="w-2 h-2 rounded-full bg-current"></span>
                          <span>{{ req.status }}</span>
                        </span>
                      </div>

                      <div *ngIf="(req.is_inactive || (req.inactive_days && req.inactive_days >= 5)) && req.status !== 'CONCLU' && req.status !== 'PERDU'">
                        <span class="bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-black px-2 py-0.5 rounded-md inline-flex items-center gap-1 animate-pulse">
                          <i class="fa-solid fa-triangle-exclamation text-rose-600"></i> Inactif ({{ req.inactive_days || 6 }} jours)
                        </span>
                      </div>
                    </td>

                    <td class="py-4 px-6 text-right space-y-2">
                      <select [ngModel]="req.status" (ngModelChange)="onStatusChange(req, $event)" class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-orange-500 shadow-sm cursor-pointer">
                        <option value="NOUVEAU">NOUVEAU</option>
                        <option value="CONTACTÉ">CONTACTÉ</option>
                        <option value="INTÉRESSÉ">INTÉRESSÉ</option>
                        <option value="VISITE">VISITE</option>
                        <option value="NÉGOCIATION">NÉGOCIATION</option>
                        <option value="CONCLU">CONCLU</option>
                        <option value="PERDU">PERDU</option>
                        <option value="ANNULÉ">ANNULÉ</option>
                      </select>

                      <div>
                        <button (click)="openFollowupModal(req)" class="bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[11px] py-1.5 px-3 rounded-xl transition-all inline-flex items-center gap-1 shadow-sm">
                          <i class="fa-solid fa-paper-plane"></i> Préparer une relance
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>

        <!-- MODALE PRÉPARER UNE RELANCE PROSPECT (PRIORITÉ 10 - HUMAN IN THE LOOP) -->
        <div *ngIf="showFollowupModal && selectedFollowupProspect" class="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 text-left relative">
            
            <button (click)="showFollowupModal = false" class="absolute top-6 right-6 text-slate-400 hover:text-slate-900 text-xl font-bold">
              <i class="fa-solid fa-xmark"></i>
            </button>

            <div class="space-y-1">
              <div class="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold mb-3">
                <i class="fa-solid fa-paper-plane"></i>
              </div>
              <h3 class="text-2xl font-black text-slate-900">Préparer une Relance Client</h3>
              <p class="text-xs text-slate-500 font-medium">Message de relance suggéré pour {{ selectedFollowupProspect.client_name }} (Human-in-the-Loop).</p>
            </div>

            <div *ngIf="followupSuccessMsg" class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <i class="fa-solid fa-circle-check text-emerald-600 text-lg"></i>
              <span>{{ followupSuccessMsg }}</span>
            </div>

            <form *ngIf="!followupSuccessMsg" (ngSubmit)="submitFollowup()" class="space-y-4">
              
              <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1 text-xs">
                <p class="font-extrabold text-slate-900">Prospect : {{ selectedFollowupProspect.client_name }} ({{ selectedFollowupProspect.client_email }})</p>
                <p class="text-slate-500 font-medium">📍 Bien concerné : {{ selectedFollowupProspect.property?.title || ('Bien #' + selectedFollowupProspect.property_id) }}</p>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Message de Relance Personnalisable *</label>
                <textarea [(ngModel)]="followupMessage" name="followupMessage" rows="5" required class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium text-slate-800 focus:outline-none focus:border-orange-500 shadow-sm leading-relaxed"></textarea>
              </div>

              <div class="space-y-2 pt-2">
                <button type="submit" class="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-2">
                  <span>🚀 Envoyer la relance par notification & email</span>
                </button>

                <a *ngIf="selectedFollowupProspect.client_phone" [href]="getWhatsAppFollowupUrl(selectedFollowupProspect)" target="_blank" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-4 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2">
                  <i class="fa-brands fa-whatsapp text-base"></i> Relancer via WhatsApp Direct
                </a>
              </div>

            </form>

          </div>
        </div>

        <!-- TAB: GESTION DES VISITES (ÉTAPE E - PRIORITÉS 6, 7 & 8) -->
        <div *ngIf="activeTab === 'appointments'" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 class="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <i class="fa-solid fa-calendar-check text-blue-600"></i> Gestion des demandes de visite
              </h3>
              <p class="text-slate-500 text-xs mt-0.5">Consultez les créneaux demandés par les prospects et répondez : Accepter, Proposer autre date ou Refuser.</p>
            </div>

            <button (click)="triggerVisitReminders()" class="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0">
              <i class="fa-solid fa-bell"></i>
              <span>Tester les Rappels de Visite (24h / 2h)</span>
            </button>
          </div>

          <div *ngIf="visitReminderSuccessMsg" class="mx-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <i class="fa-solid fa-circle-check text-emerald-600 text-lg"></i>
            <span>{{ visitReminderSuccessMsg }}</span>
          </div>

          <div *ngIf="appointments.length === 0" class="p-12 text-center text-slate-500 space-y-3">
            <div class="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mx-auto">
              <i class="fa-solid fa-calendar-xmark"></i>
            </div>
            <h4 class="font-black text-slate-800 text-base">Aucune demande de visite enregistrée</h4>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">Quand un visiteur clique sur "Je souhaite visiter" sur l'une de vos annonces, son rendez-vous apparaîtra ici.</p>
          </div>

          <div *ngIf="appointments.length > 0" class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200 text-xs font-extrabold text-slate-500 uppercase">
                  <th class="py-3.5 px-6">Client / Prospect</th>
                  <th class="py-3.5 px-6">Bien Concerné</th>
                  <th class="py-3.5 px-6">Date & Heure souhaitées</th>
                  <th class="py-3.5 px-6">Message / Commentaire</th>
                  <th class="py-3.5 px-6">Statut</th>
                  <th class="py-3.5 px-6 text-right">Actions Annonceur</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                <tr *ngFor="let apt of appointments" class="hover:bg-slate-50/80 transition-colors">
                  
                  <td class="py-4 px-6">
                    <div class="font-black text-slate-900 text-sm flex items-center gap-2">
                      <div class="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {{ (apt.tenant_name || 'C').charAt(0).toUpperCase() }}
                      </div>
                      <span>{{ apt.tenant_name }}</span>
                    </div>
                    <p class="text-[11px] text-slate-500 font-medium mt-0.5"><i class="fa-solid fa-phone text-emerald-600 mr-1"></i> {{ apt.tenant_phone }}</p>
                    <p class="text-[11px] text-slate-400 font-medium"><i class="fa-solid fa-envelope text-blue-500 mr-1"></i> {{ apt.tenant_email }}</p>
                  </td>

                  <td class="py-4 px-6">
                    <span class="font-extrabold text-slate-900 line-clamp-1 max-w-xs">{{ apt.property?.title || 'Bien #' + apt.property_id }}</span>
                    <span class="text-[11px] text-slate-400 font-semibold block">{{ apt.property?.quartier }}, {{ apt.property?.city }}</span>
                  </td>

                  <td class="py-4 px-6 whitespace-nowrap">
                    <div class="font-extrabold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl inline-block border border-slate-200">
                      <i class="fa-solid fa-calendar-day text-blue-600 mr-1.5"></i>
                      <span>{{ (apt.rescheduled_date || apt.preferred_date) | date:'EEEE d MMMM yyyy à HH:mm':'UTC' }}</span>
                    </div>
                  </td>

                  <td class="py-4 px-6 max-w-xs">
                    <p class="text-slate-700 italic truncate font-normal">« {{ apt.message || 'Souhaite effectuer une visite.' }} »</p>
                    <p *ngIf="apt.advertiser_comment" class="text-[11px] text-purple-700 font-bold mt-1">Note : {{ apt.advertiser_comment }}</p>
                  </td>

                  <td class="py-4 px-6">
                    <span [ngClass]="{
                      'bg-amber-100 text-amber-800 border-amber-300': apt.status === 'pending',
                      'bg-emerald-600 text-white border-emerald-700': apt.status === 'confirmed',
                      'bg-purple-100 text-purple-800 border-purple-300': apt.status === 'rescheduled',
                      'bg-red-100 text-red-800 border-red-300': apt.status === 'cancelled'
                    }" class="px-3 py-1 rounded-full text-[11px] font-black uppercase border inline-flex items-center gap-1.5">
                      <i *ngIf="apt.status === 'pending'" class="fa-solid fa-clock"></i>
                      <i *ngIf="apt.status === 'confirmed'" class="fa-solid fa-circle-check"></i>
                      <i *ngIf="apt.status === 'rescheduled'" class="fa-solid fa-calendar-plus"></i>
                      <i *ngIf="apt.status === 'cancelled'" class="fa-solid fa-circle-xmark"></i>
                      <span>{{ apt.status === 'pending' ? 'NOUVELLE DEMANDE' : (apt.status === 'confirmed' ? '✅ CONFIRMÉE' : (apt.status === 'rescheduled' ? '⏰ AUTRE DATE' : 'REFUSÉE')) }}</span>
                    </span>
                  </td>

                  <td class="py-4 px-6 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-1.5">
                      
                      <!-- ACCEPTER BUTTON (PRIORITÉ 6 & 7) -->
                      <button *ngIf="apt.status !== 'confirmed'" (click)="acceptVisit(apt)" class="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-xl shadow-sm transition-all flex items-center gap-1">
                        <i class="fa-solid fa-check"></i> Accepter
                      </button>

                      <!-- PROPOSER AUTRE DATE BUTTON (PRIORITÉ 6) -->
                      <button (click)="openRescheduleModal(apt)" class="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-xl shadow-sm transition-all flex items-center gap-1">
                        <i class="fa-solid fa-clock"></i> Proposer autre date
                      </button>

                      <!-- REFUSER BUTTON (PRIORITÉ 6) -->
                      <button *ngIf="apt.status !== 'cancelled'" (click)="refuseVisit(apt)" class="bg-red-100 hover:bg-red-200 text-red-700 font-extrabold text-[11px] px-2.5 py-1.5 rounded-xl transition-colors flex items-center gap-1">
                        <i class="fa-solid fa-xmark"></i> Refuser
                      </button>

                    </div>
                  </td>

                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- RESCHEDULE VISIT MODAL (PRIORITÉ 6) -->
        <div *ngIf="showRescheduleModal" class="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 text-left relative">
            <button (click)="showRescheduleModal = false" class="absolute top-6 right-6 text-slate-400 hover:text-slate-900 text-xl font-bold">
              <i class="fa-solid fa-xmark"></i>
            </button>

            <div class="space-y-1">
              <div class="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl font-bold mb-3">
                <i class="fa-solid fa-calendar-plus"></i>
              </div>
              <h3 class="text-2xl font-black text-slate-900">Proposer une autre date</h3>
              <p class="text-xs text-slate-500 font-medium">Spécifiez le nouveau créneau pour {{ selectedAppointment?.tenant_name }}.</p>
            </div>

            <form (ngSubmit)="submitReschedule()" class="space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Nouvelle Date *</label>
                  <input type="date" [(ngModel)]="rescheduleForm.date" name="reschedule_date" required class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-500 shadow-sm">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Nouvelle Heure *</label>
                  <input type="time" [(ngModel)]="rescheduleForm.time" name="reschedule_time" required class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-500 shadow-sm">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Note pour le client (Optionnel)</label>
                <textarea [(ngModel)]="rescheduleForm.comment" name="reschedule_comment" rows="2" placeholder="Ex: Désolé, je suis indisponible samedi. Je vous propose dimanche après-midi." class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-500 shadow-sm"></textarea>
              </div>

              <button type="submit" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs shadow-lg shadow-purple-600/20 transition-all">
                Envoyer la nouvelle date au client
              </button>
            </form>
          </div>
        </div>

        <!-- TAB 2: CATALOGUE D'ANNONCES -->
        <div *ngIf="activeTab === 'properties'" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 class="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <i class="fa-solid fa-house-chimney text-orange-500"></i> Gestion de votre catalogue d'annonces
              </h3>
              <p class="text-slate-500 text-xs mt-0.5">Suivez l'expiration de vos annonces (60 jours) et confirmez la disponibilité (30 jours).</p>
            </div>

            <button (click)="triggerExpirationCheck()" class="bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0">
              <i class="fa-solid fa-clock-rotate-left"></i>
              <span>Tester Expirations & Relances (30j / 60j)</span>
            </button>
          </div>

          <div *ngIf="expirationSuccessMsg" class="mx-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <i class="fa-solid fa-circle-check text-emerald-600 text-lg"></i>
            <span>{{ expirationSuccessMsg }}</span>
          </div>

          <!-- BANNER ALERTE AUTOMATISÉE SUR ANNONCES (PRIORITÉS 11 & 12) -->
          <div *ngIf="getExpiringOrInactiveProperties().length > 0" class="mx-6 p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center text-lg font-black shrink-0">
                <i class="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div>
                <h4 class="font-extrabold text-amber-950 text-xs">Alerte de suivi Izivilla : {{ getExpiringOrInactiveProperties().length }} annonce(s) requièrent votre attention</h4>
                <p class="text-[11px] text-amber-800 font-medium">Certaines annonces arrivent bientôt à expiration ou sont en ligne depuis 30 jours sans confirmation.</p>
              </div>
            </div>
          </div>

          <div *ngIf="properties.length === 0" class="p-12 text-center text-slate-500 space-y-3">
            <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-2xl mx-auto">
              <i class="fa-solid fa-house-chimney-crack"></i>
            </div>
            <h4 class="font-black text-slate-800 text-base">Aucune annonce publiée pour le moment</h4>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">Vous n'avez pas encore ajouté de bien immobilier. Publiez votre première annonce pour commencer à recevoir des demandes.</p>
            <button (click)="showCreateModal = true" class="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all mt-2">
              <i class="fa-solid fa-plus-circle mr-1"></i> Publier mon premier bien
            </button>
          </div>

          <div *ngIf="properties.length > 0" class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200 text-xs font-extrabold text-slate-500 uppercase">
                  <th class="py-3.5 px-6">Logement</th>
                  <th class="py-3.5 px-6">Statut & Disponibilité</th>
                  <th class="py-3.5 px-6">Expiration & Relance (30j)</th>
                  <th class="py-3.5 px-6">Prix ({{ countryService.currentCountry.currency }})</th>
                  <th class="py-3.5 px-6">Vues</th>
                  <th class="py-3.5 px-6 text-right">Actions Annonceur</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                <tr *ngFor="let prop of properties" class="hover:bg-slate-50/80 transition-colors">
                  
                  <td class="py-4 px-6 flex items-center gap-3">
                    <img [src]="getPrimaryImage(prop)" class="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0">
                    <div>
                      <a [routerLink]="['/annonces', prop.id]" class="font-extrabold text-slate-900 text-sm hover:text-orange-600 line-clamp-1">
                        {{ prop.title }}
                      </a>
                      <span class="text-[11px] text-slate-400 font-bold block">{{ prop.quartier }}, {{ prop.city }}</span>
                    </div>
                  </td>

                  <!-- STATUT DISPONIBILITÉ QUICK SELECTOR (PRIORITÉ 11) -->
                  <td class="py-4 px-6">
                    <select [ngModel]="prop.status || 'available'" (ngModelChange)="onPropertyStatusChange(prop, $event)" [ngClass]="{
                      'bg-emerald-50 text-emerald-800 border-emerald-300': prop.status === 'available' || !prop.status,
                      'bg-amber-50 text-amber-800 border-amber-300': prop.status === 'rented',
                      'bg-purple-50 text-purple-800 border-purple-300': prop.status === 'sold',
                      'bg-slate-100 text-slate-700 border-slate-300': prop.status === 'paused',
                      'bg-red-100 text-red-800 border-red-300 font-black': prop.status === 'expired'
                    }" class="border rounded-xl px-3 py-1.5 text-xs font-black uppercase focus:outline-none cursor-pointer shadow-sm">
                      <option value="available">🟢 DISPONIBLE</option>
                      <option value="rented">🔒 LOUÉ</option>
                      <option value="sold">✅ VENDU</option>
                      <option value="paused">⏸️ EN PAUSE</option>
                      <option value="expired">🔴 EXPIRÉE (MASQUÉE DU PUBLIC)</option>
                    </select>
                  </td>

                  <!-- EXPIRATION & INACTIVITÉ INFO (PRIORITÉS 11 & 12) -->
                  <td class="py-4 px-6 whitespace-nowrap space-y-1">
                    <div *ngIf="prop.status === 'expired'">
                      <span class="bg-red-100 text-red-800 border border-red-300 text-[10px] font-black px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                        <i class="fa-solid fa-circle-xmark text-red-600"></i> Expirée (Masquée du public)
                      </span>
                    </div>

                    <div *ngIf="prop.status !== 'expired'">
                      <span [ngClass]="{
                        'bg-emerald-50 text-emerald-800 border-emerald-200': (getDaysUntilExpiration(prop) || 60) > 15,
                        'bg-amber-50 text-amber-800 border-amber-300': (getDaysUntilExpiration(prop) || 60) <= 15 && (getDaysUntilExpiration(prop) || 60) > 0,
                        'bg-red-100 text-red-800 border-red-300': (getDaysUntilExpiration(prop) || 60) <= 0
                      }" class="text-[10px] font-bold px-2 py-0.5 rounded-md border inline-flex items-center gap-1">
                        <i class="fa-solid fa-clock"></i>
                        <span>Expire dans {{ getDaysUntilExpiration(prop) || 60 }} jour(s)</span>
                      </span>
                    </div>

                    <div *ngIf="prop.is_inactivity_warning_sent" class="text-[10px] font-black text-amber-700 flex items-center gap-1">
                      <i class="fa-solid fa-bell text-amber-600"></i> En ligne depuis 30j (Avis requis)
                    </div>
                  </td>

                  <td class="py-4 px-6 font-black text-orange-600 text-sm">
                    {{ countryService.convertPrice(prop.price_fcfa) | number }} {{ countryService.currentCountry.currency }}
                  </td>

                  <td class="py-4 px-6 font-bold text-slate-800">
                    <i class="fa-solid fa-eye text-slate-400 mr-1"></i> {{ prop.views_count }}
                  </td>

                  <td class="py-4 px-6 text-right whitespace-nowrap space-x-1.5">
                    
                    <!-- RECENT / CONFIRM DISPONIBILITE BUTTON (PRIORITÉ 11) -->
                    <button (click)="confirmAvailability(prop)" title="Confirmer que le bien est toujours disponible (relance 30j)" class="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-[10.5px] px-2.5 py-1.5 rounded-xl transition-all">
                      <i class="fa-solid fa-circle-check text-emerald-600 mr-1"></i> Toujours dispo
                    </button>

                    <!-- RENOUVELER BUTTON (PRIORITÉ 12) -->
                    <button (click)="renewProperty(prop)" title="Renouveler la publication (+60 jours)" class="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10.5px] px-2.5 py-1.5 rounded-xl shadow-sm transition-all">
                      <i class="fa-solid fa-rotate-right mr-1"></i> Renouveler (+60j)
                    </button>

                    <!-- BOOST BUTTON -->
                    <button (click)="openBoostModal(prop)" class="btn-orange text-[10.5px] px-2.5 py-1.5 rounded-xl">
                      <i class="fa-solid fa-bolt"></i> Booster
                    </button>

                  </td>

                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB 4: STATISTIQUES & PERFORMANCES D'ANNONCES (PRIORITÉ 12) -->
        <div *ngIf="activeTab === 'stats'" class="space-y-6">
          
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 class="font-extrabold text-slate-900 text-xl flex items-center gap-2">
                  <i class="fa-solid fa-chart-pie text-orange-500"></i> Performances & Analyse des Annonces
                </h3>
                <p class="text-slate-500 text-xs mt-0.5">Suivez l'attractivité de chaque logement et profitez des conseils automatiques Izivilla.</p>
              </div>
              <span class="bg-orange-100 text-orange-800 border border-orange-300 text-xs font-black px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                <i class="fa-solid fa-wand-magic-sparkles"></i> Conseils IA Actifs
              </span>
            </div>

            <div *ngIf="properties.length === 0" class="p-12 text-center text-slate-500 space-y-3">
              <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-2xl mx-auto">
                <i class="fa-solid fa-chart-line"></i>
              </div>
              <h4 class="font-black text-slate-800 text-base">Aucune statistique disponible</h4>
              <p class="text-xs text-slate-500 max-w-sm mx-auto">Publiez des annonces pour commencer à accumuler des statistiques de visibilité et de conversion.</p>
            </div>

            <div *ngIf="properties.length > 0" class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200 text-xs font-extrabold text-slate-500 uppercase">
                    <th class="py-3.5 px-6">Annonce / Logement</th>
                    <th class="py-3.5 px-6">Disponibilité</th>
                    <th class="py-3.5 px-6">Vues Cumulées</th>
                    <th class="py-3.5 px-6">Demandes Directes</th>
                    <th class="py-3.5 px-6">Visites Sollicitées</th>
                    <th class="py-3.5 px-6">Score d'Attractivité</th>
                    <th class="py-3.5 px-6">Conseil d'Optimisation Izivilla</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  <tr *ngFor="let prop of properties" class="hover:bg-slate-50/80 transition-colors">
                    
                    <td class="py-4 px-6 flex items-center gap-3">
                      <img [src]="getPrimaryImage(prop)" class="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0">
                      <div>
                        <a [routerLink]="['/annonces', prop.id]" class="font-extrabold text-slate-900 text-sm hover:text-orange-600 line-clamp-1">
                          {{ prop.title }}
                        </a>
                        <span class="text-[11px] text-slate-400 font-bold block">{{ prop.quartier }}, {{ prop.city }} — {{ countryService.convertPrice(prop.price_fcfa) | number }} {{ countryService.currentCountry.currency }}</span>
                      </div>
                    </td>

                    <td class="py-4 px-6">
                      <span [ngClass]="{
                        'bg-emerald-100 text-emerald-800 border-emerald-300': prop.status === 'available' || !prop.status,
                        'bg-amber-100 text-amber-800 border-amber-300': prop.status === 'rented',
                        'bg-purple-100 text-purple-800 border-purple-300': prop.status === 'sold',
                        'bg-rose-100 text-rose-800 border-rose-300': prop.status === 'paused'
                      }" class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase border inline-flex items-center gap-1">
                        {{ prop.status === 'rented' ? '🔒 Loué' : (prop.status === 'sold' ? '✅ Vendu' : (prop.status === 'paused' ? '⏸️ En pause' : '🟢 Disponible')) }}
                      </span>
                    </td>

                    <td class="py-4 px-6 font-black text-slate-900 text-sm">
                      <i class="fa-solid fa-eye text-slate-400 mr-1"></i> {{ prop.views_count || 0 }}
                    </td>

                    <td class="py-4 px-6 font-black text-orange-600 text-sm">
                      <i class="fa-solid fa-envelope mr-1 text-orange-400"></i> {{ getPropertyRequestsCount(prop.id) }}
                    </td>

                    <td class="py-4 px-6 font-black text-blue-600 text-sm">
                      <i class="fa-solid fa-calendar-check mr-1 text-blue-400"></i> {{ getPropertyAppointmentsCount(prop.id) }}
                    </td>

                    <td class="py-4 px-6">
                      <div class="flex items-center gap-2">
                        <div class="w-16 bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                          <div class="bg-orange-500 h-2.5 rounded-full" [style.width.%]="getPropertyAttractivenessScore(prop)"></div>
                        </div>
                        <span class="font-black text-slate-900 text-xs">{{ getPropertyAttractivenessScore(prop) }}%</span>
                      </div>
                    </td>

                    <td class="py-4 px-6 max-w-sm">
                      <p class="text-[11px] font-bold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-left">
                        {{ getPropertyPerformanceAdvice(prop) }}
                      </p>
                    </td>

                  </tr>
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>

      <!-- DEMANDE DE VERIFICATION DE PROFIL MODAL -->
      <div *ngIf="showVerifyModal" class="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 text-left relative">
          
          <button (click)="showVerifyModal = false" class="absolute top-6 right-6 text-slate-400 hover:text-slate-900 text-xl font-bold">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <div class="space-y-1">
            <div class="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold mb-3">
              <i class="fa-solid fa-shield-check"></i>
            </div>
            <h3 class="text-2xl font-black text-slate-900">Demander le Badge Certifié</h3>
            <p class="text-xs text-slate-500 font-medium">Obtenez le badge "Propriétaire Vérifié" ou "Agence Vérifiée" en transmettant votre document officiel.</p>
          </div>

          <div *ngIf="verifySuccessMsg" class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <i class="fa-solid fa-circle-check text-emerald-600 text-lg"></i>
            <span>{{ verifySuccessMsg }}</span>
          </div>

          <form *ngIf="!verifySuccessMsg" (ngSubmit)="submitProfileVerification()" class="space-y-4">
            
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Type de Profil *</label>
              <select [(ngModel)]="verifyForm.owner_type" name="owner_type" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-emerald-500">
                <option value="owner">Propriétaire Particulier Direct</option>
                <option value="agency">Agence Immobilière Agréée</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Nom complet ou Nom de l'Agence *</label>
              <input type="text" [(ngModel)]="verifyForm.owner_name" name="owner_name" required placeholder="Ex: Moussa Diallo / Agence Dakar Prestige" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 shadow-sm">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Numéro de pièce (CNI ou NINEA) *</label>
              <input type="text" [(ngModel)]="verifyForm.document_number" name="document_number" required placeholder="CNI n° 1 750 1990 01234 ou NINEA 0084920" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 shadow-sm">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Photo / Scan de la pièce justificative</label>
              <input type="text" [(ngModel)]="verifyForm.document_url" name="document_url" placeholder="Coller le lien de votre justificatif" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 shadow-sm">
            </div>

            <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs shadow-lg shadow-emerald-600/20 transition-all">
              Soumettre la demande de vérification
            </button>
          </form>

        </div>
      </div>

      <!-- CREATE PROPERTY MODAL -->
      <div *ngIf="showCreateModal" class="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto space-y-8 text-left">
          
          <div class="space-y-4 border-b border-slate-100 pb-6">
            <button (click)="showCreateModal = false" class="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors">
              <i class="fa-solid fa-arrow-left"></i> Retour aux annonces
            </button>

            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-black shrink-0">
                <i class="fa-solid fa-circle-plus"></i>
              </div>
              <div>
                <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Déposer une nouvelle annonce</h2>
                <p class="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Renseignez les détails de votre bien pour toucher des milliers de chercheurs au Sénégal.</p>
              </div>
            </div>
          </div>

          <form (ngSubmit)="submitNewProperty()" class="space-y-8">
            
            <div class="space-y-4">
              <h3 class="text-sm font-black uppercase text-emerald-700 tracking-wider">
                1. INFORMATIONS GÉNÉRALES
              </h3>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">Titre de l'annonce *</label>
                <input type="text" [(ngModel)]="newProp.title" name="title" required placeholder="Ex: Magnifique Appartement F3 avec Balcon - Mermoz" class="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 shadow-sm">
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Type d'annonceur *</label>
                  <select [(ngModel)]="newProp.owner_type" name="owner_type" required class="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-emerald-500">
                    <option value="owner">Propriétaire Direct</option>
                    <option value="agency">Agence Immobilière</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Type de transaction *</label>
                  <select [(ngModel)]="newProp.transaction_type" name="transaction_type" required class="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-emerald-500">
                    <option value="rent">Location</option>
                    <option value="sale">Vente</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Type de bien *</label>
                  <select [(ngModel)]="newProp.property_type" name="property_type" required class="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-emerald-500">
                    <option value="Studio">Studio</option>
                    <option value="F2">F2</option>
                    <option value="F3">F3</option>
                    <option value="F4">F4</option>
                    <option value="Villa">Villa</option>
                    <option value="Appartement">Appartement</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Ville *</label>
                  <select [(ngModel)]="newProp.city" name="city" required class="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-emerald-500">
                    <option value="Dakar">Dakar</option>
                    <option value="Saly">Saly / Mbour</option>
                    <option value="Thiès">Thiès</option>
                    <option value="Rufisque">Rufisque</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Quartier *</label>
                  <input type="text" [(ngModel)]="newProp.quartier" name="quartier" required placeholder="ex: Almadies, Mermoz, Plateau" class="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 shadow-sm">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">Description détaillée du bien *</label>
                <textarea [(ngModel)]="newProp.description" name="description" rows="3" required placeholder="Décrivez les pièces, l'ensoleillement, la sécurité de l'immeuble, la proximité des commerces..." class="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 shadow-sm"></textarea>
              </div>
            </div>

            <div class="space-y-4 pt-4 border-t border-slate-100">
              <h3 class="text-sm font-black uppercase text-emerald-700 tracking-wider">
                2. TARIFS & CARACTÉRISTIQUES
              </h3>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Prix ({{ countryService.currentCountry.currency }}) *</label>
                  <input type="number" [(ngModel)]="newProp.price_fcfa" name="price_fcfa" required placeholder="450000" class="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 shadow-sm">
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Surface (m²)</label>
                  <input type="number" [(ngModel)]="newProp.surface_sqm" name="surface_sqm" placeholder="110" class="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 shadow-sm">
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Chambres</label>
                  <input type="number" [(ngModel)]="newProp.bedrooms" name="bedrooms" placeholder="2" class="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 shadow-sm">
                </div>
              </div>
            </div>

            <div class="pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
              <button type="button" (click)="showCreateModal = false" class="px-6 py-3 font-bold text-xs text-slate-600 hover:text-slate-900 transition-colors">
                Annuler
              </button>
              <button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-8 py-3.5 rounded-2xl text-sm shadow-lg shadow-emerald-600/30 transition-all">
                Publier l'annonce maintenant
              </button>
            </div>

          </form>

        </div>
      </div>

      <!-- BOOST VISIBILITY MODAL WITH WAVE & ORANGE MONEY -->
      <div *ngIf="showBoostModal && targetProperty" class="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-slate-900 space-y-6">
          
          <div class="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <span class="text-xs font-black uppercase text-orange-600">Option de Monétisation</span>
              <h3 class="text-xl font-extrabold text-slate-900">Boost de Visibilité par Mobile Money</h3>
            </div>
            <button (click)="showBoostModal = false" class="text-slate-400 hover:text-slate-900 text-xl font-bold">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
            <img [src]="getPrimaryImage(targetProperty)" class="w-12 h-12 rounded-lg object-cover">
            <div>
              <p class="font-extrabold text-slate-900 text-xs line-clamp-1">{{ targetProperty.title }}</p>
              <p class="text-orange-600 text-xs font-bold">{{ countryService.convertPrice(targetProperty.price_fcfa) | number }} {{ countryService.currentCountry.currency }}</p>
            </div>
          </div>

          <div *ngIf="boostSuccessMsg" class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <i class="fa-solid fa-circle-check text-emerald-600 text-lg"></i>
            <span>{{ boostSuccessMsg }}</span>
          </div>

          <form *ngIf="!boostSuccessMsg" (ngSubmit)="processBoostPayment()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-2">Sélectionnez la durée de mise en avant</label>
              <div class="grid grid-cols-3 gap-2">
                <div (click)="selectedPlan = '3d'; boostAmount = 3000; boostDays = 3" [class.border-orange-600]="selectedPlan === '3d'" [class.bg-orange-50]="selectedPlan === '3d'" class="p-3 rounded-xl border-2 border-slate-200 text-center cursor-pointer hover:border-orange-500">
                  <p class="text-xs font-extrabold text-slate-900">Boost 3 jours</p>
                  <p class="text-orange-600 font-black text-sm mt-1">3,000 F</p>
                </div>

                <div (click)="selectedPlan = '7d'; boostAmount = 6000; boostDays = 7" [class.border-orange-600]="selectedPlan === '7d'" [class.bg-orange-50]="selectedPlan === '7d'" class="p-3 rounded-xl border-2 border-slate-200 text-center cursor-pointer hover:border-orange-500">
                  <p class="text-xs font-extrabold text-slate-900">Boost 7 jours</p>
                  <p class="text-orange-600 font-black text-sm mt-1">6,000 F</p>
                </div>

                <div (click)="selectedPlan = '30d'; boostAmount = 15000; boostDays = 30" [class.border-orange-600]="selectedPlan === '30d'" [class.bg-orange-50]="selectedPlan === '30d'" class="p-3 rounded-xl border-2 border-slate-200 text-center cursor-pointer hover:border-orange-500">
                  <p class="text-xs font-extrabold text-slate-900">Boost 30 jours</p>
                  <p class="text-orange-600 font-black text-sm mt-1">15,000 F</p>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-2">Moyen de paiement mobile</label>
              <div class="grid grid-cols-2 gap-3">
                <button type="button" (click)="paymentMethod = 'Wave'" [class.border-orange-600]="paymentMethod === 'Wave'" [class.bg-orange-50]="paymentMethod === 'Wave'" class="p-3 border-2 border-slate-200 rounded-xl flex items-center justify-center gap-2 font-bold text-xs">
                  <i class="fa-solid fa-mobile-screen text-orange-500"></i> Wave Sénégal
                </button>
                <button type="button" (click)="paymentMethod = 'Orange Money'" [class.border-orange-600]="paymentMethod === 'Orange Money'" [class.bg-orange-50]="paymentMethod === 'Orange Money'" class="p-3 border-2 border-slate-200 rounded-xl flex items-center justify-center gap-2 font-bold text-xs">
                  <i class="fa-solid fa-wallet text-orange-600"></i> Orange Money
                </button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Numéro de téléphone mobile money</label>
              <input type="tel" [(ngModel)]="paymentPhone" name="paymentPhone" required placeholder="ex: 77 123 45 67" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-orange-500 outline-none">
            </div>

            <button type="submit" class="btn-orange w-full py-3.5 text-xs justify-center rounded-xl font-bold shadow-lg">
              Payer {{ boostAmount | number }} {{ countryService.currentCountry.currency }} via {{ paymentMethod }}
            </button>

          </form>

        </div>
      </div>

    </div>
  `
})
export class AgencyDashboardComponent implements OnInit {
  properties: Property[] = [];
  totalViews = 0;
  boostedCount = 0;
  directContactsCount = 0;
  isVerified = false;
  verificationStatus: 'none' | 'pending' | 'approved' | 'rejected' = 'none';

  showCreateModal = false;
  showBoostModal = false;
  showVerifyModal = false;

  targetProperty: Property | null = null;
  boostSuccessMsg = '';
  verifySuccessMsg = '';

  verifyForm: any = {
    owner_type: 'owner',
    owner_name: '',
    document_number: '',
    document_url: ''
  };

  selectedPlan = '7d';
  boostAmount = 6000;
  boostDays = 7;
  paymentMethod = 'Wave';
  paymentPhone = '';

  newProp: any = {
    title: '',
    owner_type: 'owner',
    transaction_type: 'rent',
    property_type: 'Villa',
    city: 'Dakar',
    quartier: '',
    description: '',
    price_fcfa: null,
    surface_sqm: null,
    bedrooms: null
  };

  activeTab: 'requests' | 'appointments' | 'properties' | 'stats' = 'requests';
  propertyRequests: PropertyRequest[] = [];

  // Prospect Pipeline & Follow-up State (Étape F - Priorités 9 & 10)
  prospectViewMode: 'kanban' | 'table' = 'kanban';

  kanbanColumns = [
    { key: 'NOUVEAU', label: 'NOUVEAU', badge: 'bg-orange-600 text-white' },
    { key: 'CONTACTÉ', label: 'CONTACTÉ', badge: 'bg-amber-600 text-white' },
    { key: 'INTÉRESSÉ', label: 'INTÉRESSÉ', badge: 'bg-purple-600 text-white' },
    { key: 'VISITE', label: 'VISITE', badge: 'bg-cyan-600 text-white' },
    { key: 'NÉGOCIATION', label: 'NÉGOCIATION', badge: 'bg-indigo-600 text-white' },
    { key: 'CONCLU', label: 'CONCLU', badge: 'bg-emerald-600 text-white' },
    { key: 'PERDU', label: 'PERDU', badge: 'bg-rose-600 text-white' }
  ];

  showFollowupModal = false;
  selectedFollowupProspect: PropertyRequest | null = null;
  followupMessage = '';
  followupSuccessMsg = '';

  getRequestsByStatus(status: string): PropertyRequest[] {
    return this.propertyRequests.filter(r => r.status === status);
  }

  getInactiveProspectsCount(): number {
    return this.propertyRequests.filter(r => (r.is_inactive || (r.inactive_days && r.inactive_days >= 5)) && r.status !== 'CONCLU' && r.status !== 'PERDU' && r.status !== 'ANNULÉ').length;
  }

  getActiveProspectsCount(): number {
    return this.propertyRequests.filter(r => r.status !== 'CONCLU' && r.status !== 'PERDU' && r.status !== 'ANNULÉ').length;
  }

  getConversionRate(): number {
    if (!this.propertyRequests || this.propertyRequests.length === 0) return 0;
    const concluded = this.propertyRequests.filter(r => r.status === 'CONCLU').length;
    return Math.round((concluded / this.propertyRequests.length) * 100);
  }

  openFollowupModal(req: PropertyRequest): void {
    this.selectedFollowupProspect = req;
    this.followupSuccessMsg = '';
    const clientFirstName = req.client_name ? req.client_name.split(' ')[0] : 'Client';
    const propTitle = req.property?.title || 'notre logement';
    this.followupMessage = `Bonjour ${clientFirstName},\n\nnous faisons suite à votre intérêt concernant "${propTitle}". Êtes-vous toujours à la recherche d'un bien ou souhaitez-vous organiser une visite cette semaine ?\n\nCordialement,\nL'annonceur Izivilla`;
    this.showFollowupModal = true;
  }

  submitFollowup(): void {
    if (!this.selectedFollowupProspect || !this.selectedFollowupProspect.id || !this.followupMessage) return;

    this.propertyService.sendProspectFollowup(this.selectedFollowupProspect.id, this.followupMessage).subscribe(res => {
      this.followupSuccessMsg = res.message || 'Relance envoyée avec succès au prospect !';
      this.loadUserData();
      setTimeout(() => {
        this.showFollowupModal = false;
        this.followupSuccessMsg = '';
        this.selectedFollowupProspect = null;
      }, 2500);
    });
  }

  getWhatsAppFollowupUrl(req: PropertyRequest): string {
    const phone = (req.client_phone || '').replace(/[^0-9]/g, '');
    const clientFirstName = req.client_name ? req.client_name.split(' ')[0] : 'Client';
    const text = encodeURIComponent(`Bonjour ${clientFirstName}, nous faisons suite à votre demande pour "${req.property?.title || 'notre annonce'}". Êtes-vous toujours intéressé pour organiser une visite ?`);
    return `https://wa.me/${phone}?text=${text}`;
  }

  // Étape H Helper Methods (Priorités 11 & 12)
  expirationSuccessMsg = '';

  onPropertyStatusChange(prop: Property, newStatus: string): void {
    prop.status = newStatus;
    if (prop.id) {
      this.propertyService.updatePropertyStatus(prop.id, newStatus).subscribe();
    }
  }

  renewProperty(prop: Property): void {
    if (!prop.id) return;
    this.propertyService.renewProperty(prop.id).subscribe(res => {
      this.expirationSuccessMsg = res.message || 'Annonce renouvelée pour 60 jours supplémentaires !';
      this.loadUserData();
      setTimeout(() => this.expirationSuccessMsg = '', 3500);
    });
  }

  confirmAvailability(prop: Property): void {
    if (!prop.id) return;
    this.propertyService.confirmPropertyAvailability(prop.id).subscribe(res => {
      this.expirationSuccessMsg = res.message || 'Disponibilité du bien confirmée !';
      this.loadUserData();
      setTimeout(() => this.expirationSuccessMsg = '', 3500);
    });
  }

  triggerExpirationCheck(): void {
    this.propertyService.triggerPropertyExpirationCheck().subscribe(res => {
      this.expirationSuccessMsg = res.message || 'Contrôle automatique d\'expiration exécuté !';
      this.loadUserData();
      setTimeout(() => this.expirationSuccessMsg = '', 4000);
    });
  }

  getDaysUntilExpiration(prop: Property): number | null {
    if (!prop.expires_at) return 60;
    const exp = new Date(prop.expires_at);
    const now = new Date();
    const diff = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
    return diff;
  }

  getExpiringOrInactiveProperties(): Property[] {
    return this.properties.filter(p => {
      const days = this.getDaysUntilExpiration(p);
      return p.status === 'expired' || (days !== null && days <= 7) || p.is_inactivity_warning_sent;
    });
  }

  getPropertyRequestsCount(propertyId: number): number {
    return this.propertyRequests.filter(r => r.property_id === propertyId).length;
  }

  getPropertyAppointmentsCount(propertyId: number): number {
    return this.appointments.filter(a => a.property_id === propertyId).length;
  }

  getPropertyAttractivenessScore(prop: Property): number {
    const views = prop.views_count || 1;
    const reqs = this.getPropertyRequestsCount(prop.id) + this.getPropertyAppointmentsCount(prop.id);
    return Math.min(100, Math.max(12, Math.round((reqs / Math.max(10, views)) * 100 * 5)));
  }

  getPropertyPerformanceAdvice(prop: Property): string {
    const views = prop.views_count || 0;
    const reqs = this.getPropertyRequestsCount(prop.id) + this.getPropertyAppointmentsCount(prop.id);

    if (prop.status && prop.status !== 'available') {
      return `🔒 Ce bien est actuellement marqué comme ${prop.status === 'rented' ? 'Loué' : (prop.status === 'sold' ? 'Vendu' : 'En pause')}.`;
    }
    if (views > 100 && reqs === 0) {
      return "💡 Très bon trafic mais 0 contact : Pensez à ajuster le prix de 5% ou ajouter plus de photos lumineuses.";
    } else if (views < 40) {
      return "⚡ Faible visibilité : Déclenchez un Boost Wave/OM pour quadrupler l'exposition sur Dakar.";
    } else if (reqs >= 2) {
      return "🔥 Forte demande ! Programmez des visites groupées pour convertir rapidement un locataire/acheteur.";
    } else {
      return "✅ Performance équilibrée. Continuez le suivi des prospects enregistrés.";
    }
  }

  constructor(
    private propertyService: PropertyService,
    private route: ActivatedRoute,
    public langService: LanguageService,
    public countryService: CountryService
  ) {}

  t(key: string): string {
    return this.langService.translate(key);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'properties') {
        this.activeTab = 'properties';
      } else if (params['tab'] === 'appointments') {
        this.activeTab = 'appointments';
      } else if (params['tab'] === 'requests') {
        this.activeTab = 'requests';
      } else if (params['tab'] === 'stats') {
        this.activeTab = 'stats';
      }
    });
    this.loadUserData();
  }

  appointments: any[] = [];
  showRescheduleModal = false;
  selectedAppointment: any = null;
  rescheduleForm = { date: '', time: '15:00', comment: '' };
  visitReminderSuccessMsg = '';

  reminderSuccessMsg = '';

  triggerReminders(): void {
    this.propertyService.triggerAutomatedReminders().subscribe(res => {
      this.reminderSuccessMsg = res.message || 'Rappels automatiques transmis aux annonceurs !';
      this.loadUserData();
      setTimeout(() => this.reminderSuccessMsg = '', 3500);
    });
  }

  triggerVisitReminders(): void {
    this.propertyService.triggerVisitReminders().subscribe(res => {
      this.visitReminderSuccessMsg = res.message || 'Rappels de visite transmis !';
      this.loadUserData();
      setTimeout(() => this.visitReminderSuccessMsg = '', 4000);
    });
  }

  acceptVisit(apt: any): void {
    if (!apt.id) return;
    this.propertyService.updateAppointmentStatus(apt.id, 'accept').subscribe(res => {
      apt.status = 'confirmed';
      this.loadUserData();
    });
  }

  openRescheduleModal(apt: any): void {
    this.selectedAppointment = apt;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.rescheduleForm = {
      date: tomorrow.toISOString().split('T')[0],
      time: '15:00',
      comment: ''
    };
    this.showRescheduleModal = true;
  }

  submitReschedule(): void {
    if (!this.selectedAppointment || !this.rescheduleForm.date) return;
    const fullDateTime = `${this.rescheduleForm.date}T${this.rescheduleForm.time}:00Z`;

    this.propertyService.updateAppointmentStatus(
      this.selectedAppointment.id,
      'reschedule',
      fullDateTime,
      this.rescheduleForm.comment
    ).subscribe(res => {
      this.showRescheduleModal = false;
      this.loadUserData();
    });
  }

  refuseVisit(apt: any): void {
    if (!apt.id) return;
    this.propertyService.updateAppointmentStatus(apt.id, 'refuse').subscribe(res => {
      apt.status = 'cancelled';
      this.loadUserData();
    });
  }

  onStatusChange(req: PropertyRequest, newStatus: string): void {
    req.status = newStatus;
    if (req.id) {
      this.propertyService.updateRequestStatus(req.id, newStatus).subscribe();
    }
  }


  setAdminRole(): void {
    this.propertyService.currentRole$.next('admin');
  }

  loadUserData(): void {
    const user = this.propertyService.getCurrentUser();
    
    if (user && user.name) {
      this.verifyForm.owner_name = user.name;
    }

    // Load property requests (Demandes clients & Prospects)
    this.propertyService.getPropertyRequests().subscribe(reqs => {
      this.propertyRequests = reqs || [];
    });

    // Load visit requests (Gestion des visites - Étape E)
    this.propertyService.getAdvertiserAppointments(user?.email || '').subscribe(apts => {
      this.appointments = apts || [];
    });


    // 1. Check verification status for THIS logged in user
    this.propertyService.getVerificationRequests().subscribe(reqs => {
      if (user && reqs && reqs.length > 0) {
        const userEmail = (user.email || '').toLowerCase().trim();
        const userName = (user.name || '').toLowerCase().trim();
        const myReq = reqs.find(v => {
          const vEmail = (v.user_email || v.owner_email || '').toLowerCase().trim();
          const vName = (v.user_name || v.owner_name || '').toLowerCase().trim();
          return (userEmail && vEmail === userEmail) || (userName && vName === userName);
        });

        if (myReq) {
          this.verificationStatus = myReq.status;
          this.isVerified = (myReq.status === 'approved');
        } else {
          this.verificationStatus = 'none';
          this.isVerified = false;
        }
      } else {
        this.verificationStatus = 'none';
        this.isVerified = false;
      }
    });

    // 2. Load properties for THIS logged in user
    this.propertyService.getProperties().subscribe(res => {
      const allProps: Property[] = res.data || res;

      if (!user) {
        this.properties = [];
      } else {
        const userEmail = (user.email || '').toLowerCase().trim();
        const userName = (user.name || '').toLowerCase().trim();

        this.properties = allProps.filter(p => {
          const pEmail = (p.owner_email || p.agency?.email || '').toLowerCase().trim();
          const pName = (p.owner_name || p.agency?.name || '').toLowerCase().trim();
          return (userEmail && pEmail === userEmail) || (userName && pName === userName);
        });
      }

      this.totalViews = this.properties.reduce((acc, p) => acc + (p.views_count || 0), 0);
      this.boostedCount = this.properties.filter(p => p.is_boosted).length;
    });

    // 3. Direct contacts count for THIS logged in user
    this.propertyService.getMessages().subscribe(msgs => {
      if (!user || this.properties.length === 0) {
        this.directContactsCount = 0;
      } else {
        const propIds = this.properties.map(p => p.id);
        const userMsgs = msgs.filter(m => propIds.includes(m.property_id));
        this.directContactsCount = userMsgs.length;
      }
    });
  }

  getPrimaryImage(prop: Property): string {
    return prop.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';
  }

  openBoostModal(prop: Property): void {
    this.targetProperty = prop;
    this.boostSuccessMsg = '';
    this.showBoostModal = true;
  }

  processBoostPayment(): void {
    if (!this.targetProperty) return;

    this.propertyService.checkoutBoost({
      property_id: this.targetProperty.id,
      plan_name: `Boost ${this.boostDays} jours`,
      duration_days: this.boostDays,
      amount_fcfa: this.boostAmount,
      payment_method: this.paymentMethod,
      payment_phone: this.paymentPhone
    }).subscribe(res => {
      this.boostSuccessMsg = res.message;
      this.targetProperty!.is_boosted = true;
      this.loadUserData();
      setTimeout(() => {
        this.showBoostModal = false;
      }, 2000);
    });
  }

  submitProfileVerification(): void {
    const user = this.propertyService.getCurrentUser();
    this.propertyService.submitVerificationRequest({
      user_name: user?.name || this.verifyForm.owner_name,
      user_email: user?.email || 'annonceur@izivilla.sn',
      user_phone: user?.phone || '+221 77 000 00 00',
      owner_type: this.verifyForm.owner_type,
      owner_name: this.verifyForm.owner_name,
      document_number: this.verifyForm.document_number,
      document_url: this.verifyForm.document_url
    }).subscribe(res => {
      this.verifySuccessMsg = 'Votre dossier a été soumis avec succès à l\'Admin Izivilla ! Il est en cours de contrôle.';
      this.verificationStatus = 'pending';
      this.isVerified = false;
      setTimeout(() => {
        this.showVerifyModal = false;
        this.verifySuccessMsg = '';
      }, 2500);
    });
  }

  submitNewProperty(): void {
    const user = this.propertyService.getCurrentUser();
    const payload = {
      ...this.newProp,
      owner_name: user?.name || this.newProp.owner_name || 'Propriétaire Direct',
      owner_email: user?.email || 'proprietaire@izivilla.sn',
      owner_phone: user?.phone || '+221 77 000 00 00',
      owner_type: user?.role === 'agency' ? 'Agence' : 'Propriétaire',
      is_verified: this.isVerified
    };

    this.propertyService.createProperty(payload).subscribe(res => {
      this.showCreateModal = false;
      this.loadUserData();
    });
  }
}
