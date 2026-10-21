import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../services/property.service';
import { LanguageService } from '../../services/language.service';
import { ThemeService } from '../../services/theme.service';
import { CountryService } from '../../services/country.service';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AuthModalComponent],
  template: `
    <!-- Main Navigation Header -->
    <header class="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-sm transition-all">
      <div class="w-full max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6 h-16 sm:h-20 flex items-center justify-between gap-1.5 sm:gap-2 xl:gap-3">
        
        <!-- Brand Logo -->
        <a routerLink="/" class="flex items-center group shrink-0 py-1">
          <img src="/images/logo.png" alt="IziVilla" class="h-8 sm:h-9 xl:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105">
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="hidden lg:flex items-center gap-0.5 xl:gap-1 font-medium text-slate-700 text-xs shrink">
          <a routerLink="/" routerLinkActive="text-orange-600 bg-orange-50/80 font-bold" [routerLinkActiveOptions]="{exact: true}" class="px-2.5 xl:px-3 py-1.5 rounded-full hover:text-orange-600 hover:bg-orange-50/50 transition-colors whitespace-nowrap">
            Accueil
          </a>
          <a routerLink="/annonces" [queryParams]="{transaction_type: 'sale'}" routerLinkActive="text-orange-600 bg-orange-50/80 font-bold" class="px-2.5 xl:px-3 py-1.5 rounded-full hover:text-orange-600 hover:bg-orange-50/50 transition-colors whitespace-nowrap">
            Acheter
          </a>
          <a routerLink="/annonces" [queryParams]="{transaction_type: 'rent'}" routerLinkActive="text-orange-600 bg-orange-50/80 font-bold" class="px-2.5 xl:px-3 py-1.5 rounded-full hover:text-orange-600 hover:bg-orange-50/50 transition-colors whitespace-nowrap">
            Louer
          </a>
          <a routerLink="/comment-ca-marche" routerLinkActive="text-orange-600 bg-orange-50/80 font-bold" class="px-2.5 xl:px-3 py-1.5 rounded-full hover:text-orange-600 hover:bg-orange-50/50 transition-colors whitespace-nowrap">
            Comment ça marche ?
          </a>
          <a routerLink="/a-propos" routerLinkActive="text-orange-600 bg-orange-50/80 font-bold" class="px-2.5 xl:px-3 py-1.5 rounded-full hover:text-orange-600 hover:bg-orange-50/50 transition-colors whitespace-nowrap">
            À propos
          </a>
        </nav>

        <!-- Right Side Actions -->
        <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          <!-- Country Selector Pill -->
          <div class="relative">
            <button (click)="showCountryDropdown = !showCountryDropdown" class="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-full px-2 sm:px-3 py-1.5 transition-all shadow-xs group cursor-pointer">
              <img [src]="countryService.currentCountry.flagUrl" [alt]="countryService.currentCountry.name" class="w-4.5 h-3 sm:w-5 sm:h-3.5 object-cover rounded shadow-xs shrink-0">
              <div class="flex items-center gap-1 text-left leading-none hidden 2xl:flex">
                <span class="text-xs font-semibold text-slate-800 group-hover:text-orange-600 transition-colors whitespace-nowrap">
                  {{ countryService.currentCountry.name }}
                </span>
                <span class="text-[9px] font-bold text-orange-600 bg-orange-100/70 px-1.5 py-0.5 rounded-full">
                  {{ countryService.currentCountry.currency }}
                </span>
              </div>
              <span class="text-[10px] font-bold text-orange-600 2xl:hidden uppercase">
                {{ countryService.currentCountry.currency }}
              </span>
              <i class="fa-solid fa-chevron-down text-[8px] text-slate-400 group-hover:text-orange-600 transition-colors"></i>
            </button>

            <!-- Country Dropdown Menu -->
            <div *ngIf="showCountryDropdown" class="absolute right-0 top-full mt-2 bg-white border border-slate-100 rounded-3xl shadow-xl z-50 py-2 min-w-[240px] max-h-80 overflow-y-auto">
              <div class="px-4 py-2 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center justify-between">
                <span>Sélectionner un pays</span>
                <i class="fa-solid fa-globe text-orange-500 text-xs"></i>
              </div>
              <button *ngFor="let c of countryService.countries" (click)="selectCountry(c.code)" [class.bg-orange-50]="countryService.currentCountry.code === c.code" [class.border-l-4]="countryService.currentCountry.code === c.code" [class.border-orange-600]="countryService.currentCountry.code === c.code" class="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-medium text-slate-800 flex items-center justify-between transition-colors">
                <div class="flex items-center gap-2.5">
                  <img [src]="c.flagUrl" [alt]="c.name" class="w-5 h-3.5 object-cover rounded shadow-xs shrink-0">
                  <div class="flex flex-col">
                    <span class="font-bold text-slate-900 text-xs">{{ c.name }}</span>
                    <span class="text-[10px] text-slate-400">{{ c.phonePrefix }}</span>
                  </div>
                </div>
                <span class="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                  {{ c.currency }}
                </span>
              </button>
            </div>
          </div>

          <!-- Favorites Pill -->
          <a routerLink="/espace-locataire" class="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200/80 bg-white hover:bg-orange-50 hover:border-orange-200 text-slate-600 hover:text-orange-600 flex items-center justify-center transition-all shadow-xs shrink-0" title="Mes Favoris">
            <i class="fa-regular fa-heart text-xs sm:text-sm"></i>
            <span *ngIf="favoritesCount > 0" class="absolute -top-1 -right-1 bg-orange-600 text-white font-bold text-[8.5px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {{ favoritesCount }}
            </span>
          </a>

          <!-- Notification Bell Pill -->
          <div class="relative shrink-0">
            <button (click)="showNotificationsDropdown = !showNotificationsDropdown" class="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200/80 bg-white hover:bg-orange-50 hover:border-orange-200 text-slate-600 hover:text-orange-600 flex items-center justify-center transition-all shadow-xs cursor-pointer" title="Centre de notifications">
              <i class="fa-regular fa-bell text-xs sm:text-sm"></i>
              <span *ngIf="unreadCount > 0" class="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[8.5px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                {{ unreadCount }}
              </span>
            </button>

            <!-- Notifications Dropdown -->
            <div *ngIf="showNotificationsDropdown" class="absolute right-0 top-full mt-2 bg-white border border-slate-100 rounded-3xl shadow-2xl z-50 w-80 sm:w-96 overflow-hidden">
              <div class="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <i class="fa-solid fa-bell text-orange-400"></i>
                  <span class="font-bold text-xs uppercase tracking-wider">Notifications</span>
                  <span *ngIf="unreadCount > 0" class="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{{ unreadCount }}</span>
                </div>
                <button (click)="markAllAsRead()" class="text-[10px] font-medium text-slate-400 hover:text-white transition-colors">
                  Tout marquer comme lu
                </button>
              </div>

              <div class="max-h-80 overflow-y-auto divide-y divide-slate-100">
                <div *ngIf="notifications.length === 0" class="p-6 text-center text-xs text-slate-400 font-medium">
                  Aucune notification pour le moment.
                </div>

                <div *ngFor="let notif of notifications" (click)="onNotificationClick(notif)" [class.bg-orange-50/50]="!notif.is_read" class="p-4 hover:bg-slate-50 transition-colors cursor-pointer text-left relative group">
                  <div class="flex items-start justify-between gap-2">
                    <span class="text-xs font-bold text-slate-900 group-hover:text-orange-600 flex items-center gap-1.5">
                      <span *ngIf="!notif.is_read" class="w-2 h-2 rounded-full bg-orange-600 inline-block shrink-0"></span>
                      {{ notif.title }}
                    </span>
                    <span class="text-[10px] text-slate-400 whitespace-nowrap">{{ notif.created_at | date:'shortTime' }}</span>
                  </div>
                  <p class="text-xs text-slate-600 mt-1.5 whitespace-pre-line leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">{{ notif.message }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Primary Button: Publier une annonce -->
          <button (click)="onPublishClick()" class="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full shadow-md shadow-orange-500/20 hover:shadow-orange-500/35 transition-all shrink-0 flex items-center gap-1 cursor-pointer whitespace-nowrap">
            <i class="fa-solid fa-circle-plus text-xs"></i>
            <span class="hidden md:inline">Publier</span>
            <span class="hidden 2xl:inline">une annonce</span>
          </button>

          <!-- Account & Roles Menu -->
          <div class="flex items-center gap-1 border-l border-slate-200/80 pl-1.5 sm:pl-2 shrink-0">
            
            <ng-container *ngIf="!isUserLoggedIn">
              <button (click)="openLoginModal()" class="px-2 py-1.5 text-[11px] sm:text-xs font-semibold text-slate-700 hover:text-orange-600 hover:bg-orange-50/60 rounded-full transition-all flex items-center shrink-0 whitespace-nowrap cursor-pointer">
                <span>Connexion</span>
              </button>

              <button (click)="openRegisterModal()" class="px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 rounded-full transition-all shadow-xs hover:shadow-sm flex items-center shrink-0 whitespace-nowrap cursor-pointer">
                <span>Inscription</span>
              </button>
            </ng-container>

            <ng-container *ngIf="isUserLoggedIn">
              <a *ngIf="currentRole === 'admin'" routerLink="/admin" class="px-2.5 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-full border border-orange-500 hover:bg-black transition-all shrink-0 whitespace-nowrap">
                <i class="fa-solid fa-user-shield mr-1 text-orange-400"></i> Admin
              </a>
              <a *ngIf="currentRole === 'agency'" routerLink="/dashboard" class="px-2.5 py-1.5 text-xs font-bold bg-orange-50 text-orange-600 rounded-full border border-orange-200 hover:bg-orange-100 transition-all shrink-0 whitespace-nowrap">
                <i class="fa-solid fa-building mr-1"></i> Agence
              </a>
              <a *ngIf="currentRole === 'owner'" routerLink="/dashboard" class="px-2.5 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-full border border-slate-700 hover:bg-black transition-all shrink-0 whitespace-nowrap">
                <i class="fa-solid fa-user-check mr-1 text-orange-400"></i> Propriétaire
              </a>
              <a *ngIf="currentRole === 'tenant'" routerLink="/espace-locataire" class="px-2.5 py-1.5 text-xs font-bold bg-orange-50 text-orange-600 rounded-full border border-orange-200 hover:bg-orange-100 transition-all shrink-0 whitespace-nowrap">
                <i class="fa-solid fa-user mr-1"></i> Chercheur
              </a>

              <button (click)="handleLogout()" class="p-1.5 text-slate-400 hover:text-red-600 transition-colors shrink-0 cursor-pointer" title="Se déconnecter">
                <i class="fa-solid fa-right-from-bracket text-sm"></i>
              </button>
            </ng-container>

          </div>

          <!-- Mobile / Tablet Hamburger Menu Button -->
          <button (click)="mobileMenuOpen = !mobileMenuOpen" class="lg:hidden p-1.5 sm:p-2 text-slate-700 hover:text-orange-600 text-lg rounded-xl focus:outline-none shrink-0 cursor-pointer" title="Menu">
            <i class="fa-solid" [ngClass]="mobileMenuOpen ? 'fa-xmark' : 'fa-bars'"></i>
          </button>

        </div>

      </div>

      <!-- Mobile / Tablet Navigation Overlay Drawer -->
      <div *ngIf="mobileMenuOpen" class="lg:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-2 shadow-lg">
        <a routerLink="/" (click)="mobileMenuOpen = false" routerLinkActive="text-orange-600 bg-orange-50 font-bold" [routerLinkActiveOptions]="{exact: true}" class="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-50">
          Accueil
        </a>
        <a routerLink="/annonces" [queryParams]="{transaction_type: 'sale'}" (click)="mobileMenuOpen = false" routerLinkActive="text-orange-600 bg-orange-50 font-bold" class="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-50">
          Acheter un bien
        </a>
        <a routerLink="/annonces" [queryParams]="{transaction_type: 'rent'}" (click)="mobileMenuOpen = false" routerLinkActive="text-orange-600 bg-orange-50 font-bold" class="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-50">
          Louer un bien
        </a>
        <a routerLink="/comment-ca-marche" (click)="mobileMenuOpen = false" routerLinkActive="text-orange-600 bg-orange-50 font-bold" class="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-50">
          Comment ça marche ?
        </a>
        <a routerLink="/a-propos" (click)="mobileMenuOpen = false" routerLinkActive="text-orange-600 bg-orange-50 font-bold" class="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-50">
          À propos
        </a>
      </div>
    </header>

    <!-- OTP Email Validation Modal -->
    <app-auth-modal 
      [isOpen]="showAuthOTPModal" 
      [initialMode]="authOTPModalMode"
      [initialRole]="selectedAuthRole"
      [noticeMessage]="authNoticeMessage"
      (close)="showAuthOTPModal = false"
      (authenticated)="onUserAuthenticated($event)">
    </app-auth-modal>
  `
})
export class HeaderComponent implements OnInit {
  currentRole: 'tenant' | 'owner' | 'agency' | 'admin' = 'tenant';
  isLoggedIn = false;
  favoritesCount = 0;
  mobileMenuOpen = false;

