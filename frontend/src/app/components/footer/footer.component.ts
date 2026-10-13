import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          <!-- Column 1: Brand & Slogan -->
          <div class="lg:col-span-2 space-y-4">
            <a routerLink="/" class="inline-block group">
              <img src="/images/logo-white.png" alt="IziVilla" class="h-9 sm:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105">
            </a>
            
            <p class="text-amber-400 font-bold text-xs uppercase tracking-wider">
              « Zéro intermédiaire inutile · Contact direct »
            </p>

            <p class="text-slate-400 text-xs leading-relaxed max-w-sm">
              Plateforme immobilière directe de référence au Sénégal. Trouvez votre bien et échangez directement avec les propriétaires vérifiés et agences certifiées.
            </p>

            <div class="flex items-center gap-2 text-slate-400 pt-2">
              <a href="https://whatsapp.com" target="_blank" class="w-9 h-9 rounded-full bg-slate-800 hover:bg-orange-600 text-white flex items-center justify-center transition-colors">
                <i class="fa-brands fa-whatsapp text-base"></i>
              </a>
              <a href="#" class="w-9 h-9 rounded-full bg-slate-800 hover:bg-orange-600 text-white flex items-center justify-center transition-colors">
                <i class="fa-brands fa-facebook-f text-sm"></i>
              </a>
              <a href="#" class="w-9 h-9 rounded-full bg-slate-800 hover:bg-orange-600 text-white flex items-center justify-center transition-colors">
                <i class="fa-brands fa-instagram text-sm"></i>
              </a>
              <a href="#" class="w-9 h-9 rounded-full bg-slate-800 hover:bg-orange-600 text-white flex items-center justify-center transition-colors">
                <i class="fa-brands fa-linkedin-in text-sm"></i>
              </a>
            </div>
          </div>

          <!-- Column 2: Navigation Immobilière -->
          <div>
            <h4 class="text-white font-extrabold text-xs uppercase tracking-wider mb-4 border-l-2 border-orange-500 pl-2">Navigation</h4>
            <ul class="space-y-2.5 text-xs text-slate-400 font-semibold">
              <li><a routerLink="/annonces" [queryParams]="{transaction_type: 'sale'}" class="hover:text-orange-500 transition-colors">Acheter un bien</a></li>
              <li><a routerLink="/annonces" [queryParams]="{transaction_type: 'rent'}" class="hover:text-orange-500 transition-colors">Louer un bien</a></li>
              <li><a routerLink="/annonces" [queryParams]="{property_type: 'Terrain'}" class="hover:text-orange-500 transition-colors">Terrains & Parcelles</a></li>
              <li><a routerLink="/annonces" [queryParams]="{property_type: 'Bureau'}" class="hover:text-orange-500 transition-colors">Locaux commerciaux</a></li>
              <li><button (click)="onPublishClick()" class="text-orange-400 font-bold hover:underline cursor-pointer">Publier une annonce</button></li>
            </ul>
          </div>

          <!-- Column 3: Découverte & Agences -->
          <div>
            <h4 class="text-white font-extrabold text-xs uppercase tracking-wider mb-4 border-l-2 border-orange-500 pl-2">Plateforme</h4>
            <ul class="space-y-2.5 text-xs text-slate-400 font-semibold">
              <li><a routerLink="/agencies" class="hover:text-orange-500 transition-colors">Agences partenaires</a></li>
              <li><a routerLink="/comment-ca-marche" class="hover:text-orange-500 transition-colors">Comment ça marche ?</a></li>
              <li><a routerLink="/a-propos" class="hover:text-orange-500 transition-colors">À propos d'Izivilla</a></li>
              <li><a routerLink="/a-propos" class="hover:text-orange-500 transition-colors">Contact & Support</a></li>
              <li><a routerLink="/comment-ca-marche" class="hover:text-orange-500 transition-colors">F.A.Q.</a></li>
            </ul>
          </div>

          <!-- Column 4: Sénégal Zones Prisées -->
          <div>
            <h4 class="text-white font-extrabold text-xs uppercase tracking-wider mb-4 border-l-2 border-orange-500 pl-2">Zones Sénégal</h4>
            <ul class="space-y-2.5 text-xs text-slate-400 font-semibold">
              <li><a routerLink="/annonces" [queryParams]="{city: 'Dakar', quartier: 'Almadies'}" class="hover:text-orange-500 transition-colors">Almadies & Ngor</a></li>
              <li><a routerLink="/annonces" [queryParams]="{city: 'Dakar', quartier: 'Mermoz'}" class="hover:text-orange-500 transition-colors">Mermoz, Ouakam, VDN</a></li>
              <li><a routerLink="/annonces" [queryParams]="{city: 'Dakar', quartier: 'Sacré-Cœur'}" class="hover:text-orange-500 transition-colors">Sacré-Cœur & Mermoz</a></li>
              <li><a routerLink="/annonces" [queryParams]="{city: 'Saly'}" class="hover:text-orange-500 transition-colors">Saly & Petite Côte</a></li>
              <li><a routerLink="/annonces" [queryParams]="{city: 'Thiès'}" class="hover:text-orange-500 transition-colors">Thiès & Saint-Louis</a></li>
            </ul>
          </div>

        </div>

        <!-- Bottom Copyright & Legal Links -->
        <div class="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4 font-semibold">
          <p>© 2026 Izivilla. Tous droits réservés.</p>
          <div class="flex flex-wrap gap-6">
            <a routerLink="/a-propos" class="hover:text-slate-300">Conditions Générales</a>
            <a routerLink="/a-propos" class="hover:text-slate-300">Politique de confidentialité</a>
            <a routerLink="/a-propos" class="hover:text-slate-300">Protection des données</a>
          </div>
        </div>

      </div>
    </footer>
  `
})
export class FooterComponent {
  constructor(
    private propertyService: PropertyService,
    private router: Router
  ) {}

  onPublishClick(): void {
    if (this.propertyService.isLoggedIn$.getValue()) {
      this.router.navigate(['/deposer-annonce']);
    } else {
      this.propertyService.openAuthModal(
        'register',
        'Veuillez vous connecter ou créer un compte pour publier votre annonce.',
        '/deposer-annonce'
      );
    }
  }
}


