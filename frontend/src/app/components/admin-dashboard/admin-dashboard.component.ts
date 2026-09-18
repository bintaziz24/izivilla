import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { LanguageService } from '../../services/language.service';
import { CountryService } from '../../services/country.service';
import { VerificationRequest, PropertyReport } from '../../models/property.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div *ngIf="currentRole === 'admin'" class="bg-slate-900 min-h-screen text-white py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
        
        <!-- Header Banner -->
        <div class="bg-slate-950 p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="bg-red-600 text-white text-xs font-black uppercase px-3 py-0.5 rounded-full tracking-wider">Super Admin</span>
              <span class="text-xs text-slate-400 font-bold">• Administration Izivilla Senegal</span>
            </div>
            <h1 class="text-3xl font-black text-white tracking-tight">Panneau de Contrôle & Modération</h1>
            <p class="text-slate-400 text-sm mt-1">Supervisez la validation des profils d'annonceurs, les signalements et les transactions de boost Mobile Money.</p>
          </div>

          <div class="flex items-center gap-3">
            <span class="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-extrabold text-emerald-400">
              <i class="fa-solid fa-signal mr-1.5"></i> Serveur API Laravel : Actif
            </span>
          </div>
        </div>

        <!-- Metric Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div class="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Vérifications en attente</p>
              <h3 class="text-3xl font-black text-amber-400 mt-1">{{ pendingVerificationsCount }}</h3>
              <p class="text-[11px] text-amber-400 font-bold mt-1"><i class="fa-solid fa-clock"></i> Badges à valider</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold">
              <i class="fa-solid fa-user-shield"></i>
            </div>
          </div>

          <div class="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Signalements d'annonces</p>
              <h3 class="text-3xl font-black text-red-400 mt-1">{{ reports.length }}</h3>
              <p class="text-[11px] text-red-400 font-bold mt-1"><i class="fa-solid fa-flag"></i> À modérer</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center text-xl font-bold">
              <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
          </div>

          <div class="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Annonces Actives</p>
              <h3 class="text-3xl font-black text-white mt-1">{{ totalActiveProperties }}</h3>
              <p class="text-[11px] text-emerald-400 font-bold mt-1"><i class="fa-solid fa-check-double"></i> Biens enregistrés</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-orange-600/20 text-orange-500 flex items-center justify-center text-xl font-bold">
              <i class="fa-solid fa-house-chimney"></i>
            </div>
          </div>

          <div class="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenus Boosts Mobile</p>
              <h3 class="text-2xl font-black text-emerald-400 mt-1">{{ totalBoostRevenue | number }} {{ countryService.currentCountry.currency }}</h3>
              <p class="text-[11px] text-slate-400 font-bold mt-1">Cumul réel Wave & OM</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-xl font-bold">
              <i class="fa-solid fa-wallet"></i>
            </div>
          </div>

        </div>

        <!-- Management Tabs -->
        <div class="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          
          <div class="flex border-b border-slate-800 overflow-x-auto text-xs font-bold">
            <button (click)="activeTab = 'verifications'" [class.border-b-2]="activeTab === 'verifications'" [class.border-orange-500]="activeTab === 'verifications'" [class.text-orange-400]="activeTab === 'verifications'" class="px-6 py-4 text-slate-400 hover:text-white transition-colors whitespace-nowrap">
              <i class="fa-solid fa-shield-check mr-2"></i> Valider les Badges Certifiés ({{ pendingVerificationsCount }})
            </button>
            <button (click)="activeTab = 'reports'" [class.border-b-2]="activeTab === 'reports'" [class.border-orange-500]="activeTab === 'reports'" [class.text-orange-400]="activeTab === 'reports'" class="px-6 py-4 text-slate-400 hover:text-white transition-colors whitespace-nowrap">
              <i class="fa-solid fa-flag mr-2"></i> Signalements d'Annonces ({{ reports.length }})
            </button>
            <button (click)="activeTab = 'transactions'" [class.border-b-2]="activeTab === 'transactions'" [class.border-orange-500]="activeTab === 'transactions'" [class.text-orange-400]="activeTab === 'transactions'" class="px-6 py-4 text-slate-400 hover:text-white transition-colors whitespace-nowrap">
              <i class="fa-solid fa-money-bill-wave mr-2"></i> Transactions Wave & OM ({{ transactions.length }})
            </button>
          </div>

          <!-- VERIFICATIONS TAB -->
          <div *ngIf="activeTab === 'verifications'" class="p-6 space-y-4">
            <div *ngIf="adminSuccessMsg" class="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs font-extrabold flex items-center gap-2">
              <i class="fa-solid fa-circle-check text-emerald-400 text-lg"></i>
              <span>{{ adminSuccessMsg }}</span>
            </div>

            <div *ngIf="verificationRequests.length === 0" class="text-center py-10 text-slate-400 text-xs">
              Aucune demande de vérification enregistrée.
            </div>

            <div *ngFor="let req of verificationRequests" class="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span [class.bg-emerald-950]="req.owner_type === 'agency'" [class.text-emerald-400]="req.owner_type === 'agency'" [class.bg-orange-950]="req.owner_type === 'owner'" [class.text-orange-400]="req.owner_type === 'owner'" class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded border border-slate-700">
                    {{ req.owner_type === 'agency' ? 'Demande Agence Vérifiée' : 'Demande Propriétaire Vérifié' }}
                  </span>

                  <!-- Status Badge -->
                  <span *ngIf="req.status === 'pending'" class="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    <i class="fa-solid fa-hourglass-start mr-1"></i> En attente de validation Admin
                  </span>
                  <span *ngIf="req.status === 'approved'" class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    <i class="fa-solid fa-circle-check mr-1"></i> Validé & Certifié par l'Admin
                  </span>
                  <span *ngIf="req.status === 'rejected'" class="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    <i class="fa-solid fa-circle-xmark mr-1"></i> Refusé par l'Admin
                  </span>
                </div>
                <h4 class="font-extrabold text-white text-base">{{ req.owner_name || req.user_name }}</h4>
                <p class="text-xs text-slate-300 font-mono">Document fourni : {{ req.document_number || 'CNI / NINEA' }}</p>
                <a [href]="req.document_url || '#'" target="_blank" class="text-xs text-sky-400 hover:underline flex items-center gap-1">
                  <i class="fa-solid fa-paperclip"></i> Consulter la pièce justificative (CNI / Registre de Commerce)
                </a>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <button *ngIf="req.status !== 'approved'" (click)="approveVerification(req.id)" class="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-lg transition-colors flex items-center gap-1.5">
                  <i class="fa-solid fa-shield-check"></i> Approuver & Accorder le Badge
                </button>
                <button *ngIf="req.status !== 'rejected'" (click)="rejectVerification(req.id)" class="bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-400 font-bold px-3.5 py-2.5 rounded-xl text-xs transition-colors border border-slate-700 flex items-center gap-1">
                  <i class="fa-solid fa-xmark"></i> Refuser
                </button>
              </div>
            </div>
          </div>

          <!-- REPORTS TAB -->
          <div *ngIf="activeTab === 'reports'" class="p-6 space-y-4">
            <div *ngIf="reports.length === 0" class="text-center py-10 text-slate-400 text-xs">
              Aucun signalement en attente.
            </div>

            <div *ngFor="let rep of reports" class="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="bg-red-950 text-red-400 border border-red-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded">
                    Signalement pour l'annonce #{{ rep.property_id }}
                  </span>
                  <span class="text-xs text-slate-500">{{ rep.created_at | date:'dd/MM/yyyy' }}</span>
                </div>
                <h4 class="font-extrabold text-white text-sm">Motif : {{ rep.reason }}</h4>
                <p class="text-xs text-slate-300 italic">"{{ rep.details }}"</p>
                <p class="text-[11px] text-slate-400">Signalé par : {{ rep.reporter_email }}</p>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <button (click)="resolveReport(rep.id)" class="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs transition-colors">
                  Ignorer
                </button>
                <button (click)="resolveReport(rep.id)" class="bg-red-600 hover:bg-red-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-colors">
                  Masquer l'annonce
                </button>
              </div>
            </div>
          </div>

          <!-- TRANSACTIONS TAB -->
          <div *ngIf="activeTab === 'transactions'" class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-900/60 border-b border-slate-800 text-xs font-extrabold text-slate-400 uppercase">
                  <th class="py-4 px-6">Réf. Transaction</th>
                  <th class="py-4 px-6">Annonceur</th>
                  <th class="py-4 px-6">Service Boost</th>
                  <th class="py-4 px-6">Montant</th>
                  <th class="py-4 px-6">Moyen de Paiement</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/80 text-xs font-semibold text-slate-300">
                <tr *ngFor="let tx of transactions" class="hover:bg-slate-900/50 transition-colors">
                  <td class="py-4 px-6 font-mono text-slate-400">{{ tx.ref }}</td>
                  <td class="py-4 px-6 font-bold text-white">{{ tx.agency }}</td>
                  <td class="py-4 px-6 text-slate-300">{{ tx.service }}</td>
                  <td class="py-4 px-6 font-black text-emerald-400">{{ tx.amount | number }} {{ countryService.currentCountry.currency }}</td>
                  <td class="py-4 px-6">
                    <span [class.bg-sky-950]="tx.method === 'Wave'" [class.text-sky-400]="tx.method === 'Wave'" [class.bg-orange-950]="tx.method === 'Orange Money'" [class.text-orange-400]="tx.method === 'Orange Money'" class="px-3 py-1 font-extrabold rounded-full text-[10px]">
                      {{ tx.method }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>

    <!-- ACCESS RESTRICTED SCREEN FOR NON-ADMINS -->
    <div *ngIf="currentRole !== 'admin'" class="bg-slate-900 min-h-screen text-white flex items-center justify-center p-6">
      <div class="max-w-md w-full bg-slate-950 p-8 rounded-3xl border border-slate-800 text-center space-y-4 shadow-2xl">
        <div class="w-16 h-16 bg-red-600/20 text-red-500 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto border border-red-500/30">
          <i class="fa-solid fa-lock"></i>
        </div>
        <h2 class="text-2xl font-black text-white">Accès Réservé à l'Administration</h2>
        <p class="text-slate-400 text-xs leading-relaxed">
          Sélectionnez le rôle "Admin" dans l'en-tête pour accéder au panneau d'administration et valider les badges.
        </p>
        <div class="pt-2">
          <a routerLink="/" class="btn-dark text-xs px-6 py-3 rounded-xl inline-flex items-center gap-2 font-bold">
            <i class="fa-solid fa-house"></i> Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  currentRole = 'admin';
  activeTab: 'verifications' | 'reports' | 'transactions' = 'verifications';

  verificationRequests: VerificationRequest[] = [];
  reports: PropertyReport[] = [];
  adminSuccessMsg = '';
  totalActiveProperties = 0;

  transactions = [
    { ref: 'WAVE-849201', agency: 'Amadou Sow (Propriétaire)', service: 'Boost Sponsorisé 30 jours', amount: 15000, method: 'Wave' },
    { ref: 'OM-492019', agency: 'Immo Conseil Sénégal', service: 'Boost Visibilité 7 jours', amount: 6000, method: 'Orange Money' }
  ];

  get pendingVerificationsCount(): number {
    return this.verificationRequests.filter(v => v.status === 'pending').length;
  }

  get totalBoostRevenue(): number {
    return this.transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  }

  constructor(
    private propertyService: PropertyService,
    public langService: LanguageService,
    public countryService: CountryService
  ) {}

  t(key: string): string {
    return this.langService.translate(key);
  }

  ngOnInit(): void {
    this.propertyService.currentRole$.subscribe(role => {
      this.currentRole = role;
    });

    this.loadAdminData();
  }

  loadAdminData(): void {
    this.propertyService.getVerificationRequests().subscribe((res: VerificationRequest[]) => {
      this.verificationRequests = res || [];
    });

    this.propertyService.getReports().subscribe((res: PropertyReport[]) => {
      this.reports = res || [];
    });

    this.propertyService.getProperties().subscribe(res => {
      const list = (res && res.data) ? res.data : res;
      this.totalActiveProperties = Array.isArray(list) ? list.length : this.propertyService.getAllPropertiesCombined().length;
    });
  }



  approveVerification(id: number): void {
    this.propertyService.approveVerification(id).subscribe(res => {
      this.adminSuccessMsg = res.message;
      this.loadAdminData();
      setTimeout(() => this.adminSuccessMsg = '', 4000);
    });
  }

  rejectVerification(id: number): void {
    this.propertyService.rejectVerification(id).subscribe(res => {
      this.adminSuccessMsg = res.message;
      this.loadAdminData();
      setTimeout(() => this.adminSuccessMsg = '', 4000);
    });
  }

  resolveReport(id?: number): void {
    if (!id) return;
    this.reports = this.reports.filter(r => r.id !== id);
  }
}

