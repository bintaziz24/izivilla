import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../services/property.service';
import { LanguageService } from '../../services/language.service';
import { ThemeService } from '../../services/theme.service';
import { CountryService } from '../../services/country.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Top Announcement & Philosophy Bar -->
    <div class="bg-slate-950 text-slate-300 text-xs py-2 px-3 sm:px-6 border-b border-slate-800">
      <div class="w-full max-w-[1440px] mx-auto flex flex-wrap justify-between items-center gap-2">
        <div class="flex items-center gap-2 sm:gap-3">
          <span class="bg-emerald-500/20 text-emerald-400 font-extrabold px-2 py-0.5 rounded text-[10px] sm:text-[11px] border border-emerald-500/30 whitespace-nowrap">
            <i class="fa-solid fa-bolt mr-1"></i> IZIVILLA DIRECT
          </span>
          <span class="font-extrabold text-white text-[10px] sm:text-[11px] tracking-wide truncate">
            « Zéro intermédiaire inutile. »
          </span>
        </div>
        
        <div class="flex items-center gap-3 text-slate-400 font-medium text-[11px]">
          <span class="text-slate-400 font-bold hidden sm:inline">
            <i class="fa-solid fa-shield-check text-emerald-400 mr-1"></i> Espace Sécurisé
          </span>

          <button (click)="toggleLanguage()" class="hover:text-white font-bold transition-colors whitespace-nowrap">
            {{ langService.currentLang === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Navigation Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div class="w-full max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6 h-16 sm:h-20 flex items-center justify-between gap-1 sm:gap-2">
        
        <!-- Brand Logo -->
        <a routerLink="/" class="flex items-center gap-2 group shrink-0">
          <div class="w-8 h-8 sm:w-10 sm:h-10 bg-slate-950 rounded-xl flex items-center justify-center text-orange-500 font-extrabold text-lg sm:text-xl shadow-md group-hover:scale-105 transition-transform">
            <i class="fa-solid fa-house-chimney"></i>
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-1">
              <span class="text-lg sm:text-xl font-black tracking-tight text-slate-900">IZI</span>
              <span class="text-lg sm:text-xl font-black tracking-tight text-orange-600">VILLA</span>
              <span class="text-[8px] sm:text-[9px] font-extrabold bg-orange-100 text-orange-700 px-1 py-0.5 rounded">DIRECT</span>
            </div>
            <span class="text-[9px] font-bold text-slate-500 -mt-1 hidden xl:block">Trouvez. Contactez directement.</span>
          </div>
        </a>

        <!-- Desktop Navigation Links (Visible on xl screens and wider) -->
        <nav class="hidden xl:flex items-center gap-1 xl:gap-1.5 font-extrabold text-slate-700 text-[10.5px] uppercase tracking-wide shrink">
          <a routerLink="/" routerLinkActive="text-orange-600 bg-orange-50 font-black" [routerLinkActiveOptions]="{exact: true}" class="px-2 py-1 rounded-xl hover:text-orange-600 transition-colors whitespace-nowrap">
            Accueil
          </a>
          <a routerLink="/annonces" [queryParams]="{transaction_type: 'sale'}" routerLinkActive="text-orange-600 bg-orange-50 font-black" class="px-2 py-1 rounded-xl hover:text-orange-600 transition-colors whitespace-nowrap">
            Acheter
          </a>
          <a routerLink="/annonces" [queryParams]="{transaction_type: 'rent'}" routerLinkActive="text-orange-600 bg-orange-50 font-black" class="px-2 py-1 rounded-xl hover:text-orange-600 transition-colors whitespace-nowrap">
            Louer
          </a>
          <a routerLink="/annonces" [queryParams]="{property_type: 'Terrain'}" routerLinkActive="text-orange-600 bg-orange-50 font-black" class="px-2 py-1 rounded-xl hover:text-orange-600 transition-colors whitespace-nowrap">
            Terrains
          </a>
          <a routerLink="/annonces" [queryParams]="{property_type: 'Bureau'}" routerLinkActive="text-orange-600 bg-orange-50 font-black" class="px-2 py-1 rounded-xl hover:text-orange-600 transition-colors whitespace-nowrap">
            Locaux
          </a>
          <a routerLink="/comment-ca-marche" routerLinkActive="text-orange-600 bg-orange-50 font-black" class="px-2 py-1 rounded-xl hover:text-orange-600 transition-colors whitespace-nowrap">
            Comment ça marche ?
          </a>
          <a routerLink="/a-propos" routerLinkActive="text-orange-600 bg-orange-50 font-black" class="px-2 py-1 rounded-xl hover:text-orange-600 transition-colors whitespace-nowrap">
            À propos
          </a>
        </nav>

        <!-- Right Side Actions -->
        <div class="flex items-center gap-1 sm:gap-2 shrink-0">
          
          <!-- Country Selector Button -->
          <div class="relative">
            <button (click)="showCountryDropdown = !showCountryDropdown" class="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-orange-500 rounded-xl px-2 sm:px-3 py-1.5 transition-all shadow-sm group cursor-pointer">
              <img [src]="countryService.currentCountry.flagUrl" [alt]="countryService.currentCountry.name" class="w-5 h-3.5 sm:w-6 sm:h-4 object-cover rounded shadow-sm shrink-0">
              <div class="flex flex-col text-left leading-tight hidden md:flex">
                <span class="text-[10.5px] font-black text-slate-900 group-hover:text-orange-600 transition-colors whitespace-nowrap">
                  {{ countryService.currentCountry.name }}
                </span>
                <span class="text-[8.5px] font-black text-orange-600 uppercase">
                  {{ countryService.currentCountry.currency }}
                </span>
              </div>
              <i class="fa-solid fa-chevron-down text-[8px] text-slate-500 group-hover:text-orange-600 transition-colors"></i>
            </button>

            <!-- Dropdown Menu -->
            <div *ngIf="showCountryDropdown" class="absolute right-0 top-full mt-2 bg-white border-2 border-slate-200 rounded-3xl shadow-2xl z-50 py-2 min-w-[230px] max-h-80 overflow-y-auto">
              <div class="px-4 py-2 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
                <span>Sélectionner un pays</span>
                <i class="fa-solid fa-globe text-orange-500 text-xs"></i>
              </div>
              <button *ngFor="let c of countryService.countries" (click)="selectCountry(c.code)" [class.bg-orange-50]="countryService.currentCountry.code === c.code" [class.border-l-4]="countryService.currentCountry.code === c.code" [class.border-orange-600]="countryService.currentCountry.code === c.code" class="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-semibold text-slate-800 flex items-center justify-between transition-colors">
                <div class="flex items-center gap-2.5">
                  <img [src]="c.flagUrl" [alt]="c.name" class="w-6 h-4 object-cover rounded shadow-sm shrink-0">
                  <div class="flex flex-col">
                    <span class="font-black text-slate-900 text-xs">{{ c.name }}</span>
                    <span class="text-[10px] text-slate-500 font-medium">{{ c.phonePrefix }}</span>
                  </div>
                </div>
                <span class="text-[10px] font-black bg-orange-100 text-orange-700 px-2 py-0.5 rounded-lg border border-orange-200">
                  {{ c.currency }}
                </span>
              </button>
            </div>
          </div>

          <!-- Favorites Counter Pill -->
          <a routerLink="/espace-locataire" class="relative p-1.5 text-slate-600 hover:text-orange-600 transition-colors shrink-0" title="Mes Favoris">
            <i class="fa-regular fa-heart text-lg"></i>
            <span *ngIf="favoritesCount > 0" class="absolute -top-1 -right-1 bg-orange-600 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white shadow">
              {{ favoritesCount }}
            </span>
          </a>

          <!-- Primary Button: Publier une annonce -->
          <button (click)="onPublishClick()" class="bg-slate-950 hover:bg-slate-900 text-white text-[10px] sm:text-[11px] font-black px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl shadow-md shrink-0 flex items-center gap-1 whitespace-nowrap">
            <i class="fa-solid fa-circle-plus text-orange-500 text-xs"></i>
            <span class="hidden lg:inline">Publier une annonce</span>
            <span class="lg:hidden">Publier</span>
          </button>

          <!-- Account & Roles Menu -->
          <div class="flex items-center gap-1 border-l border-slate-200 pl-1 shrink-0">
            
            <ng-container *ngIf="!isUserLoggedIn">
              <button (click)="openLoginModal()" class="px-2 py-1.5 text-[10px] sm:text-[11px] font-extrabold text-slate-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all flex items-center gap-1 shrink-0 whitespace-nowrap">
                <i class="fa-solid fa-right-to-bracket text-slate-400"></i>
                <span>Connexion</span>
              </button>

              <button (click)="openRegisterModal()" class="px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-black bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-1 shrink-0 whitespace-nowrap">
                <i class="fa-solid fa-user-plus text-xs"></i>
                <span class="hidden sm:inline">Créer un compte</span>
                <span class="sm:hidden">Créer</span>
              </button>
            </ng-container>

            <ng-container *ngIf="isUserLoggedIn">
              <a *ngIf="currentRole === 'admin'" routerLink="/admin" class="px-2 py-1.5 text-[10px] sm:text-[11px] font-black bg-red-50 text-red-600 rounded-xl border border-red-200 hover:bg-red-100 transition-all shrink-0 whitespace-nowrap">
                <i class="fa-solid fa-user-shield mr-1"></i> Admin
              </a>
              <a *ngIf="currentRole === 'agency'" routerLink="/dashboard" class="px-2 py-1.5 text-[10px] sm:text-[11px] font-black bg-blue-50 text-blue-600 rounded-xl border border-blue-200 hover:bg-blue-100 transition-all shrink-0 whitespace-nowrap">
                <i class="fa-solid fa-building mr-1"></i> Agence
              </a>
              <a *ngIf="currentRole === 'owner'" routerLink="/dashboard" class="px-2 py-1.5 text-[10px] sm:text-[11px] font-black bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-all shrink-0 whitespace-nowrap">
                <i class="fa-solid fa-user-check mr-1"></i> Propriétaire
              </a>
              <a *ngIf="currentRole === 'tenant'" routerLink="/espace-locataire" class="px-2 py-1.5 text-[10px] sm:text-[11px] font-black bg-orange-50 text-orange-600 rounded-xl border border-orange-200 hover:bg-orange-100 transition-all shrink-0 whitespace-nowrap">
                <i class="fa-solid fa-user mr-1"></i> Chercheur
              </a>

              <button (click)="handleLogout()" class="p-1.5 text-slate-400 hover:text-red-600 transition-colors shrink-0" title="Se déconnecter">
                <i class="fa-solid fa-right-from-bracket text-sm"></i>
              </button>
            </ng-container>

          </div>

          <!-- Mobile / Tablet Hamburger Menu Button -->
          <button (click)="mobileMenuOpen = !mobileMenuOpen" class="xl:hidden p-1.5 text-slate-700 hover:text-orange-600 text-lg font-bold rounded-lg focus:outline-none shrink-0" title="Menu">
            <i class="fa-solid" [ngClass]="mobileMenuOpen ? 'fa-xmark' : 'fa-bars'"></i>
          </button>

        </div>

      </div>

      <!-- Mobile / Tablet Navigation Overlay Drawer -->
      <div *ngIf="mobileMenuOpen" class="xl:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2 shadow-lg">
        <a routerLink="/" (click)="mobileMenuOpen = false" routerLinkActive="text-orange-600 bg-orange-50 font-black" [routerLinkActiveOptions]="{exact: true}" class="block px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50">
          Accueil
        </a>
        <a routerLink="/annonces" [queryParams]="{transaction_type: 'sale'}" (click)="mobileMenuOpen = false" routerLinkActive="text-orange-600 bg-orange-50 font-black" class="block px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50">
          Acheter un bien
        </a>
        <a routerLink="/annonces" [queryParams]="{transaction_type: 'rent'}" (click)="mobileMenuOpen = false" routerLinkActive="text-orange-600 bg-orange-50 font-black" class="block px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50">
          Louer un bien
        </a>
        <a routerLink="/annonces" [queryParams]="{property_type: 'Terrain'}" (click)="mobileMenuOpen = false" routerLinkActive="text-orange-600 bg-orange-50 font-black" class="block px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50">
          Terrains
        </a>
        <a routerLink="/annonces" [queryParams]="{property_type: 'Bureau'}" (click)="mobileMenuOpen = false" routerLinkActive="text-orange-600 bg-orange-50 font-black" class="block px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50">
          Locaux professionnels
        </a>
        <a routerLink="/comment-ca-marche" (click)="mobileMenuOpen = false" routerLinkActive="text-orange-600 bg-orange-50 font-black" class="block px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50">
          Comment ça marche ?
        </a>
        <a routerLink="/a-propos" (click)="mobileMenuOpen = false" routerLinkActive="text-orange-600 bg-orange-50 font-black" class="block px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50">
          À propos
        </a>
      </div>
    </header>

    <!-- MODAL DE CONNEXION -->
    <div *ngIf="showLoginModal" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 text-left relative">
        
        <button (click)="showLoginModal = false" class="absolute top-6 right-6 text-slate-400 hover:text-slate-900 text-xl font-bold">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="space-y-1">
          <div class="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold mb-3">
            <i class="fa-solid fa-right-to-bracket"></i>
          </div>
          <h3 class="text-2xl font-black text-slate-900">Connexion à IZIVILLA</h3>
          <p class="text-xs text-slate-500 font-medium">Connectez-vous pour contacter les annonceurs ou gérer vos annonces.</p>
        </div>

        <!-- Role Type Selection Tabs -->
        <div class="grid grid-cols-3 gap-1 p-1.5 bg-slate-100 rounded-2xl text-[11px] font-bold">
          <button type="button" (click)="loginType = 'tenant'" [class.bg-white]="loginType === 'tenant'" [class.text-slate-900]="loginType === 'tenant'" [class.shadow-sm]="loginType === 'tenant'" class="py-2.5 rounded-xl text-slate-500 transition-all text-center">
            Chercheur
          </button>
          <button type="button" (click)="loginType = 'owner'" [class.bg-white]="loginType === 'owner'" [class.text-slate-900]="loginType === 'owner'" [class.shadow-sm]="loginType === 'owner'" class="py-2.5 rounded-xl text-slate-500 transition-all text-center">
            Propriétaire
          </button>
          <button type="button" (click)="loginType = 'agency'" [class.bg-white]="loginType === 'agency'" [class.text-slate-900]="loginType === 'agency'" [class.shadow-sm]="loginType === 'agency'" class="py-2.5 rounded-xl text-slate-500 transition-all text-center">
            Agence
          </button>
        </div>

        <div *ngIf="registerSuccessMessage" class="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-extrabold flex items-center gap-2">
          <i class="fa-solid fa-circle-check text-emerald-600 text-base"></i>
          <span>{{ registerSuccessMessage }}</span>
        </div>

        <div *ngIf="authNoticeMessage" class="p-3.5 bg-orange-50 border border-orange-200 text-orange-800 rounded-2xl text-xs font-extrabold flex items-center gap-2">
          <i class="fa-solid fa-circle-info text-orange-600 text-base"></i>
          <span>{{ authNoticeMessage }}</span>
        </div>

        <div *ngIf="loginErrorMsg" class="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-extrabold flex items-center gap-2">
          <i class="fa-solid fa-triangle-exclamation text-red-500 text-base"></i>
          <span>{{ loginErrorMsg }}</span>
        </div>

        <form (ngSubmit)="handleLogin()" class="space-y-4" autocomplete="off">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Email ou Identifiant</label>
            <input type="text" [(ngModel)]="loginEmail" name="email" required autocomplete="off" placeholder="Email ou Identifiant" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 shadow-sm">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Mot de passe *</label>
            <input type="password" [(ngModel)]="loginPassword" name="password" required autocomplete="new-password" placeholder="Mot de passe" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 shadow-sm">
          </div>

          <button type="submit" class="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs shadow-lg transition-all">
            Se connecter à mon espace
          </button>
        </form>

        <div class="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Pas encore de compte ? 
          <button (click)="switchToRegister()" class="font-extrabold text-orange-600 hover:underline ml-1">Créer un compte</button>
        </div>

      </div>
    </div>

    <!-- MODAL D'INSCRIPTION -->
    <div *ngIf="showRegisterModal" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 text-left relative max-h-[90vh] overflow-y-auto">
        
        <button (click)="showRegisterModal = false" class="absolute top-6 right-6 text-slate-400 hover:text-slate-900 text-xl font-bold">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="space-y-1">
          <div class="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold mb-3">
            <i class="fa-solid fa-user-plus"></i>
          </div>
          <h3 class="text-2xl font-black text-slate-900">Rejoindre IZIVILLA</h3>
          <p class="text-xs text-slate-500 font-medium">Choisissez votre profil et commencez à échanger directement sans intermédiaire.</p>
        </div>

        <div *ngIf="authNoticeMessage" class="p-3.5 bg-orange-50 border border-orange-200 text-orange-800 rounded-2xl text-xs font-extrabold flex items-center gap-2">
          <i class="fa-solid fa-circle-info text-orange-600 text-base"></i>
          <span>{{ authNoticeMessage }}</span>
        </div>

        <!-- Account Type Selector (Matching Prompt Section 8 Profiles) -->
        <div class="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 rounded-2xl text-[11px] font-bold">
          <button (click)="registerType = 'tenant'" [class.bg-white]="registerType === 'tenant'" [class.text-slate-900]="registerType === 'tenant'" [class.shadow-sm]="registerType === 'tenant'" class="py-2.5 rounded-xl text-slate-500 transition-all text-center">
            Je cherche un bien
          </button>
          <button (click)="registerType = 'owner'" [class.bg-white]="registerType === 'owner'" [class.text-slate-900]="registerType === 'owner'" [class.shadow-sm]="registerType === 'owner'" class="py-2.5 rounded-xl text-slate-500 transition-all text-center">
            Je suis propriétaire
          </button>
          <button (click)="registerType = 'agency'" [class.bg-white]="registerType === 'agency'" [class.text-slate-900]="registerType === 'agency'" [class.shadow-sm]="registerType === 'agency'" class="py-2.5 rounded-xl text-slate-500 transition-all text-center">
            Je suis une agence
          </button>
        </div>

        <form (ngSubmit)="handleRegister()" class="space-y-4" autocomplete="off">
          
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Nom complet ou Nom d'agence *</label>
            <input type="text" [(ngModel)]="regName" name="name" required autocomplete="off" placeholder="Nom complet ou Nom d'agence" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 shadow-sm">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Email *</label>
            <input type="email" [(ngModel)]="regEmail" name="email" required autocomplete="off" placeholder="Adresse email" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 shadow-sm">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Téléphone portable (WhatsApp) *</label>
            <div class="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-2xl px-2 py-1 focus-within:border-orange-500 shadow-sm">
              <select [(ngModel)]="regPhonePrefix" name="phonePrefix" class="bg-transparent text-xs font-extrabold text-slate-800 outline-none cursor-pointer py-2 pr-1 border-r border-slate-200 max-w-[170px] truncate">
                <option *ngFor="let c of countryService.countries" [value]="c.phonePrefix">
                  {{ c.flag }} {{ c.name }} ({{ c.phonePrefix }}) — {{ c.currency }}
                </option>
              </select>
              <input type="tel" [(ngModel)]="regPhone" name="phone" required autocomplete="off" placeholder="Numéro de téléphone" class="w-full bg-transparent px-2 py-2 text-xs font-semibold text-slate-800 focus:outline-none">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Mot de passe *</label>
            <input type="password" [(ngModel)]="regPassword" name="password" required autocomplete="new-password" placeholder="Mot de passe" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 shadow-sm">
          </div>

          <button type="submit" class="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs shadow-lg shadow-orange-600/20 transition-all">
            Créer mon compte
          </button>
        </form>

        <div class="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Déjà un compte ? 
          <button (click)="switchToLogin()" class="font-extrabold text-orange-600 hover:underline ml-1">Se connecter</button>
        </div>

      </div>
    </div>
  `
})
export class HeaderComponent implements OnInit {
  currentRole: 'tenant' | 'owner' | 'agency' | 'admin' = 'tenant';
  isLoggedIn = false;
  favoritesCount = 0;
  mobileMenuOpen = false;

  showLoginModal = false;
  showRegisterModal = false;
  showCountryDropdown = false;

  loginType: 'tenant' | 'owner' | 'agency' | 'admin' = 'tenant';
  loginEmail = '';
  loginPassword = '';
  loginErrorMsg = '';

  registerType: 'tenant' | 'owner' | 'agency' = 'tenant';
  regName = '';
  regEmail = '';
  regPhonePrefix = '+221';
  regPhone = '';
  regPassword = '';

  registerSuccessMessage = '';
  authNoticeMessage = '';
  pendingTargetUrl: string | null = null;

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    public langService: LanguageService,
    public themeService: ThemeService,
    public countryService: CountryService
  ) {}

  ngOnInit(): void {
    this.propertyService.currentRole$.subscribe(r => this.currentRole = r);
    this.propertyService.favorites$.subscribe(favs => this.favoritesCount = favs.length);
    this.propertyService.isLoggedIn$.subscribe(loggedIn => this.isLoggedIn = loggedIn);
    this.propertyService.authModalRequest$.subscribe((req: { mode: 'login' | 'register'; message?: string; targetUrl?: string }) => {
      this.authNoticeMessage = req.message || '';
      this.pendingTargetUrl = req.targetUrl || null;
      if (req.mode === 'register') {
        this.openRegisterModal();
      } else {
        this.openLoginModal();
      }
    });
  }

  get isUserLoggedIn(): boolean {
    return this.isLoggedIn;
  }

  t(key: string): string {
    return this.langService.translate(key);
  }

  selectCountry(code: string): void {
    this.countryService.setCountryByCode(code);
    this.showCountryDropdown = false;
  }

  toggleLanguage(): void {
    const nextLang = this.langService.currentLang === 'fr' ? 'en' : 'fr';
    this.langService.setLanguage(nextLang);
  }

  openLoginModal(): void {
    this.registerSuccessMessage = '';
    this.loginErrorMsg = '';
    this.loginEmail = '';
    this.loginPassword = '';
    this.showRegisterModal = false;
    this.showLoginModal = true;
  }

  openRegisterModal(): void {
    this.registerSuccessMessage = '';
    this.loginErrorMsg = '';
    this.regName = '';
    this.regEmail = '';
    this.regPhone = '';
    this.regPassword = '';
    this.showLoginModal = false;
    this.showRegisterModal = true;
  }

  switchToRegister(): void {
    this.showLoginModal = false;
    this.showRegisterModal = true;
  }

  switchToLogin(): void {
    this.showRegisterModal = false;
    this.showLoginModal = true;
  }

  onPublishClick(): void {
    const currentUser = this.propertyService.getCurrentUser();
    if (this.isUserLoggedIn && currentUser) {
      if (currentUser.role === 'tenant') {
        this.authNoticeMessage = 'Les comptes "Chercheur" ne peuvent pas publier d\'annonces. Veuillez vous connecter ou créer un compte Propriétaire ou Agence.';
        this.pendingTargetUrl = '/deposer-annonce';
        this.registerType = 'owner';
        this.openRegisterModal();
      } else {
        this.router.navigate(['/deposer-annonce']);
      }
    } else {
      this.authNoticeMessage = 'Veuillez créer un compte Propriétaire ou Agence (ou vous connecter) pour publier votre bien.';
      this.pendingTargetUrl = '/deposer-annonce';
      this.registerType = 'owner';
      this.openRegisterModal();
    }
  }

  handleLogin(): void {
    const res = this.propertyService.loginUser(this.loginEmail, this.loginPassword, this.loginType);
    if (!res.success) {
      this.loginErrorMsg = res.message;
      return;
    }
    this.loginErrorMsg = '';
    this.showLoginModal = false;
    const activeRole = this.propertyService.currentRole$.getValue();
    if (this.pendingTargetUrl) {
      const target = this.pendingTargetUrl;
      this.pendingTargetUrl = null;
      this.router.navigateByUrl(target);
      return;
    }
    if (activeRole === 'admin') {
      this.router.navigate(['/admin']);
    } else if (activeRole === 'agency' || activeRole === 'owner') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/espace-locataire']);
    }
  }

  handleLogout(): void {
    this.propertyService.logout();
    this.router.navigate(['/']);
  }

  handleRegister(): void {
    const fullPhone = `${this.regPhonePrefix} ${this.regPhone}`.trim();
    this.propertyService.registerUser(this.regName, this.regEmail, fullPhone, this.regPassword, this.registerType);
    
    // Switch directly to Login Modal as requested
    this.showRegisterModal = false;
    this.loginEmail = this.regEmail;
    this.loginType = this.registerType;
    this.registerSuccessMessage = 'Votre compte a été créé avec succès ! Connectez-vous ci-dessous avec vos identifiants.';
    this.loginErrorMsg = '';
    this.showLoginModal = true;
  }
}

