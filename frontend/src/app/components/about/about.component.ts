import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-slate-50 min-h-screen py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        <!-- BRAND HERO HEADER -->
        <div class="bg-slate-950 text-white rounded-3xl p-8 sm:p-14 border border-slate-800 shadow-2xl relative overflow-hidden text-center space-y-6">
          <div class="absolute top-0 left-0 -ml-20 -mt-20 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>

          <div class="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-extrabold text-xs uppercase tracking-widest">
            <i class="fa-solid fa-gem"></i> À propos de nous
          </div>

          <h1 class="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            « Le bon bien. Le bon annonceur. Directement. »
          </h1>

          <p class="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto font-medium leading-relaxed">
            IZIVILLA est né d'un constat simple : la recherche de logements au Sénégal est encombrée de démarcheurs informels, de faux intermédiaires et de frais opaques. Nous redonnons le pouvoir au chercheur et à l'annonceur légitime.
          </p>
        </div>

        <!-- CORE MISSION & VALUES -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
            <div class="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-xl font-black">
              <i class="fa-solid fa-bullseye"></i>
            </div>
            <h3 class="text-2xl font-black text-slate-900">Notre Mission</h3>
            <p class="text-slate-600 text-sm leading-relaxed">
              Supprimer les intermédiaires superflus pour fluidifier la recherche immobilière. Que vous cherchiez un studio à la VDN, une villa aux Almadies, un appartement à Mermoz ou un terrain à Saly, Izivilla vous garantit une mise en relation directe, claire et rapide.
            </p>
          </div>

          <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
            <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-xl font-black">
              <i class="fa-solid fa-shield-heart"></i>
            </div>
            <h3 class="text-2xl font-black text-slate-900">Notre Promesse</h3>
            <p class="text-slate-600 text-sm leading-relaxed">
              Des profils certifiés, aucun frais caché pour les locataires et les acheteurs, et une visibilité maximale pour les véritables propriétaires et agences immobilières agréées du Sénégal.
            </p>
          </div>

        </div>

        <!-- SENEGAL COVERAGE STATS -->
        <div class="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl space-y-8">
          <div class="text-center space-y-2">
            <span class="text-xs font-black uppercase text-orange-500 tracking-wider">Présence Nationale</span>
            <h2 class="text-3xl font-black text-white">Couverture sur tout le Sénégal</h2>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div class="p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <h4 class="text-3xl font-black text-orange-500">Dakar</h4>
              <p class="text-xs text-slate-400 mt-1 font-semibold">Almadies, Mermoz, Plateau, VDN, Ngor, Yoff, Fann</p>
            </div>

            <div class="p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <h4 class="text-3xl font-black text-orange-500">Petite Côte</h4>
              <p class="text-xs text-slate-400 mt-1 font-semibold">Saly, Mbour, Somone, Ngaparou, Popenguine</p>
            </div>

            <div class="p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <h4 class="text-3xl font-black text-orange-500">Thiès</h4>
              <p class="text-xs text-slate-400 mt-1 font-semibold">Centre-ville, Randoulène, Dixième, Ndiambour</p>
            </div>

            <div class="p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <h4 class="text-3xl font-black text-orange-500">Régions</h4>
              <p class="text-xs text-slate-400 mt-1 font-semibold">Saint-Louis, Ziguinchor, Cap Skirring, Touba</p>
            </div>
          </div>
        </div>

        <!-- CTA SECTION -->
        <div class="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm text-center space-y-6">
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900">Prêt à trouver votre futur logement ?</h2>
          <p class="text-slate-500 text-sm max-w-md mx-auto">Rejoignez des milliers de sénégalais qui utilisent Izivilla pour contacter directement les annonceurs.</p>

          <div class="flex flex-wrap justify-center gap-4 pt-2">
            <a routerLink="/annonces" class="btn-orange px-8 py-3.5 rounded-2xl font-extrabold text-sm shadow-lg">
              <i class="fa-solid fa-magnifying-glass"></i> Parcourir les annonces
            </a>
            <a routerLink="/deposer-annonce" class="btn-dark px-8 py-3.5 rounded-2xl font-extrabold text-sm shadow-lg">
              <i class="fa-solid fa-plus-circle"></i> Déposer une annonce
            </a>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AboutComponent {
  constructor(public langService: LanguageService) {}
}