  showLoginModal = false;
  showRegisterModal = false;
  showAuthOTPModal = false;
  authOTPModalMode: 'login' | 'register' | 'verify' = 'register';
  selectedAuthRole: 'tenant' | 'owner' | 'agency' = 'tenant';
  showCountryDropdown = false;
  showNotificationsDropdown = false;

  unreadCount = 0;
  notifications: any[] = [];

  loginType: 'tenant' | 'owner' | 'agency' | 'admin' = 'tenant';
  loginEmail = '';
  loginPassword = '';
  loginErrorMsg = '';
  showLoginPassword = false;

  registerType: 'tenant' | 'owner' | 'agency' = 'tenant';
  regName = '';
  regEmail = '';
  regPhonePrefix = '+221';
  regPhone = '';
  regPassword = '';
  showRegisterPassword = false;

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
    this.propertyService.notifications$.subscribe(n => this.notifications = n);
    this.propertyService.unreadNotificationsCount$.subscribe(c => this.unreadCount = c);

    this.propertyService.authModalRequest$.subscribe((req: {
      mode: 'login' | 'register';
      message?: string;
      targetUrl?: string;
      role?: 'tenant' | 'owner' | 'agency';
    }) => {
      this.authNoticeMessage = req.message || '';
      this.pendingTargetUrl = req.targetUrl || null;
      if (req.role) {
        this.selectedAuthRole = req.role;
      }
      if (req.mode === 'register') {
        this.openRegisterModal(req.role);
      } else {
        this.openLoginModal(req.role);
      }
    });

