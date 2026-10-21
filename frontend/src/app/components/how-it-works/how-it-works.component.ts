import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { PropertyService } from '../../services/property.service';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-slate-50 min-h-screen py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        <!-- HERO HEADER -->
        <div class="bg-slate-950 text-white rounded-3xl p-8 sm:p-14 border border-slate-800 shadow-2xl relative overflow-hidden text-center space-y-6">
          <div class="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>

          <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-extrabold text-xs uppercase tracking-widest">
            <i class="fa-solid fa-lightbulb"></i> Le concept Izivilla
          </span>

          <h1 class="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            « Zéro intermédiaire inutile. »
          </h1>

          <p class="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-medium">
            Trouvez votre bien immobilier et contactez directement le véritable annonceur : propriétaire direct ou agence agréée.
          </p>

          <!-- 3 PILLARS BADGES -->
          <div class="pt-4 flex flex-wrap justify-center gap-4 text-sm font-extrabold">
            <span class="px-5 py-2.5 bg-slate-900 border border-slate-700 rounded-2xl text-orange-400 flex items-center gap-2 shadow-sm">
              <i class="fa-solid fa-phone-volume text-orange-500"></i> DIRECT
            </span>
            <span class="px-5 py-2.5 bg-slate-900 border border-slate-700 rounded-2xl text-white flex items-center gap-2 shadow-sm">
              <i class="fa-solid fa-shield-check text-orange-500"></i> IDENTIFIÉ
            </span>
            <span class="px-5 py-2.5 bg-slate-900 border border-slate-700 rounded-2xl text-orange-400 flex items-center gap-2 shadow-sm">
              <i class="fa-solid fa-bolt text-orange-500"></i> SIMPLE
            </span>
          </div>
        </div>

        <!-- 3 USER PATHWAYS -->
        <div class="space-y-10">
          <div class="text-center space-y-2">
            <h2 class="text-3xl font-black text-slate-900 tracking-tight">Comment ça marche selon votre profil ?</h2>
            <p class="text-slate-500 text-sm max-w-xl mx-auto">Une plateforme transparente pensée pour chaque acteur du marché immobilier au Sénégal.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">

            <!-- PATH 1: CHERCHEURS -->
            <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all space-y-6 flex flex-col justify-between">
              <div class="space-y-4">
                <div class="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-2xl font-black">
                  <i class="fa-solid fa-magnifying-glass-location"></i>
                </div>
                <h3 class="text-xl font-extrabold text-slate-900">Pour les Chercheurs & Locataires</h3>
                <ul class="space-y-3 text-xs text-slate-600 font-medium">
                  <li class="flex items-start gap-2.5">
                    <i class="fa-solid fa-check text-orange-500 mt-0.5"></i>
                    <span><strong>1. Filtrez votre recherche</strong> par ville (Dakar, Saly, Thiès...), quartier, budget et type d'annonceur.</span>
                  </li>
                  <li class="flex items-start gap-2.5">
                    <i class="fa-solid fa-check text-orange-500 mt-0.5"></i>
                    <span><strong>2. Identifiez immédiatement l'annonceur</strong> avec les badges "Propriétaire vérifié" ou "Agence vérifiée".</span>
                  </li>
                  <li class="flex items-start gap-2.5">
                    <i class="fa-solid fa-check text-orange-500 mt-0.5"></i>
                    <span><strong>3. Contactez-le sans intermédiaire</strong> par Appel direct, WhatsApp ou Message sécurisé.</span>
                  </li>
                </ul>
              </div>

              <button (click)="onSearchClick()" class="btn-orange text-xs py-3 w-full justify-center rounded-xl font-extrabold cursor-pointer">
                <i class="fa-solid fa-search"></i> Chercher un bien
              </button>
            </div>

            <!-- PATH 2: PROPRIÉTAIRES -->
            <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all space-y-6 flex flex-col justify-between">
              <div class="space-y-4">
                <div class="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-2xl font-black">
                  <i class="fa-solid fa-user-shield"></i>
                </div>
                <h3 class="text-xl font-extrabold text-slate-900">Pour les Propriétaires Directs</h3>
                <ul class="space-y-3 text-xs text-slate-600 font-medium">
                  <li class="flex items-start gap-2.5">
                    <i class="fa-solid fa-check text-orange-500 mt-0.5"></i>
                    <span><strong>1. Déposez votre bien en 6 étapes simple</strong> (photos, localisation, prix, équipements).</span>
                  </li>
                  <li class="flex items-start gap-2.5">
                    <i class="fa-solid fa-check text-orange-500 mt-0.5"></i>
                    <span><strong>2. Obtenez le badge "Propriétaire vérifié"</strong> en fournissant une pièce justificative.</span>
                  </li>
                  <li class="flex items-start gap-2.5">
                    <i class="fa-solid fa-check text-orange-500 mt-0.5"></i>
                    <span><strong>3. Recevez les appels directs des clients</strong> sans payer aucune commission.</span>
                  </li>
                </ul>
              </div>

              <button (click)="onPublishClick()" class="btn-dark text-xs py-3 w-full justify-center rounded-xl font-extrabold cursor-pointer">
                <i class="fa-solid fa-plus-circle text-orange-500"></i> Déposer une annonce
              </button>
            </div>

            <!-- PATH 3: AGENCIES -->
            <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all space-y-6 flex flex-col justify-between">
              <div class="space-y-4">
                <div class="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black">
                  <i class="fa-solid fa-building-shield text-orange-500"></i>
                </div>
                <h3 class="text-xl font-extrabold text-slate-900">Pour les Agences Immobilières</h3>
                <ul class="space-y-3 text-xs text-slate-600 font-medium">
                  <li class="flex items-start gap-2.5">
                    <i class="fa-solid fa-check text-orange-500 mt-0.5"></i>
                    <span><strong>1. Affichez votre badge "Agence vérifiée"</strong> avec numéro NINEA et logo officiel.</span>
                  </li>
                  <li class="flex items-start gap-2.5">
                    <i class="fa-solid fa-check text-orange-500 mt-0.5"></i>
                    <span><strong>2. Publiez l'ensemble de votre catalogue</strong> de vente ou location.</span>
                  </li>
                  <li class="flex items-start gap-2.5">
                    <i class="fa-solid fa-check text-orange-500 mt-0.5"></i>
                    <span><strong>3. Boostez la visibilité de vos exclusivités</strong> par paiement mobile Wave & Orange Money.</span>
                  </li>
                </ul>
              </div>

              <button (click)="onAgencyClick()" class="bg-slate-950 hover:bg-black text-white text-xs py-3 w-full justify-center rounded-xl font-extrabold inline-flex items-center gap-2 transition-colors cursor-pointer border border-orange-500/40">
                <i class="fa-solid fa-briefcase text-orange-400"></i> Espace Pro Agence
              </button>
            </div>

          </div>
        </div>

        <!-- CONFIANCE ET SÉCURITÉ SECTION -->
        <div class="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
          <div class="text-center space-y-2">
            <span class="text-xs font-black uppercase text-orange-600 tracking-wider">Confiance & Sécurité</span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900">Une modération active pour des annonces 100% saines</h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">

            <div class="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div class="text-orange-600 text-xl font-bold"><i class="fa-solid fa-id-card"></i></div>
              <h4 class="font-extrabold text-slate-900 text-sm">Profils Vérifiés</h4>
              <p class="text-slate-500 leading-relaxed">Les annonceurs vérifiés fournissent leur CNI ou leur NINEA à l'équipe de modération.</p>
            </div>

            <div class="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div class="text-orange-600 text-xl font-bold"><i class="fa-solid fa-flag"></i></div>
              <h4 class="font-extrabold text-slate-900 text-sm">Signalement Facile</h4>
              <p class="text-slate-500 leading-relaxed">Le bouton "Signaler cette annonce" permet à la communauté d'alerter si un bien n'existe pas.</p>
            </div>

            <div class="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div class="text-orange-600 text-xl font-bold"><i class="fa-solid fa-comments"></i></div>
              <h4 class="font-extrabold text-slate-900 text-sm">Contact Direct</h4>
              <p class="text-slate-500 leading-relaxed">Vous échangez directement sur WhatsApp ou par téléphone sans frais cachés.</p>
            </div>

            <div class="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div class="text-orange-600 text-xl font-bold"><i class="fa-solid fa-lock"></i></div>
              <h4 class="font-extrabold text-slate-900 text-sm">Données Protégées</h4>
              <p class="text-slate-500 leading-relaxed">Vos informations personnelles sont sécurisées et restent confidentielles.</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  `
})
export class HowItWorksComponent {
  constructor(
    public langService: LanguageService,
    private propertyService: PropertyService,
    private router: Router
  ) {}

  onSearchClick(): void {
    if (this.propertyService.isLoggedIn$.getValue()) {
      this.router.navigate(['/annonces']);
    } else {
      this.propertyService.openAuthModal(
        'register',
        'Créez votre profil chercheur pour enregistrer vos alertes et contacter directement les propriétaires.',
        '/annonces',
        'tenant'
      );
    }
  }

  onPublishClick(): void {
    const user = this.propertyService.getCurrentUser();
    if (this.propertyService.isLoggedIn$.getValue() && user && user.role !== 'tenant') {
      this.router.navigate(['/deposer-annonce']);
    } else {
      this.propertyService.openAuthModal(
        'register',
        'Veuillez vous connecter ou créer un compte propriétaire pour déposer votre annonce.',
        '/deposer-annonce',
        'owner'
      );
    }
  }

  onAgencyClick(): void {
    const user = this.propertyService.getCurrentUser();
    if (this.propertyService.isLoggedIn$.getValue() && user && (user.role === 'agency' || user.role === 'owner')) {
      this.router.navigate(['/dashboard']);
    } else {
      this.propertyService.openAuthModal(
        'register',
        'Veuillez vous connecter ou créer un compte agence pour accéder à l\'Espace Pro Agence.',
        '/dashboard',
        'agency'
      );
    }
  }
}
