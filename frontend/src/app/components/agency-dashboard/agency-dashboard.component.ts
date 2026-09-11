import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { LanguageService } from '../../services/language.service';
import { CountryService } from '../../services/country.service';
import { Property, VerificationRequest } from '../../models/property.model';

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

        <!-- Property Management Table -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 class="font-extrabold text-slate-900 text-lg">Gestion de votre catalogue d'annonces</h3>
              <p class="text-slate-500 text-xs mt-0.5">Suivez l'efficacité de vos annonces et déclenchez des visibilités prioritaires.</p>
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
                  <th class="py-3.5 px-6">Annonceur & Badge</th>
                  <th class="py-3.5 px-6">Prix ({{ countryService.currentCountry.currency }})</th>
                  <th class="py-3.5 px-6">Vues</th>
                  <th class="py-3.5 px-6">Mise en Avant</th>
                  <th class="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                <tr *ngFor="let prop of properties" class="hover:bg-slate-50/80 transition-colors">
                  
                  <td class="py-4 px-6 flex items-center gap-3">
                    <img [src]="getPrimaryImage(prop)" class="w-12 h-12 rounded-xl object-cover border border-slate-200">
                    <div>
                      <a [routerLink]="['/annonces', prop.id]" class="font-extrabold text-slate-900 text-sm hover:text-orange-600 line-clamp-1">
                        {{ prop.title }}
                      </a>
                      <span class="text-[11px] text-slate-400">{{ prop.quartier }}, {{ prop.city }}</span>
                    </div>
                  </td>

                  <td class="py-4 px-6">
                    <span class="font-bold text-slate-900">{{ prop.owner_name || 'Propriétaire Direct' }}</span>
                    <p class="text-[11px] text-emerald-600 font-bold" *ngIf="prop.is_verified">
                      <i class="fa-solid fa-circle-check"></i> {{ prop.owner_type === 'agency' ? 'Agence Vérifiée' : 'Propriétaire Vérifié' }}
                    </p>
                  </td>

                  <td class="py-4 px-6 font-black text-orange-600 text-sm">
                    {{ prop.price_fcfa | number }} {{ countryService.currentCountry.currency }}
                  </td>

                  <td class="py-4 px-6 font-bold text-slate-800">
                    <i class="fa-solid fa-eye text-slate-400 mr-1"></i> {{ prop.views_count }}
                  </td>

                  <td class="py-4 px-6">
                    <span *ngIf="prop.is_boosted" class="badge-boosted">
                      <i class="fa-solid fa-bolt"></i> Sponsorisée
                    </span>
                    <span *ngIf="!prop.is_boosted" class="px-2.5 py-1 bg-slate-100 text-slate-600 font-bold rounded-full text-[10px]">
                      Standard
                    </span>
                  </td>

                  <td class="py-4 px-6 text-right space-x-2">
                    <button (click)="openBoostModal(prop)" class="btn-orange text-[11px] px-3 py-1.5 rounded-lg">
                      <i class="fa-solid fa-bolt"></i> Booster (Wave/OM)
                    </button>
                  </td>

                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- DEMANDE DE VERIFICATION DE PROFIL MODAL -->
      <div *ngIf="showVerifyModal" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
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
      <div *ngIf="showCreateModal" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
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
      <div *ngIf="showBoostModal && targetProperty" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
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
              <p class="text-orange-600 text-xs font-bold">{{ targetProperty.price_fcfa | number }} {{ countryService.currentCountry.currency }}</p>
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
    this.loadUserData();
  }

  setAdminRole(): void {
    this.propertyService.currentRole$.next('admin');
  }

  loadUserData(): void {
    const user = this.propertyService.getCurrentUser();
    
    if (user && user.name) {
      this.verifyForm.owner_name = user.name;
    }

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
