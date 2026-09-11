import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bg-slate-950 text-white pt-16 pb-12 border-t-4 border-orange-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          <!-- Column 1: Brand & Slogan -->
          <div class="lg:col-span-2 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
                <i class="fa-solid fa-house-chimney"></i>
              </div>
              <div>
                <span class="text-2xl font-black tracking-tight text-white">IZI<span class="text-orange-500">VILLA</span></span>
              </div>
            </div>
            
            <p class="text-orange-400 font-extrabold text-sm tracking-wide">
              « Zéro intermédiaire inutile. »
            </p>

            <p class="text-slate-400 text-xs leading-relaxed max-w-sm font-medium">
              Plateforme immobilière directe. Trouvez votre bien et contactez directement le véritable propriétaire ou l'agence certifiée sans frais cachés.
            </p>

            <div class="flex items-center gap-3 text-slate-400 pt-2">
              <a href="https://whatsapp.com" target="_blank" class="w-9 h-9 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors">
                <i class="fa-brands fa-whatsapp text-lg"></i>
              </a>
              <a href="#" class="w-9 h-9 rounded-xl bg-slate-900 hover:bg-blue-600 text-white flex items-center justify-center transition-colors">
                <i class="fa-brands fa-facebook-f text-base"></i>
              </a>
              <a href="#" class="w-9 h-9 rounded-xl bg-slate-900 hover:bg-pink-600 text-white flex items-center justify-center transition-colors">
                <i class="fa-brands fa-instagram text-base"></i>
              </a>
              <a href="#" class="w-9 h-9 rounded-xl bg-slate-900 hover:bg-blue-700 text-white flex items-center justify-center transition-colors">
                <i class="fa-brands fa-linkedin-in text-base"></i>
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