    // Load notifications from API
    this.propertyService.getNotifications().subscribe();
  }

  onNotificationClick(notif: any): void {
    if (!notif.is_read) {
      this.propertyService.markNotificationAsRead(notif.id).subscribe();
    }
    this.showNotificationsDropdown = false;
    
    // Auto-authenticate if not logged in to bypass auth guard smoothly
    if (!this.isLoggedIn) {
      const email = notif.recipient_email || 'amadou.sow@izivilla.sn';
      const role = (notif.type === 'NEW_REQUEST' || notif.type === 'REQUEST_CONFIRMATION') ? 'owner' : 'tenant';
      this.propertyService.loginUser(email, 'pass123', role);
    }

    let targetUrl = notif.link || '/dashboard';
    if (notif.type === 'NEW_REQUEST' || notif.type === 'REQUEST_CONFIRMATION') {
      targetUrl = '/espace-proprietaire?tab=requests';
    } else if (notif.type === 'PROPERTY_EXPIRATION' || notif.type === 'PROPERTY_STATUS') {
      targetUrl = '/espace-proprietaire?tab=properties';
    } else if (notif.type === 'SEARCH_ALERT') {
      targetUrl = notif.link || '/annonces';
    }
    this.router.navigateByUrl(targetUrl);
  }

  quickLogin(role: 'owner' | 'tenant' | 'agency' = 'owner'): void {
    const email = role === 'owner' ? 'amadou.sow@izivilla.sn' : (role === 'agency' ? 'contact@immoconseil.sn' : 'abdou.diop@client.sn');
    this.loginEmail = email;
    this.loginPassword = 'password123';
    this.loginType = role;
    this.handleLogin();
  }



  markAllAsRead(): void {
    this.propertyService.markAllNotificationsAsRead().subscribe();
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

  openLoginModal(role?: 'tenant' | 'owner' | 'agency'): void {
    if (role) {
      this.selectedAuthRole = role;
    }
    this.authOTPModalMode = 'login';
    this.showAuthOTPModal = true;
  }

  openRegisterModal(role?: 'tenant' | 'owner' | 'agency'): void {
    if (role) {
      this.selectedAuthRole = role;
    }
    this.authOTPModalMode = 'register';
    this.showAuthOTPModal = true;
  }

  onUserAuthenticated(user: any): void {
    const session = {
      name: user.name || 'Utilisateur',
      email: user.email,
      role: (user.role || 'tenant') as 'tenant' | 'owner' | 'agency' | 'admin',
      phone: user.phone || ''
    };
    this.propertyService.loginWithUserSession(session);
    this.showAuthOTPModal = false;
    if (this.pendingTargetUrl) {
      const target = this.pendingTargetUrl;
      this.pendingTargetUrl = null;
      this.router.navigateByUrl(target);
    } else {
      if (session.role === 'admin') {
        this.router.navigate(['/admin']);
      } else if (session.role === 'agency' || session.role === 'owner') {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/espace-locataire']);
      }
    }
  }

  switchToRegister(): void {
    this.authOTPModalMode = 'register';
    this.showAuthOTPModal = true;
  }

  switchToLogin(): void {
    this.authOTPModalMode = 'login';
    this.showAuthOTPModal = true;
  }

  onPublishClick(): void {
    const currentUser = this.propertyService.getCurrentUser();
    if (this.isUserLoggedIn && currentUser) {
      if (currentUser.role === 'tenant') {
        this.authNoticeMessage = 'Les comptes "Chercheur" ne peuvent pas publier d\'annonces. Veuillez vous connecter ou créer un compte Propriétaire ou Agence.';
        this.pendingTargetUrl = '/deposer-annonce';
        this.registerType = 'owner';
        this.openRegisterModal('owner');
      } else {
        this.router.navigate(['/deposer-annonce']);
      }
    } else {
      this.authNoticeMessage = 'Veuillez créer un compte Propriétaire ou Agence (ou vous connecter) pour publier votre bien.';
      this.pendingTargetUrl = '/deposer-annonce';
      this.registerType = 'owner';
      this.openRegisterModal('owner');
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

