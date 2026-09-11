import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Language = 'fr' | 'en';

export interface Translations {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private langSubject = new BehaviorSubject<Language>('fr');
  public lang$ = this.langSubject.asObservable();

  private dictionary: Record<Language, Translations> = {
    fr: {
      // Nav & Top Header
      'nav.home': 'Accueil',
      'nav.properties': 'Annonces',
      'nav.agencies': 'Agences',
      'nav.createProperty': 'Déposer une annonce',
      'nav.tenantSpace': 'Espace Locataire',
      'nav.agencySpace': 'Espace Agence',
      'nav.adminSpace': 'Espace Admin',
      'nav.login': 'Connexion',
      'nav.register': "S'inscrire",
      'nav.logout': 'Déconnexion',
      'nav.topLocation': 'Sénégal : Dakar, Thiès, Saly, Saint-Louis',
      'nav.topPayments': 'Paiements Wave & Orange Money',
      'nav.topSupport': 'Support : +221 33 800 00 00',
      'nav.topVerified': 'Annonces 100% Vérifiées',

      // Hero & Search
      'hero.title': 'Trouvez votre futur chez-vous au Sénégal',
      'hero.subtitle': 'Des milliers d’appartements, villas et terrains à louer ou acheter à Dakar, Thiès, Saly et plus encore.',
      'hero.badge': 'N°1 de la Location au Sénégal',
      'hero.rent': 'Louer',
      'hero.buy': 'Acheter',
      'hero.search': 'Rechercher',
      'hero.propertyType': 'Type de bien',
      'hero.allTypes': 'Tous les types',
      'hero.apartment': 'Appartement',
      'hero.villa': 'Villa / Maison',
      'hero.studio': 'Studio',
      'hero.office': 'Bureau / Commerce',
      'hero.land': 'Terrain',
      'hero.location': 'Ville',
      'hero.quartier': 'Quartier',
      'hero.maxPrice': 'Prix Max (FCFA)',
      'hero.activeListings': 'Annonces Actives',
      'hero.verifiedAgencies': 'Agences Vérifiées',
      'hero.securePayment': 'Paiement Sécurisé',
      'hero.fastVisits': 'Visites en 24h',
      'hero.frequentSearches': 'Recherches fréquentes à Dakar :',
      'hero.activeRegions': 'Régions actives :',
      'hero.featuredBadge': 'Annonces en Vedette & Sponsorisées',
      'hero.featuredTitle': 'Logements recommandés & récents',
      'hero.featuredSubtitle': 'Sélection d\'appartements et villas vérifiés à Dakar, Saly et Thiès',
      'hero.exploreAll': 'Explorer les annonces',
      'hero.whyTitle': 'Pourquoi choisir IziVilla ?',
      'hero.whySubtitle': 'La première plateforme moderne dédiée à la location et vente immobilière au Sénégal.',

      // Properties List Page
      'props.title': 'Dernières Annonces Disponibles',
      'props.pageTitle': 'Toutes les Annonces Disponibles',
      'props.pageSubtitle': 'Explorez tous les logements disponibles à la location et vente au Sénégal',
      'props.filterTitle': 'Filtres de Recherche',
      'props.city': 'Ville',
      'props.allCities': 'Toutes les villes',
      'props.quartier': 'Quartier',
      'props.allQuartiers': 'Tous les quartiers',
      'props.type': 'Type de Bien',
      'props.allTypes': 'Tous les types',
      'props.maxPrice': 'Budget Maximum',
      'props.bedrooms': 'Nombre de Chambres',
      'props.bathrooms': 'Salles de Bain',
      'props.furnishedOnly': 'Meublé uniquement',
      'props.resetFilters': 'Réinitialiser les filtres',
      'props.noResults': 'Aucune annonce ne correspond à vos critères',
      'props.resultsCount': 'annonces trouvées',
      'props.perMonth': '/mois',
      'props.perDay': '/jour',
      'props.seeAll': 'Voir toutes les annonces',
      'props.details': 'Voir détails',
      'props.favorite': 'Favoris',
      'props.viewDetails': 'Voir détails',
      'props.sponsored': 'Sponsorisé',
      'props.furnished': 'Meublé',
      'props.alertEmailCTA': 'Créer une alerte email',

      // Property Detail Page
      'detail.back': 'Retour aux annonces',
      'detail.price': 'Prix de location',
      'detail.features': 'Caractéristiques du bien',
      'detail.bedrooms': 'Chambres',
      'detail.bathrooms': 'Salles de bain',
      'detail.surface': 'Superficie',
      'detail.furnished': 'Meublé',
      'detail.notFurnished': 'Non meublé',
      'detail.description': 'Description du bien',
      'detail.locationMap': 'Localisation sur la carte',
      'detail.contactAgency': 'Contacter l\'Agence',
      'detail.agencyName': 'Gestionnaire',
      'detail.verifiedAgency': 'Agence Agréée Partenaire',
      'detail.callNow': 'Appeler l\'agence',
      'detail.whatsapp': 'Contacter par WhatsApp',
      'detail.scheduleVisit': 'Planifier une visite',
      'detail.visitModalTitle': 'Demander une visite',
      'detail.visitDate': 'Date souhaitée de visite',
      'detail.visitTime': 'Heure souhaitée',
      'detail.visitName': 'Votre Nom & Prénom',
      'detail.visitPhone': 'Numéro Téléphone (WhatsApp)',
      'detail.visitEmail': 'Email',
      'detail.visitMessage': 'Message ou précision',
      'detail.confirmVisit': 'Envoyer la demande de visite',

      // Agency List Page
      'agency.title': 'Agences Immobilières Partenaires',
      'agency.subtitle': 'Faites confiance aux professionnels vérifiés pour votre recherche immobilière au Sénégal',
      'agency.search': 'Rechercher une agence par nom ou ville...',
      'agency.verified': 'Vérifiée',
      'agency.activeListings': 'Annonces actives',
      'agency.contact': 'Contacter',
      'agency.viewProperties': 'Voir leurs annonces',

      // Tenant Dashboard
      'tenant.title': 'Mon Espace Locataire',
      'tenant.favoritesTab': 'Mes Favoris',
      'tenant.appointmentsTab': 'Mes Demandes de Visite',
      'tenant.alertsTab': 'Mes Alertes Recherche',
      'tenant.profileTab': 'Mon Profil',
      'tenant.noFavs': 'Vous n\'avez pas encore enregistré d\'annonces favorites',
      'tenant.noAppointments': 'Aucune demande de visite enregistrée',
      'tenant.statusPending': 'En attente de confirmation',
      'tenant.statusConfirmed': 'Visite Confirmée',
      'tenant.statusCancelled': 'Annulée',
      'tenant.createAlertBtn': 'Créer une alerte email',

      // Agency Dashboard
      'dash.title': 'Tableau de Bord Agence',
      'dash.myListings': 'Mes Annonces',
      'dash.totalProperties': 'Total Annonces',
      'dash.totalVisits': 'Demandes de Visite',
      'dash.addNewProperty': 'Déposer une annonce',
      'dash.boost': 'Booster (Wave/OM)',
      'dash.boostTitle': 'Boost de Visibilité par Mobile Money',
      'dash.statusActive': 'Actif',
      'dash.statusPending': 'En attente',
      'dash.delete': 'Supprimer',
      'dash.views': 'Vues totales',
      'dash.sponsoredCount': 'Biens Sponsorisés',

      // Admin Dashboard
      'admin.title': 'Panneau d\'Administration IziVilla',
      'admin.propertiesTab': 'Gestion des Annonces',
      'admin.agenciesTab': 'Agences Agréées',
      'admin.statsTab': 'Statistiques',
      'admin.approve': 'Valider',
      'admin.reject': 'Refuser',
      'admin.verified': '100% vérifiées NINEA',
      'admin.apiActive': 'Serveur API Laravel : Actif',

      // Modals
      'modal.loginTitle': 'Se connecter à IziVilla',
      'modal.loginSubtitle': 'Accédez à vos annonces, favoris et demandes de visite.',
      'modal.registerTitle': 'Créer un compte IziVilla',
      'modal.registerSubtitle': 'Rejoignez la plateforme n°1 de la location au Sénégal.',
      'modal.tenantTab': 'Locataire',
      'modal.agencyTab': 'Agence',
      'modal.adminTab': 'Admin',
      'modal.tenantRole': 'Je suis Locataire',
      'modal.agencyRole': 'Créer mon Agence',
      'modal.email': 'Adresse Email',
      'modal.password': 'Mot de passe',
      'modal.fullName': 'Prénom & Nom',
      'modal.agencyName': "Nom de l'Agence Immobilière",
      'modal.phone': 'Numéro de Téléphone (Sénégal)',
      'modal.submitLogin': 'Se connecter',
      'modal.submitAdminLogin': 'Connexion Espace Admin',
      'modal.submitRegisterTenant': 'Créer mon compte Locataire',
      'modal.submitRegisterAgency': 'Créer mon espace Agence',
      'modal.noAccount': 'Pas de compte ?',
      'modal.alreadyAccount': 'Vous avez déjà un compte ?',
      'modal.forgotPassword': 'Mot de passe oublié ?',
      'modal.secureConnection': 'Connexion sécurisée',

      // Footer
      'footer.about': 'La plateforme immobilière n°1 au Sénégal. Trouvez ou publiez vos logements en toute simplicité et sécurité.',
      'footer.payments': 'Paiements locaux acceptés :',
      'footer.citiesTitle': 'Villes au Sénégal',
      'footer.categoriesTitle': 'Catégories',
      'footer.proTitle': 'Espace Pro',
      'footer.rights': 'IziVilla Sénégal. Tous droits réservés.',
      'footer.privacy': 'Politique de confidentialité',
      'footer.terms': 'Conditions d’utilisation',
      'footer.legal': 'Mentions Légales'
    },
    en: {
      // Nav & Top Header
      'nav.home': 'Home',
      'nav.properties': 'Listings',
      'nav.agencies': 'Agencies',
      'nav.createProperty': 'Post an Ad',
      'nav.tenantSpace': 'Tenant Space',
      'nav.agencySpace': 'Agency Space',
      'nav.adminSpace': 'Admin Space',
      'nav.login': 'Sign In',
      'nav.register': 'Register',
      'nav.logout': 'Sign Out',
      'nav.topLocation': 'Senegal: Dakar, Thies, Saly, Saint-Louis',
      'nav.topPayments': 'Wave & Orange Money Payments',
      'nav.topSupport': 'Support: +221 33 800 00 00',
      'nav.topVerified': '100% Verified Listings',

      // Hero & Search
      'hero.title': 'Find your future home in Senegal',
      'hero.subtitle': 'Thousands of apartments, villas, and land for rent or sale in Dakar, Thies, Saly and more.',
      'hero.badge': '#1 Rental Platform in Senegal',
      'hero.rent': 'Rent',
      'hero.buy': 'Buy',
      'hero.search': 'Search',
      'hero.propertyType': 'Property Type',
      'hero.allTypes': 'All Types',
      'hero.apartment': 'Apartment',
      'hero.villa': 'Villa / House',
      'hero.studio': 'Studio',
      'hero.office': 'Office / Retail',
      'hero.land': 'Land',
      'hero.location': 'City',
      'hero.quartier': 'Neighborhood',
      'hero.maxPrice': 'Max Price (FCFA)',
      'hero.activeListings': 'Active Listings',
      'hero.verifiedAgencies': 'Verified Agencies',
      'hero.securePayment': 'Secure Payment',
      'hero.fastVisits': 'Visits in 24h',
      'hero.frequentSearches': 'Frequent searches in Dakar:',
      'hero.activeRegions': 'Active regions:',
      'hero.featuredBadge': 'Featured & Sponsored Listings',
      'hero.featuredTitle': 'Recommended & Recent Properties',
      'hero.featuredSubtitle': 'Selection of verified apartments and villas in Dakar, Saly, and Thies',
      'hero.exploreAll': 'Explore listings',
      'hero.whyTitle': 'Why choose IziVilla?',
      'hero.whySubtitle': 'The premiere modern platform dedicated to rental and real estate sales in Senegal.',

      // Properties List Page
      'props.title': 'Latest Available Listings',
      'props.pageTitle': 'All Available Listings',
      'props.pageSubtitle': 'Explore all properties available for rent and sale in Senegal',
      'props.filterTitle': 'Search Filters',
      'props.city': 'City',
      'props.allCities': 'All cities',
      'props.quartier': 'Neighborhood',
      'props.allQuartiers': 'All neighborhoods',
      'props.type': 'Property Type',
      'props.allTypes': 'All types',
      'props.maxPrice': 'Max Budget',
      'props.bedrooms': 'Number of Bedrooms',
      'props.bathrooms': 'Bathrooms',
      'props.furnishedOnly': 'Furnished only',
      'props.resetFilters': 'Reset filters',
      'props.noResults': 'No listings match your search criteria',
      'props.resultsCount': 'listings found',
      'props.perMonth': '/month',
      'props.perDay': '/day',
      'props.seeAll': 'View all listings',
      'props.details': 'View details',
      'props.favorite': 'Favorites',
      'props.viewDetails': 'View details',
      'props.sponsored': 'Sponsored',
      'props.furnished': 'Furnished',
      'props.alertEmailCTA': 'Create email alert',

      // Property Detail Page
      'detail.back': 'Back to listings',
      'detail.price': 'Rental Price',
      'detail.features': 'Property Features',
      'detail.bedrooms': 'Bedrooms',
      'detail.bathrooms': 'Bathrooms',
      'detail.surface': 'Surface area',
      'detail.furnished': 'Furnished',
      'detail.notFurnished': 'Unfurnished',
      'detail.description': 'Property Description',
      'detail.locationMap': 'Location on Map',
      'detail.contactAgency': 'Contact Agency',
      'detail.agencyName': 'Property Manager',
      'detail.verifiedAgency': 'Verified Partner Agency',
      'detail.callNow': 'Call Agency',
      'detail.whatsapp': 'Contact via WhatsApp',
      'detail.scheduleVisit': 'Schedule a Visit',
      'detail.visitModalTitle': 'Request a Visit',
      'detail.visitDate': 'Desired Visit Date',
      'detail.visitTime': 'Desired Visit Time',
      'detail.visitName': 'Your Full Name',
      'detail.visitPhone': 'Phone Number (WhatsApp)',
      'detail.visitEmail': 'Email',
      'detail.visitMessage': 'Message or notes',
      'detail.confirmVisit': 'Send Visit Request',

      // Agency List Page
      'agency.title': 'Partner Real Estate Agencies',
      'agency.subtitle': 'Trust verified professionals for your real estate search in Senegal',
      'agency.search': 'Search an agency by name or city...',
      'agency.verified': 'Verified',
      'agency.activeListings': 'Active listings',
      'agency.contact': 'Contact',
      'agency.viewProperties': 'View their listings',

      // Tenant Dashboard
      'tenant.title': 'My Tenant Space',
      'tenant.favoritesTab': 'My Favorites',
      'tenant.appointmentsTab': 'My Visit Requests',
      'tenant.alertsTab': 'My Search Alerts',
      'tenant.profileTab': 'My Profile',
      'tenant.noFavs': 'You have not saved any favorite listings yet',
      'tenant.noAppointments': 'No visit requests recorded',
      'tenant.statusPending': 'Pending Confirmation',
      'tenant.statusConfirmed': 'Visit Confirmed',
      'tenant.statusCancelled': 'Cancelled',
      'tenant.createAlertBtn': 'Create Email Alert',

      // Agency Dashboard
      'dash.title': 'Agency Dashboard',
      'dash.myListings': 'My Listings',
      'dash.totalProperties': 'Total Listings',
      'dash.totalVisits': 'Visit Requests',
      'dash.addNewProperty': 'Post a Listing',
      'dash.boost': 'Boost (Wave/OM)',
      'dash.boostTitle': 'Mobile Money Visibility Boost',
      'dash.statusActive': 'Active',
      'dash.statusPending': 'Pending',
      'dash.delete': 'Delete',
      'dash.views': 'Total Views',
      'dash.sponsoredCount': 'Sponsored Listings',

      // Admin Dashboard
      'admin.title': 'IziVilla Admin Panel',
      'admin.propertiesTab': 'Property Management',
      'admin.agenciesTab': 'Verified Agencies',
      'admin.statsTab': 'Statistics',
      'admin.approve': 'Approve',
      'admin.reject': 'Reject',
      'admin.verified': '100% NINEA Verified',
      'admin.apiActive': 'Laravel API Server: Active',

      // Modals
      'modal.loginTitle': 'Sign in to IziVilla',
      'modal.loginSubtitle': 'Access your listings, favorites, and visit requests.',
      'modal.registerTitle': 'Create an IziVilla account',
      'modal.registerSubtitle': 'Join the #1 real estate platform in Senegal.',
      'modal.tenantTab': 'Tenant',
      'modal.agencyTab': 'Agency',
      'modal.adminTab': 'Admin',
      'modal.tenantRole': 'I am a Tenant',
      'modal.agencyRole': 'Create Agency',
      'modal.email': 'Email Address',
      'modal.password': 'Password',
      'modal.fullName': 'Full Name',
      'modal.agencyName': 'Agency Name',
      'modal.phone': 'Phone Number (Senegal)',
      'modal.submitLogin': 'Sign In',
      'modal.submitAdminLogin': 'Admin Portal Sign In',
      'modal.submitRegisterTenant': 'Create Tenant Account',
      'modal.submitRegisterAgency': 'Create Agency Space',
      'modal.noAccount': "Don't have an account?",
      'modal.alreadyAccount': 'Already have an account?',
      'modal.forgotPassword': 'Forgot password?',
      'modal.secureConnection': 'Secure Login',

      // Footer
      'footer.about': '#1 real estate platform in Senegal. Find or publish properties with complete ease and security.',
      'footer.payments': 'Local payments accepted:',
      'footer.citiesTitle': 'Cities in Senegal',
      'footer.categoriesTitle': 'Categories',
      'footer.proTitle': 'Pro Space',
      'footer.rights': 'IziVilla Senegal. All rights reserved.',
      'footer.privacy': 'Privacy Policy',
      'footer.terms': 'Terms of Use',
      'footer.legal': 'Legal Notices'
    }
  };

  constructor() {
    const savedLang = localStorage.getItem('izivilla_lang') as Language | null;
    if (savedLang === 'fr' || savedLang === 'en') {
      this.langSubject.next(savedLang);
    }
  }

  public setLanguage(lang: Language): void {
    this.langSubject.next(lang);
    localStorage.setItem('izivilla_lang', lang);
  }

  public get currentLang(): Language {
    return this.langSubject.value;
  }

  public translate(key: string): string {
    const lang = this.currentLang;
    return this.dictionary[lang]?.[key] || this.dictionary['fr']?.[key] || key;
  }
}
