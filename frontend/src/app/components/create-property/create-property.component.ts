import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { CountryService } from '../../services/country.service';

@Component({
  selector: 'app-create-property',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="bg-slate-50 min-h-screen py-10">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Form Card Container -->
        <div class="bg-white rounded-3xl p-6 sm:p-10 shadow-md border border-slate-200 space-y-8 text-left">
          
          <!-- Header & Stepper -->
          <div class="space-y-4 border-b border-slate-100 pb-6">
            <div class="flex items-center justify-between">
              <a routerLink="/annonces" class="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors">
                <i class="fa-solid fa-arrow-left"></i> Retour aux annonces
              </a>
              <span class="text-xs font-black uppercase text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                Étape {{ currentStep }} sur 6
              </span>
            </div>

            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center text-2xl font-black shrink-0 shadow-lg shadow-orange-600/30">
                <i class="fa-solid fa-house-medical"></i>
              </div>
              <div>
                <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Publier votre bien sur Izivilla</h1>
                <p class="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">Zéro intermédiaire. Recevez directement les demandes des candidats intéressés.</p>
              </div>
            </div>

            <!-- Stepper Progress Pills -->
            <div class="grid grid-cols-6 gap-2 pt-2">
              <div *ngFor="let s of [1,2,3,4,5,6]" [class.bg-orange-600]="s <= currentStep" [class.bg-slate-200]="s > currentStep" class="h-2 rounded-full transition-all"></div>
            </div>
          </div>

          <!-- Success Banner -->
          <div *ngIf="successMessage" class="p-8 bg-emerald-50 border-2 border-emerald-300 text-emerald-950 rounded-3xl space-y-3 text-center">
            <div class="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center text-3xl font-black mx-auto shadow-lg">
              <i class="fa-solid fa-check"></i>
            </div>
            <h3 class="font-black text-xl">Félicitations ! Votre bien est en ligne sur Izivilla.</h3>
            <p class="text-xs font-medium text-emerald-800">Les utilisateurs intéressés pourront vous contacter directement sur votre téléphone et WhatsApp.</p>
          </div>

          <!-- Tenant Blocked Banner -->
          <div *ngIf="isTenantBlocked" class="p-8 bg-amber-50 border-2 border-amber-300 text-amber-950 rounded-3xl space-y-4 text-center">
            <div class="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center text-3xl font-black mx-auto shadow-lg">
              <i class="fa-solid fa-user-lock"></i>
            </div>
            <h3 class="font-black text-xl">Accès restreint — Compte Chercheur</h3>
            <p class="text-xs font-semibold text-amber-900 max-w-lg mx-auto leading-relaxed">
              Les comptes « Chercheur » ne peuvent pas publier d'annonces sur Izivilla. Seuls les Propriétaires directs et les Agences immobilières peuvent ajouter des biens.
            </p>
            <button (click)="switchToOwnerAcc()" class="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-white text-xs font-black rounded-2xl shadow-md transition-all cursor-pointer">
              <i class="fa-solid fa-user-plus mr-1"></i> Créer un compte Propriétaire ou Agence
            </button>
          </div>

          <form *ngIf="!successMessage && !isTenantBlocked" (ngSubmit)="submitProperty()" class="space-y-6">
            
            <!-- ÉTAPE 1 — INFORMATIONS GÉNÉRALES -->
            <div *ngIf="currentStep === 1" class="space-y-5">
              <div class="border-b border-slate-100 pb-3">
                <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
                  <i class="fa-solid fa-file-signature text-orange-500"></i> Étape 1 — Informations générales
                </h3>
                <p class="text-xs text-slate-500 font-medium">Définissez le type de bien, la transaction et le titre récapitulatif.</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Type de transaction *</label>
                  <div class="grid grid-cols-2 gap-2">
                    <button type="button" (click)="newProp.transaction_type = 'sale'" [class.bg-orange-600]="newProp.transaction_type === 'sale'" [class.text-white]="newProp.transaction_type === 'sale'" class="py-3 rounded-2xl text-xs font-black border border-slate-200 bg-slate-50 text-slate-700 transition-all">
                      Vente (À vendre)
                    </button>
                    <button type="button" (click)="newProp.transaction_type = 'rent'" [class.bg-orange-600]="newProp.transaction_type === 'rent'" [class.text-white]="newProp.transaction_type === 'rent'" class="py-3 rounded-2xl text-xs font-black border border-slate-200 bg-slate-50 text-slate-700 transition-all">
                      Location (À louer)
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Type de bien *</label>
                  <select [(ngModel)]="newProp.property_type" name="property_type" required class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-extrabold text-slate-800">
                    <option value="Maison">Maison</option>
                    <option value="Appartement">Appartement</option>
                    <option value="Villa">Villa</option>
                    <option value="Terrain">Terrain</option>
                    <option value="Studio">Studio</option>
                    <option value="Chambre">Chambre</option>
                    <option value="Immeuble">Immeuble</option>
                    <option value="Local commercial">Local commercial</option>
                    <option value="Bureau">Bureau</option>
                    <option value="Boutique">Boutique</option>
                    <option value="Entrepôt">Entrepôt</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">Titre de l'annonce *</label>
                <input type="text" [(ngModel)]="newProp.title" name="title" required placeholder="Ex: Magnifique Villa 4 Chambres avec Jardin aux Almadies" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 shadow-sm">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">Description complète du bien *</label>
                <textarea [(ngModel)]="newProp.description" name="description" rows="5" required placeholder="Décrivez en détail la disposition des pièces, la lumière naturelle, la sécurité, l'accès goudronné..." class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 shadow-sm"></textarea>
              </div>
            </div>

            <!-- ÉTAPE 2 — PRIX & CONDITIONS -->
            <div *ngIf="currentStep === 2" class="space-y-5">
              <div class="border-b border-slate-100 pb-3">
                <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
                  <i class="fa-solid fa-coins text-orange-500"></i> Étape 2 — Prix & Conditions
                </h3>
                <p class="text-xs text-slate-500 font-medium">Définissez le montant net en {{ countryService.currentCountry.currency }} et les charges éventuelles.</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Prix du bien ({{ countryService.currentCountry.currency }}) *</label>
                  <input type="number" [(ngModel)]="newProp.price_fcfa" name="price_fcfa" required placeholder="Ex: 850000" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-black text-slate-900 focus:outline-none focus:border-orange-500 shadow-sm">
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Inclusions</label>
                  <label class="flex items-center gap-2 mt-3 cursor-pointer text-xs font-bold text-slate-800">
                    <input type="checkbox" [(ngModel)]="newProp.charges_included" name="charges_included" class="w-4 h-4 accent-orange-600 rounded">
                    <span>Charges de copropriété incluses dans le prix</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- ÉTAPE 3 — CARACTÉRISTIQUES -->
            <div *ngIf="currentStep === 3" class="space-y-5">
              <div class="border-b border-slate-100 pb-3">
                <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
                  <i class="fa-solid fa-bed text-orange-500"></i> Étape 3 — Caractéristiques
                </h3>
                <p class="text-xs text-slate-500 font-medium">Précisez les dimensions et commodités principales.</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Nombre de chambres</label>
                  <input type="number" [(ngModel)]="newProp.bedrooms" name="bedrooms" placeholder="3" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-extrabold text-slate-800">
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Nombre de SdB</label>
                  <input type="number" [(ngModel)]="newProp.bathrooms" name="bathrooms" placeholder="2" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-extrabold text-slate-800">
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Surface (m²)</label>
                  <input type="number" [(ngModel)]="newProp.surface_sqm" name="surface_sqm" placeholder="180" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-extrabold text-slate-800">
                </div>
              </div>

              <!-- Equipments Checklist -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-2">Équipements & Options</label>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button type="button" *ngFor="let eq of availableEquipments" (click)="toggleEq(eq)" [class.bg-orange-50]="hasEq(eq)" [class.border-orange-500]="hasEq(eq)" class="p-3 border border-slate-200 rounded-2xl text-xs font-bold text-left flex items-center justify-between transition-colors">
                    <span>{{ eq }}</span>
                    <i [class.fa-solid]="hasEq(eq)" [class.fa-check]="hasEq(eq)" [class.text-orange-600]="hasEq(eq)" class="text-xs"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- ÉTAPE 4 — LOCALISATION -->
            <div *ngIf="currentStep === 4" class="space-y-5">
              <div class="border-b border-slate-100 pb-3">
                <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
                  <i class="fa-solid fa-location-dot text-orange-500"></i> Étape 4 — Localisation
                </h3>
                <p class="text-xs text-slate-500 font-medium">Sélectionnez la région, la ville et le quartier exact du Sénégal.</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Région *</label>
                  <select [(ngModel)]="newProp.region" name="region" required class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-extrabold text-slate-800">
                    <option value="Dakar">Dakar</option>
                    <option value="Thiès">Thiès</option>
                    <option value="Saint-Louis">Saint-Louis</option>
                    <option value="Ziguinchor">Ziguinchor</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Ville *</label>
                  <input type="text" [(ngModel)]="newProp.city" name="city" required placeholder="ex: Dakar" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-extrabold text-slate-800">
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Quartier *</label>
                  <input type="text" [(ngModel)]="newProp.quartier" name="quartier" required placeholder="ex: Almadies, Mermoz" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-extrabold text-slate-800">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">Adresse précise / Repère public</label>
                <input type="text" [(ngModel)]="newProp.address" name="address" placeholder="ex: Rue des Ambassades, près de l'Hôtel Terrou-Bi" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800">
              </div>
            </div>

            <!-- ÉTAPE 5 — MÉDIAS -->
            <div *ngIf="currentStep === 5" class="space-y-5">
              <div class="border-b border-slate-100 pb-3">
                <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
                  <i class="fa-solid fa-camera text-orange-500"></i> Étape 5 — Médias (Photos & Vidéo)
                </h3>
                <p class="text-xs text-slate-500 font-medium">Ajoutez les visuels de votre bien.</p>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">URL de photo principale *</label>
                <input type="text" [(ngModel)]="primaryPhotoUrl" name="primaryPhotoUrl" required placeholder="https://images.unsplash.com/photo-..." class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800">
              </div>
            </div>

            <!-- ÉTAPE 6 — PUBLICATION (APERÇU FINAL) -->
            <div *ngIf="currentStep === 6" class="space-y-6">
              <div class="border-b border-slate-100 pb-3">
                <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
                  <i class="fa-solid fa-eye text-orange-500"></i> Étape 6 — Aperçu & Publication
                </h3>
                <p class="text-xs text-slate-500 font-medium">Vérifiez l'affichage de votre annonce avant mise en ligne directe.</p>
              </div>

              <!-- Preview Card Component -->
              <div class="bg-slate-50 rounded-3xl p-6 border-2 border-slate-200 max-w-md mx-auto space-y-4 shadow-sm">
                <div class="h-48 rounded-2xl bg-slate-950 overflow-hidden relative">
                  <img [src]="primaryPhotoUrl || 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80'" class="w-full h-full object-cover">
                  <span class="absolute top-3 left-3 bg-orange-600 text-white font-black text-[10px] px-2.5 py-1 rounded-lg uppercase">
                    {{ newProp.transaction_type === 'sale' ? 'Vente' : 'Location' }}
                  </span>
                </div>

                <div class="space-y-2">
                  <p class="text-2xl font-black text-orange-600">{{ newProp.price_fcfa | number }} {{ countryService.currentCountry.currency }}</p>
                  <h4 class="font-extrabold text-slate-900 text-base line-clamp-1">{{ newProp.title || 'Titre du bien' }}</h4>
                  <p class="text-xs text-slate-500 font-semibold"><i class="fa-solid fa-location-dot text-orange-500 mr-1"></i> {{ newProp.quartier }}, {{ newProp.city }}</p>
                </div>

                <div class="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div class="text-xs font-extrabold text-slate-900">
                    <p>{{ newProp.owner_name }}</p>
                    <span class="text-[10px] text-slate-500 font-bold">{{ newProp.owner_type }}</span>
                  </div>
                  <span class="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded"><i class="fa-solid fa-shield-check"></i> Verified</span>
                </div>
              </div>
            </div>

            <!-- Stepper Navigation Buttons -->
            <div class="pt-6 border-t border-slate-100 flex justify-between items-center">
              <button type="button" *ngIf="currentStep > 1" (click)="currentStep = currentStep - 1" class="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all">
                Étape précédente
              </button>
              <div></div>

              <button type="button" *ngIf="currentStep < 6" (click)="currentStep = currentStep + 1" class="px-8 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-lg shadow-orange-600/30 transition-all">
                Continuer (Étape {{ currentStep + 1 }})
              </button>

              <button type="submit" *ngIf="currentStep === 6" class="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-xl shadow-emerald-600/30 transition-all">
                <i class="fa-solid fa-rocket mr-1"></i> Publier mon bien sur Izivilla
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  `
})
export class CreatePropertyComponent implements OnInit {
  currentStep = 1;
  successMessage = false;
  primaryPhotoUrl = '';

  availableEquipments = [
    'Piscine', 'Climatisation', 'Groupe Électrogène', 'Caméras Sécurité',
    'Fibre Optique', 'Bâche à eau', 'Ascenseur', 'Gardiennage 24/7', 'Parking'
  ];

  newProp: any = {
    title: '',
    property_type: 'Appartement',
    transaction_type: 'rent',
    price_fcfa: null,
    charges_included: false,
    region: 'Dakar',
    city: 'Dakar',
    quartier: '',
    address: '',
    bedrooms: null,
    bathrooms: null,
    surface_sqm: null,
    description: '',
    owner_type: 'Propriétaire',
    owner_name: '',
    owner_phone: '',
    owner_email: '',
    equipments: []
  };

  isTenantBlocked = false;

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    public countryService: CountryService
  ) {}

  ngOnInit(): void {
    const user = this.propertyService.getCurrentUser();
    if (user && user.role === 'tenant') {
      this.isTenantBlocked = true;
    }
  }

  switchToOwnerAcc(): void {
    this.propertyService.openAuthModal(
      'register',
      'Veuillez créer un compte Propriétaire ou Agence pour publier votre bien sur Izivilla.',
      '/deposer-annonce'
    );
  }

  hasEq(eq: string): boolean {
    return this.newProp.equipments.includes(eq);
  }

  toggleEq(eq: string): void {
    if (this.hasEq(eq)) {
      this.newProp.equipments = this.newProp.equipments.filter((item: string) => item !== eq);
    } else {
      this.newProp.equipments.push(eq);
    }
  }

  submitProperty(): void {
    const payload = {
      ...this.newProp,
      images: [{ image_url: this.primaryPhotoUrl, is_primary: true }]
    };

    this.propertyService.createProperty(payload).subscribe(() => {
      this.successMessage = true;
      setTimeout(() => {
        this.router.navigate(['/annonces']);
      }, 2000);
    });
  }
}

