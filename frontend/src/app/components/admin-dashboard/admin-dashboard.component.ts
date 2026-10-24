import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService, AdminDashboardData } from '../../services/admin.service';
import { PropertyService } from '../../services/property.service';
import { LanguageService } from '../../services/language.service';
import { CountryService } from '../../services/country.service';

type AdminTab = 'dashboard' | 'properties' | 'users' | 'verifications' | 'reports' | 'logs' | 'analytics' | 'settings';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-800 flex flex-col lg:flex-row antialiased font-sans">
      
      <!-- MOBILE HEADER / SIDEBAR TOGGLE -->
      <div class="lg:hidden bg-white border-b border-slate-200 px-4 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-black text-white text-base shadow-md shadow-orange-600/25">
            I
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-black text-slate-900 tracking-tight text-lg">IZIVILLA</span>
              <span class="text-[9px] bg-orange-100 text-orange-700 font-extrabold px-1.5 py-0.5 rounded uppercase">Admin</span>
            </div>
            <p class="text-[10px] text-slate-600 font-medium -mt-0.5">Centre de Contrôle</p>
          </div>
        </div>
        <button (click)="isMobileMenuOpen = !isMobileMenuOpen" class="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition">
          <i class="fa-solid text-lg" [class.fa-bars]="!isMobileMenuOpen" [class.fa-xmark]="isMobileMenuOpen"></i>
        </button>
      </div>

      <!-- SIDEBAR -->
      <aside [class.hidden]="!isMobileMenuOpen" class="lg:flex flex-col w-full lg:w-72 bg-white border-r border-slate-200/90 shrink-0 min-h-screen sticky top-0 z-40 transition-all shadow-xs">
        
        <!-- Logo & Brand Header -->
        <div class="p-6 border-b border-slate-100 hidden lg:block">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-orange-600/20">
              I
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="font-black text-slate-900 text-xl tracking-tight">IZIVILLA</span>
                <span class="text-[9px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">Admin</span>
              </div>
              <p class="text-[11px] text-slate-600 font-medium tracking-wide mt-0.5">Centre de Contrôle Global</p>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
          <p class="px-3 pt-2 pb-1 text-[10px] font-black text-slate-600 uppercase tracking-wider">Navigation Principale</p>

          <!-- 1. Tableau de bord -->
          <button (click)="setTab('dashboard')" [class.active-nav]="currentTab === 'dashboard'" class="nav-item">
            <div class="flex items-center gap-3">
              <i class="fa-solid fa-gauge-high text-base w-5 text-center"></i>
              <span class="font-bold text-xs">Tableau de bord</span>
            </div>
          </button>

          <!-- 2. Gestion des annonces -->
          <button (click)="setTab('properties')" [class.active-nav]="currentTab === 'properties'" class="nav-item justify-between">
            <div class="flex items-center gap-3">
              <i class="fa-solid fa-house-chimney text-base w-5 text-center"></i>
              <span class="font-bold text-xs">Gestion des annonces</span>
            </div>
            <span *ngIf="data?.stats?.pending_properties" class="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-200">
              {{ data?.stats?.pending_properties }}
            </span>
          </button>

          <!-- 3. Utilisateurs -->
          <button (click)="setTab('users')" [class.active-nav]="currentTab === 'users'" class="nav-item">
            <div class="flex items-center gap-3">
              <i class="fa-solid fa-users text-base w-5 text-center"></i>
              <span class="font-bold text-xs">Utilisateurs</span>
            </div>
          </button>

          <p class="px-3 pt-4 pb-1 text-[10px] font-black text-slate-600 uppercase tracking-wider">Modération & Sécurité</p>

          <!-- 4. Vérification des profils -->
          <button (click)="setTab('verifications')" [class.active-nav]="currentTab === 'verifications'" class="nav-item justify-between">
            <div class="flex items-center gap-3">
              <i class="fa-solid fa-shield-halved text-base w-5 text-center"></i>
              <span class="font-bold text-xs">Vérification profils</span>
            </div>
            <span *ngIf="data?.stats?.pending_verifications" class="bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-black px-2 py-0.5 rounded-full">
              {{ data?.stats?.pending_verifications }}
            </span>
          </button>

          <!-- 5. Signalements -->
          <button (click)="setTab('reports')" [class.active-nav]="currentTab === 'reports'" class="nav-item justify-between">
            <div class="flex items-center gap-3">
              <i class="fa-solid fa-triangle-exclamation text-base w-5 text-center"></i>
              <span class="font-bold text-xs">Signalements</span>
            </div>
            <span *ngIf="data?.stats?.pending_reports" class="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
              {{ data?.stats?.pending_reports }}
            </span>
          </button>

          <!-- 6. Journal d'activité -->
          <button (click)="setTab('logs')" [class.active-nav]="currentTab === 'logs'" class="nav-item">
            <div class="flex items-center gap-3">
              <i class="fa-solid fa-clock-rotate-left text-base w-5 text-center"></i>
              <span class="font-bold text-xs">Journal d'activité</span>
            </div>
          </button>

          <p class="px-3 pt-4 pb-1 text-[10px] font-black text-slate-600 uppercase tracking-wider">Pilotage</p>

          <!-- 7. Statistiques et rapports -->
          <button (click)="setTab('analytics')" [class.active-nav]="currentTab === 'analytics'" class="nav-item">
            <div class="flex items-center gap-3">
              <i class="fa-solid fa-chart-pie text-base w-5 text-center"></i>
              <span class="font-bold text-xs">Statistiques & rapports</span>
            </div>
          </button>

          <!-- 8. Paramètres -->
          <button (click)="setTab('settings')" [class.active-nav]="currentTab === 'settings'" class="nav-item">
            <div class="flex items-center gap-3">
              <i class="fa-solid fa-gear text-base w-5 text-center"></i>
              <span class="font-bold text-xs">Paramètres</span>
            </div>
          </button>
        </nav>

        <!-- System & Database Status Footer -->
        <div class="p-4 border-t border-slate-100 bg-slate-50/70 m-3 rounded-2xl">
          <div class="flex items-center justify-between text-xs mb-2">
            <span class="text-slate-500 font-semibold">Base de données</span>
            <span class="text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full font-bold flex items-center gap-1.5 text-[11px]">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Neon PgSQL
            </span>
          </div>
          <div class="pt-2 border-t border-slate-200/60 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                <i class="fa-solid fa-user-shield"></i>
              </div>
              <div class="text-[11px] leading-tight">
                <p class="font-bold text-slate-900">Super Admin</p>
                <p class="text-slate-600 text-[10px]">Izivilla Dakar</p>
              </div>
            </div>
            <a routerLink="/" class="text-slate-400 hover:text-orange-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition" title="Retour au site public">
              <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
            </a>
          </div>
        </div>
      </aside>

      <!-- MAIN CONTENT AREA -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
        
        <!-- Toast Alerts -->
        <div *ngIf="feedbackMessage" class="p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm transition-all"
             [class.bg-emerald-50]="feedbackType === 'success'"
             [class.text-emerald-800]="feedbackType === 'success'"
             [class.border]="true"
             [class.border-emerald-200]="feedbackType === 'success'"
             [class.bg-red-50]="feedbackType === 'error'"
             [class.text-red-800]="feedbackType === 'error'"
             [class.border-red-200]="feedbackType === 'error'">
          <div class="flex items-center gap-2.5">
            <i class="fa-solid" [class.fa-circle-check]="feedbackType === 'success'" [class.fa-triangle-exclamation]="feedbackType === 'error'"></i>
            <span>{{ feedbackMessage }}</span>
          </div>
          <button (click)="feedbackMessage = ''" class="text-slate-400 hover:text-slate-600">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- ============================================================== -->
        <!-- TAB 1: TABLEAU DE BORD GÉNÉRAL -->
        <!-- ============================================================== -->
        <div *ngIf="currentTab === 'dashboard'" class="space-y-6">
          
          <!-- Banner -->
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="bg-orange-100 text-orange-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">Espace Contrôle</span>
                <span class="text-xs text-slate-600 font-semibold">• Vue d'ensemble en temps réel</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Tableau de bord Administrateur</h1>
              <p class="text-slate-600 text-xs sm:text-sm mt-1">Supervisez l'activité de la plateforme, modérez les nouvelles annonces et validez les comptes certifiés.</p>
            </div>

            <div class="flex items-center gap-3">
              <button (click)="loadDashboardData()" [disabled]="isLoading" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-slate-200 cursor-pointer">
                <i class="fa-solid fa-arrows-rotate text-xs" [class.fa-spin]="isLoading"></i>
                <span>Actualiser</span>
              </button>
            </div>
          </div>

          <!-- 6 CARTES DE STATISTIQUES CLIQUABLES -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            <!-- 1. Total Utilisateurs -->
            <div (click)="setTab('users')" class="metric-card cursor-pointer group hover:border-sky-300">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Utilisateurs</span>
                <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center text-base group-hover:scale-105 transition">
                  <i class="fa-solid fa-users"></i>
                </div>
              </div>
              <h3 class="text-3xl font-black text-slate-900 mt-3">{{ data?.stats?.total_users ?? 0 }}</h3>
              <p class="text-[11px] text-sky-600 font-bold mt-1.5 flex items-center gap-1">
                <span>Gérer les comptes</span> <i class="fa-solid fa-arrow-right text-[9px] group-hover:translate-x-1 transition"></i>
              </p>
            </div>

            <!-- 2. Propriétaires & Agences -->
            <div (click)="setTab('users', 'owner')" class="metric-card cursor-pointer group hover:border-emerald-300">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Propriétaires & Agences</span>
                <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-base group-hover:scale-105 transition">
                  <i class="fa-solid fa-user-tie"></i>
                </div>
              </div>
              <h3 class="text-3xl font-black text-emerald-700 mt-3">{{ data?.stats?.total_owners_agencies ?? 0 }}</h3>
              <p class="text-[11px] text-slate-600 font-semibold mt-1.5">Annonceurs enregistrés</p>
            </div>

            <!-- 3. Annonces Publiées -->
            <div (click)="setTab('properties', 'available')" class="metric-card cursor-pointer group hover:border-orange-300">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Annonces Actives</span>
                <div class="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center text-base group-hover:scale-105 transition">
                  <i class="fa-solid fa-house-circle-check"></i>
                </div>
              </div>
              <h3 class="text-3xl font-black text-orange-600 mt-3">{{ data?.stats?.total_published_properties ?? 0 }}</h3>
              <p class="text-[11px] text-slate-600 font-semibold mt-1.5">Biens en ligne et visibles</p>
            </div>

            <!-- 4. Annonces en Attente -->
            <div (click)="setTab('properties', 'pending')" class="metric-card cursor-pointer group hover:border-amber-300" [class.border-amber-300]="data?.stats?.pending_properties">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">En attente de validation</span>
                <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center text-base group-hover:scale-105 transition">
                  <i class="fa-solid fa-clock"></i>
                </div>
              </div>
              <h3 class="text-3xl font-black text-amber-600 mt-3">{{ data?.stats?.pending_properties ?? 0 }}</h3>
              <p class="text-[11px] text-amber-700 font-bold mt-1.5">Annonces à contrôler</p>
            </div>

            <!-- 5. Vérifications en Attente -->
            <div (click)="setTab('verifications', 'pending')" class="metric-card cursor-pointer group hover:border-purple-300" [class.border-purple-300]="data?.stats?.pending_verifications">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Vérifications en attente</span>
                <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center text-base group-hover:scale-105 transition">
                  <i class="fa-solid fa-id-card"></i>
                </div>
              </div>
              <h3 class="text-3xl font-black text-purple-700 mt-3">{{ data?.stats?.pending_verifications ?? 0 }}</h3>
              <p class="text-[11px] text-purple-700 font-bold mt-1.5">CNI & NINEA à vérifier</p>
            </div>

            <!-- 6. Signalements à Traiter -->
            <div (click)="setTab('reports', 'pending')" class="metric-card cursor-pointer group hover:border-red-300" [class.border-red-300]="data?.stats?.pending_reports">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Signalements à traiter</span>
                <div class="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center text-base group-hover:scale-105 transition">
                  <i class="fa-solid fa-flag"></i>
                </div>
              </div>
              <h3 class="text-3xl font-black text-red-600 mt-3">{{ data?.stats?.pending_reports ?? 0 }}</h3>
              <p class="text-[11px] text-red-700 font-bold mt-1.5">Abus ou fausses annonces</p>
            </div>

          </div>

          <!-- SECTION: ACTIONS PRIORITAIRES À TRAITER -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- Signalements urgents -->
            <div class="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <div class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
                  <h3 class="font-extrabold text-slate-900 text-base">Signalements récents</h3>
                </div>
                <button (click)="setTab('reports')" class="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer">
                  Voir tout ({{ data?.stats?.pending_reports ?? 0 }}) &rarr;
                </button>
              </div>

              <div *ngIf="!data?.urgent_reports?.length" class="text-center py-8 text-slate-400 text-xs">
                <i class="fa-solid fa-circle-check text-2xl text-emerald-500/60 mb-2 block"></i>
                Aucun signalement en attente de traitement.
              </div>

              <div *ngFor="let rep of data?.urgent_reports" class="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-3 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="bg-red-100 text-red-700 border border-red-200 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                    {{ rep.reason }}
                  </span>
                  <span class="text-[10px] text-slate-400">{{ rep.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
                <p class="text-xs text-slate-900 font-bold" *ngIf="rep.property">
                  Annonce #{{ rep.property_id }} : {{ rep.property.title }}
                </p>
                <p class="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-200/60">
                  "{{ rep.details }}"
                </p>
                <div class="flex items-center justify-between pt-1 text-[11px]">
                  <span class="text-slate-500">Par : {{ rep.reporter_email }}</span>
                  <div class="flex gap-2">
                    <button (click)="quickResolveReport(rep.id, 'dismissed')" class="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-bold cursor-pointer">
                      Ignorer
                    </button>
                    <button (click)="quickResolveReport(rep.id, 'resolved', 'property_suspended')" class="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-xs cursor-pointer">
                      Suspendre bien
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Demandes de vérification de badges prioritaires -->
            <div class="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <div class="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                  <h3 class="font-extrabold text-slate-900 text-base">Vérifications d'authenticité</h3>
                </div>
                <button (click)="setTab('verifications')" class="text-xs font-bold text-purple-600 hover:text-purple-700 cursor-pointer">
                  Voir tout ({{ data?.stats?.pending_verifications ?? 0 }}) &rarr;
                </button>
              </div>

              <div *ngIf="!data?.urgent_verifications?.length" class="text-center py-8 text-slate-400 text-xs">
                <i class="fa-solid fa-circle-check text-2xl text-emerald-500/60 mb-2 block"></i>
                Toutes les demandes de vérification ont été examinées.
              </div>

              <div *ngFor="let verif of data?.urgent_verifications" class="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-3 space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span [class.bg-emerald-100]="verif.user_type === 'agency'" [class.text-emerald-800]="verif.user_type === 'agency'" [class.bg-orange-100]="verif.user_type === 'owner'" [class.text-orange-800]="verif.user_type === 'owner'" class="text-[10px] font-black uppercase px-2 py-0.5 rounded border border-slate-200">
                      {{ verif.user_type === 'agency' ? 'Agence' : 'Propriétaire' }}
                    </span>
                    <span class="text-xs font-extrabold text-slate-900">{{ verif.user_name }}</span>
                  </div>
                  <span class="text-[10px] text-slate-400">{{ verif.created_at | date:'dd/MM/yyyy' }}</span>
                </div>

                <div class="text-xs text-slate-600 flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200/60">
                  <span>Document : <strong class="text-slate-900">{{ verif.document_type }}</strong> ({{ verif.document_number }})</span>
                  <a [href]="verif.document_url || '#'" target="_blank" class="text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 font-bold">
                    <i class="fa-solid fa-paperclip"></i> Justificatif
                  </a>
                </div>

                <div class="flex items-center justify-end gap-2 pt-1">
                  <button (click)="openRejectModal(verif)" class="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer">
                    Refuser
                  </button>
                  <button (click)="approveVerification(verif.id)" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-xs flex items-center gap-1.5 cursor-pointer">
                    <i class="fa-solid fa-badge-check"></i> Accorder le badge
                  </button>
                </div>
              </div>
            </div>

          </div>

          <!-- SECTION: DERNIÈRES ANNONCES ENREGISTRÉES -->
          <div class="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-extrabold text-slate-900 text-base">Dernières annonces publiées sur Izivilla</h3>
                <p class="text-slate-500 text-xs">Vue synthétique des derniers biens mis en ligne par les propriétaires et agences.</p>
              </div>
              <button (click)="setTab('properties')" class="text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer">
                Gérer toutes les annonces &rarr;
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200/80 text-[11px] font-black uppercase text-slate-500">
                    <th class="py-3 px-4">Bien</th>
                    <th class="py-3 px-4">Localisation</th>
                    <th class="py-3 px-4">Prix</th>
                    <th class="py-3 px-4">Annonceur</th>
                    <th class="py-3 px-4">Statut</th>
                    <th class="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs">
                  <tr *ngFor="let prop of data?.recent_properties" class="hover:bg-slate-50/80 transition">
                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-3">
                        <img [src]="prop.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=120&q=80'" class="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" alt="photo">
                        <div>
                          <p class="font-bold text-slate-900 max-w-xs truncate">{{ prop.title }}</p>
                          <span class="text-[10px] text-slate-500 font-semibold">{{ prop.property_type }} • {{ prop.transaction_type === 'rent' ? 'Location' : 'Vente' }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="py-3.5 px-4 text-slate-600 font-medium">
                      {{ prop.quartier }}, {{ prop.city }}
                    </td>
                    <td class="py-3.5 px-4 font-black text-emerald-600 whitespace-nowrap">
                      {{ prop.price_fcfa | number }} FCFA
                    </td>
                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-1.5">
                        <span class="font-bold text-slate-900">{{ prop.owner_name || 'Particulier' }}</span>
                        <i *ngIf="prop.is_verified" class="fa-solid fa-circle-check text-sky-500 text-xs" title="Annonceur vérifié"></i>
                      </div>
                      <span class="text-[10px] text-slate-400">{{ prop.owner_phone || prop.contact_phone }}</span>
                    </td>
                    <td class="py-3.5 px-4">
                      <span [class.bg-emerald-50]="prop.status === 'available' || prop.status === 'published'"
                            [class.text-emerald-700]="prop.status === 'available' || prop.status === 'published'"
                            [class.border-emerald-200]="prop.status === 'available' || prop.status === 'published'"
                            [class.bg-amber-50]="prop.status === 'pending'"
                            [class.text-amber-700]="prop.status === 'pending'"
                            [class.border-amber-200]="prop.status === 'pending'"
                            [class.bg-red-50]="prop.status === 'suspended'"
                            [class.text-red-700]="prop.status === 'suspended'"
                            [class.border-red-200]="prop.status === 'suspended'"
                            class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border">
                        {{ prop.status === 'available' ? 'Publiée' : (prop.status === 'pending' ? 'En attente' : prop.status) }}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        <button *ngIf="prop.status !== 'available'" (click)="updatePropertyStatus(prop.id, 'available')" class="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs cursor-pointer" title="Publier / Activer">
                          <i class="fa-solid fa-check"></i>
                        </button>
                        <button *ngIf="prop.status === 'available'" (click)="updatePropertyStatus(prop.id, 'suspended')" class="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg text-xs cursor-pointer" title="Suspendre l'annonce">
                          <i class="fa-solid fa-pause"></i>
                        </button>
                        <button (click)="confirmDeleteProperty(prop)" class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs cursor-pointer" title="Supprimer">
                          <i class="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- ============================================================== -->
        <!-- TAB 2: GESTION DES ANNONCES IMMOBILIÈRES -->
        <!-- ============================================================== -->
        <div *ngIf="currentTab === 'properties'" class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="text-2xl font-black text-slate-900">Gestion des annonces immobilières</h2>
              <p class="text-slate-500 text-xs">Filtrez, contrôlez la conformité des biens et modérez les publications.</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-bold shadow-xs">
                {{ propertiesTotal }} annonce(s) trouvée(s)
              </span>
            </div>
          </div>

          <!-- Filtres de recherche -->
          <div class="bg-white border border-slate-200/80 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs shadow-xs">
            <div>
              <label class="block text-slate-500 font-bold mb-1">Recherche</label>
              <input type="text" [(ngModel)]="propFilterSearch" (input)="filterProperties()" placeholder="Titre, ville, annonceur..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition">
            </div>

            <div>
              <label class="block text-slate-500 font-bold mb-1">Statut</label>
              <select [(ngModel)]="propFilterStatus" (change)="filterProperties()" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition">
                <option value="all">Tous les statuts</option>
                <option value="available">Actives / Publiées</option>
                <option value="pending">En attente de validation</option>
                <option value="suspended">Suspendues</option>
                <option value="rented">Louées / Vendues</option>
              </select>
            </div>

            <div>
              <label class="block text-slate-500 font-bold mb-1">Ville</label>
              <select [(ngModel)]="propFilterCity" (change)="filterProperties()" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition">
                <option value="all">Toutes les villes</option>
                <option value="Dakar">Dakar</option>
                <option value="Thiès">Thiès</option>
                <option value="Saly">Saly</option>
                <option value="Rufisque">Rufisque</option>
              </select>
            </div>

            <div>
              <label class="block text-slate-500 font-bold mb-1">Type de bien</label>
              <select [(ngModel)]="propFilterType" (change)="filterProperties()" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition">
                <option value="all">Tous les types</option>
                <option value="Villa">Villa</option>
                <option value="Appartement">Appartement</option>
                <option value="Studio">Studio</option>
                <option value="Terrain">Terrain</option>
                <option value="Bureau">Bureau / Commercial</option>
              </select>
            </div>
          </div>

          <!-- Tableau des annonces -->
          <div class="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200/80 text-[11px] font-black uppercase text-slate-500">
                    <th class="py-4 px-6">Bien & Titre</th>
                    <th class="py-4 px-6">Prix FCFA</th>
                    <th class="py-4 px-6">Emplacement</th>
                    <th class="py-4 px-6">Annonceur</th>
                    <th class="py-4 px-6">Statut</th>
                    <th class="py-4 px-6 text-right">Actions de modération</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs">
                  <tr *ngFor="let p of propertiesList" class="hover:bg-slate-50/70 transition">
                    <td class="py-4 px-6">
                      <div class="flex items-center gap-3">
                        <img [src]="p.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=120&q=80'" class="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" alt="photo">
                        <div>
                          <a [routerLink]="['/annonces', p.id]" target="_blank" class="font-bold text-slate-900 hover:text-orange-600 transition flex items-center gap-1.5">
                            <span>{{ p.title }}</span>
                            <i class="fa-solid fa-arrow-up-right-from-square text-[10px] text-slate-400"></i>
                          </a>
                          <div class="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span>{{ p.property_type }}</span>
                            <span>•</span>
                            <span class="text-orange-600 font-semibold">{{ p.transaction_type === 'rent' ? 'Location' : 'Vente' }}</span>
                            <span>•</span>
                            <span>{{ p.views_count || 0 }} vues</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="py-4 px-6 font-black text-emerald-600 whitespace-nowrap text-sm">
                      {{ p.price_fcfa | number }} FCFA
                    </td>
                    <td class="py-4 px-6 text-slate-600 whitespace-nowrap">
                      {{ p.quartier }}, {{ p.city }}
                    </td>
                    <td class="py-4 px-6">
                      <div class="flex items-center gap-1.5 font-bold text-slate-900">
                        <span>{{ p.owner_name || 'Particulier' }}</span>
                        <i *ngIf="p.is_verified" class="fa-solid fa-circle-check text-sky-500 text-xs" title="Vérifié"></i>
                      </div>
                      <span class="text-[11px] text-slate-400">{{ p.owner_phone || p.contact_phone }}</span>
                    </td>
                    <td class="py-4 px-6">
                      <span [class.bg-emerald-50]="p.status === 'available'"
                            [class.text-emerald-700]="p.status === 'available'"
                            [class.border-emerald-200]="p.status === 'available'"
                            [class.bg-amber-50]="p.status === 'pending'"
                            [class.text-amber-700]="p.status === 'pending'"
                            [class.border-amber-200]="p.status === 'pending'"
                            [class.bg-red-50]="p.status === 'suspended'"
                            [class.text-red-700]="p.status === 'suspended'"
                            [class.border-red-200]="p.status === 'suspended'"
                            class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border">
                        {{ p.status === 'available' ? 'Publiée' : (p.status === 'pending' ? 'En attente' : p.status) }}
                      </span>
                    </td>
                    <td class="py-4 px-6 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-2">
                        <button *ngIf="p.status !== 'available'" (click)="updatePropertyStatus(p.id, 'available')" class="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer">
                          <i class="fa-solid fa-check"></i> Valider
                        </button>
                        <button *ngIf="p.status === 'available'" (click)="updatePropertyStatus(p.id, 'suspended')" class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-amber-800 rounded-lg font-bold text-xs border border-slate-200 cursor-pointer">
                          <i class="fa-solid fa-pause"></i> Suspendre
                        </button>
                        <button (click)="confirmDeleteProperty(p)" class="px-2.5 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-lg text-xs transition border border-slate-200 cursor-pointer">
                          <i class="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- TAB 3: GESTION DES UTILISATEURS -->
        <!-- ============================================================== -->
        <div *ngIf="currentTab === 'users'" class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="text-2xl font-black text-slate-900">Gestion des utilisateurs</h2>
              <p class="text-slate-500 text-xs">Gérez les comptes clients, propriétaires, agences et administrateurs.</p>
            </div>
          </div>

          <!-- Filtres -->
          <div class="bg-white border border-slate-200/80 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs shadow-xs">
            <div>
              <label class="block text-slate-500 font-bold mb-1">Recherche</label>
              <input type="text" [(ngModel)]="userFilterSearch" (input)="loadUsers()" placeholder="Nom, email, téléphone..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition">
            </div>

            <div>
              <label class="block text-slate-500 font-bold mb-1">Rôle</label>
              <select [(ngModel)]="userFilterRole" (change)="loadUsers()" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition">
                <option value="all">Tous les rôles</option>
                <option value="owner">Propriétaire</option>
                <option value="agency">Agence immobilière</option>
                <option value="tenant">Client / Locataire</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>

            <div>
              <label class="block text-slate-500 font-bold mb-1">Statut compte</label>
              <select [(ngModel)]="userFilterStatus" (change)="loadUsers()" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition">
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="suspended">Suspendu</option>
              </select>
            </div>
          </div>

          <!-- Table des utilisateurs -->
          <div class="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200/80 text-[11px] font-black uppercase text-slate-500">
                    <th class="py-4 px-6">Utilisateur</th>
                    <th class="py-4 px-6">Téléphone</th>
                    <th class="py-4 px-6">Rôle</th>
                    <th class="py-4 px-6">Badge Vérifié</th>
                    <th class="py-4 px-6">Statut</th>
                    <th class="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs">
                  <tr *ngFor="let u of usersList" class="hover:bg-slate-50/70 transition">
                    <td class="py-4 px-6">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-black text-sm flex items-center justify-center shrink-0 border border-slate-200">
                          {{ u.name.charAt(0).toUpperCase() }}
                        </div>
                        <div>
                          <p class="font-bold text-slate-900">{{ u.name }}</p>
                          <span class="text-[11px] text-slate-500 font-mono">{{ u.email }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="py-4 px-6 font-mono text-slate-600">
                      {{ u.phone || 'Non renseigné' }}
                    </td>
                    <td class="py-4 px-6">
                      <span [class.bg-purple-50]="u.role === 'admin'" [class.text-purple-700]="u.role === 'admin'"
                            [class.bg-emerald-50]="u.role === 'agency'" [class.text-emerald-700]="u.role === 'agency'"
                            [class.bg-orange-50]="u.role === 'owner'" [class.text-orange-700]="u.role === 'owner'"
                            [class.bg-sky-50]="u.role === 'tenant' || u.role === 'user'" [class.text-sky-700]="u.role === 'tenant' || u.role === 'user'"
                            class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded border border-slate-200">
                        {{ u.role === 'tenant' ? 'Client' : (u.role === 'owner' ? 'Propriétaire' : (u.role === 'agency' ? 'Agence' : u.role)) }}
                      </span>
                    </td>
                    <td class="py-4 px-6">
                      <span *ngIf="u.is_verified" class="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <i class="fa-solid fa-circle-check"></i> Certifié
                      </span>
                      <span *ngIf="!u.is_verified" class="text-slate-400 text-[11px]">Non certifié</span>
                    </td>
                    <td class="py-4 px-6">
                      <span *ngIf="u.is_active !== false" class="text-emerald-700 font-bold flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Actif
                      </span>
                      <span *ngIf="u.is_active === false" class="text-red-700 font-bold flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> Suspendu
                      </span>
                    </td>
                    <td class="py-4 px-6 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-2">
                        <button (click)="toggleUserActive(u)" class="px-3 py-1.5 rounded-xl font-bold text-xs transition border cursor-pointer"
                                [class.bg-red-50]="u.is_active !== false" [class.text-red-700]="u.is_active !== false" [class.border-red-200]="u.is_active !== false"
                                [class.bg-emerald-50]="u.is_active === false" [class.text-emerald-700]="u.is_active === false" [class.border-emerald-200]="u.is_active === false">
                          {{ u.is_active !== false ? 'Suspendre' : 'Réactiver' }}
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- TAB 4: VÉRIFICATION DES PROFILS (BADGES CERTIFIÉS) -->
        <!-- ============================================================== -->
        <div *ngIf="currentTab === 'verifications'" class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-black text-slate-900">Vérification des propriétaires et des agences</h2>
              <p class="text-slate-500 text-xs">Examinez les justificatifs d'identité (CNI, Registre de commerce) et décernez les badges de confiance.</p>
            </div>
          </div>

          <div class="space-y-4">
            <div *ngFor="let v of verificationsList" class="bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
              <div class="space-y-2.5">
                <div class="flex items-center gap-2">
                  <span [class.bg-emerald-50]="v.user_type === 'agency'" [class.text-emerald-700]="v.user_type === 'agency'" [class.bg-orange-50]="v.user_type === 'owner'" [class.text-orange-700]="v.user_type === 'owner'" class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded border border-slate-200">
                    {{ v.user_type === 'agency' ? 'Agence Immobilière' : 'Propriétaire Particulier' }}
                  </span>
                  
                  <span *ngIf="v.status === 'pending'" class="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                    <i class="fa-solid fa-hourglass-start mr-1"></i> En attente de contrôle
                  </span>
                  <span *ngIf="v.status === 'approved'" class="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                    <i class="fa-solid fa-circle-check mr-1"></i> Badge Certifié Accordé
                  </span>
                  <span *ngIf="v.status === 'rejected'" class="bg-red-50 text-red-700 border border-red-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                    <i class="fa-solid fa-circle-xmark mr-1"></i> Refusé
                  </span>
                </div>

                <h3 class="text-lg font-black text-slate-900">{{ v.user_name }}</h3>
                
                <div class="text-xs text-slate-600 space-y-1">
                  <p><i class="fa-solid fa-envelope w-4 text-slate-400"></i> {{ v.user_email }}</p>
                  <p><i class="fa-solid fa-phone w-4 text-slate-400"></i> {{ v.user_phone || 'Non renseigné' }}</p>
                  <p><i class="fa-solid fa-file-lines w-4 text-slate-400"></i> Justificatif : <strong class="text-slate-900">{{ v.document_type }}</strong> — N° <code>{{ v.document_number }}</code></p>
                </div>

                <div class="pt-1">
                  <a [href]="v.document_url || '#'" target="_blank" class="inline-flex items-center gap-1.5 text-xs text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-xl font-bold hover:bg-sky-100 transition">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Ouvrir et examiner la pièce justificative
                  </a>
                </div>

                <div *ngIf="v.rejection_reason" class="bg-red-50 border border-red-200 p-3 rounded-xl text-xs text-red-700 mt-2">
                  <strong class="block text-red-800">Motif du refus :</strong>
                  {{ v.rejection_reason }}
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <button *ngIf="v.status !== 'approved'" (click)="approveVerification(v.id)" class="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer">
                  <i class="fa-solid fa-badge-check"></i> Accorder le badge
                </button>
                <button *ngIf="v.status === 'pending'" (click)="openRejectModal(v)" class="bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 font-bold px-3.5 py-2.5 rounded-xl text-xs transition border border-slate-200 cursor-pointer">
                  <i class="fa-solid fa-xmark"></i> Refuser avec motif
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- TAB 5: GESTION DES SIGNALEMENTS -->
        <!-- ============================================================== -->
        <div *ngIf="currentTab === 'reports'" class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-black text-slate-900">Gestion des signalements</h2>
              <p class="text-slate-500 text-xs">Examinez les alertes de sécurité, fausses annonces et comportements suspects signalés par les utilisateurs.</p>
            </div>
          </div>

          <div class="space-y-4">
            <div *ngFor="let rep of reportsList" class="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div class="flex items-center gap-2">
                  <span class="bg-red-100 text-red-700 border border-red-200 text-xs font-black uppercase px-2.5 py-0.5 rounded">
                    {{ rep.reason }}
                  </span>
                  <span class="text-xs text-slate-400">Signalé le {{ rep.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
                <span [class.bg-amber-50]="rep.status === 'pending'" [class.text-amber-700]="rep.status === 'pending'"
                      [class.bg-emerald-50]="rep.status === 'resolved'" [class.text-emerald-700]="rep.status === 'resolved'"
                      [class.bg-slate-100]="rep.status === 'dismissed'" [class.text-slate-600]="rep.status === 'dismissed'"
                      class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-slate-200 w-fit">
                  {{ rep.status === 'pending' ? 'En attente' : (rep.status === 'resolved' ? 'Traité' : 'Rejeté / Ignoré') }}
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <p class="text-xs text-slate-500 font-bold uppercase tracking-wider">Détails du signalement :</p>
                  <p class="text-xs text-slate-800 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 leading-relaxed italic">
                    "{{ rep.details }}"
                  </p>
                  <p class="text-[11px] text-slate-500">Signalé par : <strong class="text-slate-800">{{ rep.reporter_name || 'Visiteur' }}</strong> ({{ rep.reporter_email }})</p>
                </div>

                <div class="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80" *ngIf="rep.property">
                  <p class="text-xs text-slate-500 font-bold uppercase tracking-wider">Annonce concernée :</p>
                  <div class="flex items-center gap-3">
                    <img [src]="rep.property.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=120&q=80'" class="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200" alt="img">
                    <div>
                      <a [routerLink]="['/annonces', rep.property.id]" target="_blank" class="font-bold text-slate-900 hover:text-orange-600 text-xs">
                        #{{ rep.property.id }} — {{ rep.property.title }}
                      </a>
                      <p class="text-xs text-emerald-600 font-black mt-0.5">{{ rep.property.price_fcfa | number }} FCFA</p>
                      <p class="text-[11px] text-slate-400">{{ rep.property.quartier }}, {{ rep.property.city }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button (click)="quickResolveReport(rep.id, 'dismissed')" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer">
                  Rejeter le signalement
                </button>
                <button (click)="quickResolveReport(rep.id, 'resolved', 'property_suspended')" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-xs transition flex items-center gap-1.5 cursor-pointer">
                  <i class="fa-solid fa-ban"></i> Suspendre l'annonce & Valider
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- TAB 6: JOURNAL D'ACTIVITÉ -->
        <!-- ============================================================== -->
        <div *ngIf="currentTab === 'logs'" class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-black text-slate-900">Journal d'activité administrateur</h2>
              <p class="text-slate-500 text-xs">Traçabilité complète des actions effectuées pour garantir l'intégrité de la plateforme.</p>
            </div>
          </div>

          <div class="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
            <div class="divide-y divide-slate-100">
              <div *ngFor="let log of activityLogs" class="p-4 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="bg-slate-100 text-slate-700 font-mono text-[10px] px-2 py-0.5 rounded font-black border border-slate-200">
                      {{ log.action }}
                    </span>
                    <span class="font-extrabold text-slate-900">{{ log.admin_name }}</span>
                  </div>
                  <p class="text-slate-600">{{ log.details }}</p>
                </div>
                <div class="text-[11px] text-slate-400 text-right shrink-0">
                  <p>{{ log.created_at | date:'dd/MM/yyyy HH:mm:ss' }}</p>
                  <p class="font-mono text-[10px]">IP: {{ log.ip_address || '127.0.0.1' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- TAB 7: STATISTIQUES ET RAPPORTS -->
        <!-- ============================================================== -->
        <div *ngIf="currentTab === 'analytics'" class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-black text-slate-900">Statistiques et rapports</h2>
              <p class="text-slate-500 text-xs">Indicateurs de croissance et répartition des biens immobiliers sur IZIVILLA.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Répartition par Ville -->
            <div class="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4">
              <h3 class="font-extrabold text-slate-900 text-base">Répartition par Ville</h3>
              <div class="space-y-3">
                <div *ngFor="let c of analyticsData?.by_city" class="space-y-1">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-bold text-slate-800">{{ c.city }}</span>
                    <span class="text-slate-500 font-mono">{{ c.count }} annonce(s)</span>
                  </div>
                  <div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div class="h-full bg-orange-500 rounded-full" [style.width.%]="(c.count / (propertiesTotal || 1)) * 100"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Transaction Type -->
            <div class="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4">
              <h3 class="font-extrabold text-slate-900 text-base">Répartition Location vs Vente</h3>
              <div class="space-y-3">
                <div *ngFor="let t of analyticsData?.by_transaction" class="space-y-1">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-bold text-slate-800">{{ t.transaction_type === 'rent' ? 'Location' : 'Vente' }}</span>
                    <span class="text-slate-500 font-mono">{{ t.count }} bien(s)</span>
                  </div>
                  <div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div class="h-full bg-emerald-500 rounded-full" [style.width.%]="(t.count / (propertiesTotal || 1)) * 100"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- TAB 8: PARAMÈTRES -->
        <!-- ============================================================== -->
        <div *ngIf="currentTab === 'settings'" class="space-y-6">
          <div class="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 max-w-2xl">
            <h2 class="text-2xl font-black text-slate-900">Paramètres de la plateforme</h2>
            
            <div class="space-y-4 text-xs">
              <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <p class="font-extrabold text-slate-900 text-sm mb-1">Passerelle SMS & WhatsApp</p>
                <p class="text-slate-600 mb-2">Service Twilio Verify API configuré pour l'envoi des OTP officiels aux utilisateurs.</p>
                <span class="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold rounded-full text-[10px]">
                  <i class="fa-solid fa-check mr-1"></i> Twilio Verify : Opérationnel
                </span>
              </div>

              <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <p class="font-extrabold text-slate-900 text-sm mb-1">Base de données PostgreSQL Neon</p>
                <p class="text-slate-600 mb-2">Connexion permanente active sur le serveur Neon AWS Europe.</p>
                <span class="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold rounded-full text-[10px]">
                  <i class="fa-solid fa-database mr-1"></i> PostgreSQL Neon : Connecté
                </span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>

    <!-- MODAL CONFIRMATION SUPPRESSION ANNONCE -->
    <div *ngIf="propertyToDelete" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left">
        <div class="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-xl font-bold border border-red-100">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3 class="text-lg font-black text-slate-900">Confirmer la suppression</h3>
        <p class="text-xs text-slate-600">
          Êtes-vous sûr de vouloir supprimer définitivement l'annonce <strong>« {{ propertyToDelete.title }} »</strong> ? Cette action est irréversible.
        </p>
        <div class="flex items-center justify-end gap-2 pt-2">
          <button (click)="propertyToDelete = null" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">
            Annuler
          </button>
          <button (click)="executeDeleteProperty()" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer">
            Supprimer définitivement
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL REFUS AVEC MOTIF (VÉRIFICATION) -->
    <div *ngIf="verificationToReject" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left">
        <h3 class="text-lg font-black text-slate-900">Motif du refus de vérification</h3>
        <p class="text-xs text-slate-600">
          Indiquez le motif exact pour lequel le dossier de <strong>{{ verificationToReject.user_name }}</strong> ne peut pas être validé. Ce motif lui sera communiqué.
        </p>
        <textarea [(ngModel)]="rejectionReason" rows="3" placeholder="Ex: La pièce d'identité fournie est illisible ou a expiré..." class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"></textarea>
        <div class="flex items-center justify-end gap-2 pt-2">
          <button (click)="verificationToReject = null; rejectionReason = ''" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">
            Annuler
          </button>
          <button (click)="executeRejectVerification()" [disabled]="!rejectionReason.trim()" class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer">
            Confirmer le refus
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nav-item {
      @apply w-full flex items-center px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all font-bold text-xs cursor-pointer;
    }
    .active-nav {
      @apply bg-orange-600 text-white shadow-md shadow-orange-500/25 hover:bg-orange-600 hover:text-white;
    }
    .metric-card {
      @apply bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-sm;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  currentTab: AdminTab = 'dashboard';
  isMobileMenuOpen = false;
  isLoading = false;

  data: AdminDashboardData | null = null;
  feedbackMessage = '';
  feedbackType: 'success' | 'error' = 'success';

  // Properties tab
  propertiesList: any[] = [];
  propertiesTotal = 0;
  propFilterSearch = '';
  propFilterStatus = 'all';
  propFilterCity = 'all';
  propFilterType = 'all';

  // Users tab
  usersList: any[] = [];
  userFilterSearch = '';
  userFilterRole = 'all';
  userFilterStatus = 'all';

  // Verifications tab
  verificationsList: any[] = [];

  // Reports tab
  reportsList: any[] = [];

  // Logs & Analytics
  activityLogs: any[] = [];
  analyticsData: any = null;

  // Modals state
  propertyToDelete: any = null;
  verificationToReject: any = null;
  rejectionReason = '';

  constructor(
    private adminService: AdminService,
    public propertyService: PropertyService,
    public langService: LanguageService,
    public countryService: CountryService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  setTab(tab: AdminTab, filterParam?: string): void {
    this.currentTab = tab;
    this.isMobileMenuOpen = false;

    if (tab === 'dashboard') {
      this.loadDashboardData();
    } else if (tab === 'properties') {
      if (filterParam) this.propFilterStatus = filterParam;
      this.filterProperties();
    } else if (tab === 'users') {
      if (filterParam) this.userFilterRole = filterParam;
      this.loadUsers();
    } else if (tab === 'verifications') {
      this.loadVerifications();
    } else if (tab === 'reports') {
      this.loadReports();
    } else if (tab === 'logs') {
      this.loadLogs();
    } else if (tab === 'analytics') {
      this.loadAnalytics();
    }
  }

  showFeedback(msg: string, type: 'success' | 'error' = 'success'): void {
    this.feedbackMessage = msg;
    this.feedbackType = type;
    setTimeout(() => {
      this.feedbackMessage = '';
    }, 5000);
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.adminService.getDashboardStats().subscribe({
      next: (res) => {
        this.data = res;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  filterProperties(): void {
    this.adminService.getProperties({
      search: this.propFilterSearch,
      status: this.propFilterStatus,
      city: this.propFilterCity,
      property_type: this.propFilterType
    }).subscribe(res => {
      this.propertiesList = res.data || [];
      this.propertiesTotal = res.total || this.propertiesList.length;
    });
  }

  updatePropertyStatus(id: number, status: string): void {
    this.adminService.updatePropertyStatus(id, status).subscribe({
      next: (res) => {
        this.showFeedback(res.message);
        this.filterProperties();
        this.loadDashboardData();
      },
      error: () => {
        this.showFeedback("Erreur lors de la mise à jour du statut de l'annonce.", 'error');
      }
    });
  }

  confirmDeleteProperty(prop: any): void {
    this.propertyToDelete = prop;
  }

  executeDeleteProperty(): void {
    if (!this.propertyToDelete) return;
    const id = this.propertyToDelete.id;
    this.adminService.deleteProperty(id).subscribe({
      next: (res) => {
        this.showFeedback(res.message);
        this.propertyToDelete = null;
        this.filterProperties();
        this.loadDashboardData();
      },
      error: () => {
        this.showFeedback("Erreur lors de la suppression.", 'error');
      }
    });
  }

  loadUsers(): void {
    this.adminService.getUsers({
      search: this.userFilterSearch,
      role: this.userFilterRole,
      status: this.userFilterStatus
    }).subscribe(res => {
      this.usersList = res.data || [];
    });
  }

  toggleUserActive(u: any): void {
    const newStatus = u.is_active === false ? true : false;
    this.adminService.updateUser(u.id, { is_active: newStatus }).subscribe({
      next: (res) => {
        this.showFeedback(res.message);
        u.is_active = newStatus;
      },
      error: () => {
        this.showFeedback("Erreur lors de la modification du compte.", 'error');
      }
    });
  }

  loadVerifications(): void {
    this.adminService.getVerifications('all').subscribe(res => {
      this.verificationsList = res || [];
    });
  }

  approveVerification(id: number): void {
    this.adminService.approveVerification(id).subscribe({
      next: (res) => {
        this.showFeedback(res.message);
        this.loadVerifications();
        this.loadDashboardData();
      },
      error: () => {
        this.showFeedback("Erreur lors de la validation du badge.", 'error');
      }
    });
  }

  openRejectModal(v: any): void {
    this.verificationToReject = v;
    this.rejectionReason = '';
  }

  executeRejectVerification(): void {
    if (!this.verificationToReject || !this.rejectionReason.trim()) return;
    this.adminService.rejectVerification(this.verificationToReject.id, this.rejectionReason).subscribe({
      next: (res) => {
        this.showFeedback(res.message);
        this.verificationToReject = null;
        this.rejectionReason = '';
        this.loadVerifications();
        this.loadDashboardData();
      },
      error: () => {
        this.showFeedback("Erreur lors du rejet de la vérification.", 'error');
      }
    });
  }

  loadReports(): void {
    this.adminService.getReports('all').subscribe(res => {
      this.reportsList = res || [];
    });
  }

  quickResolveReport(id: number, status: string, actionTaken?: string): void {
    this.adminService.resolveReport(id, status, actionTaken).subscribe({
      next: (res) => {
        this.showFeedback(res.message);
        this.loadReports();
        this.loadDashboardData();
      },
      error: () => {
        this.showFeedback("Erreur lors du traitement du signalement.", 'error');
      }
    });
  }

  loadLogs(): void {
    this.adminService.getActivityLogs().subscribe(res => {
      this.activityLogs = res.data || [];
    });
  }

  loadAnalytics(): void {
    this.adminService.getAdvancedStats().subscribe(res => {
      this.analyticsData = res;
    });
  }
}
