import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of, Subject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Property, PropertyFilter, Agency, DirectMessage, PropertyReport, VerificationRequest } from '../models/property.model';

import { environment } from '../../environments/environment';

export interface UserSession {
  name: string;
  email: string;
  role: 'tenant' | 'owner' | 'agency' | 'admin';
  phone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private apiUrl = environment.apiUrl;

  // Session state for active role
  public currentRole$ = new BehaviorSubject<'tenant' | 'owner' | 'agency' | 'admin'>(this.getStoredUserRole());
  
  // Authenticated User Session
  public currentUser$ = new BehaviorSubject<UserSession | null>(this.getStoredUser());

  // Login session state
  public isLoggedIn$ = new BehaviorSubject<boolean>(localStorage.getItem('izivilla_logged_in') === 'true' && !!this.getStoredUser());

  // Modal Request Subject for unauthenticated user prompts
  public authModalRequest$ = new Subject<{ mode: 'login' | 'register'; message?: string; targetUrl?: string }>();

  openAuthModal(mode: 'login' | 'register' = 'login', message?: string, targetUrl?: string): void {
    this.authModalRequest$.next({ mode, message, targetUrl });
  }

  // Favorites session state
  public favorites$ = new BehaviorSubject<number[]>([1, 3]);

  private localAppointments: any[] = [];
  private localAlerts: any[] = [];
  private localMessages: DirectMessage[] = [
    {
      id: 101,
      property_id: 1,
      sender_name: 'Moussa Diop',
      sender_email: 'moussa.diop@email.sn',
      sender_phone: '+221 77 555 12 34',
      receiver_name: 'Amadou Sow (Propriétaire)',
      message: 'Bonjour Monsieur Sow, la villa aux Almadies est-elle toujours disponible pour une visite ce samedi ?',
      created_at: '2026-09-09T14:30:00Z',
      property_title: 'Villa Contemporaine 5 Chambres avec Piscine'
    },
    {
      id: 102,
      property_id: 2,
      sender_name: 'Awa Ndiaye',
      sender_email: 'awa.ndiaye@email.sn',
      sender_phone: '+221 78 444 99 88',
      receiver_name: 'Immo Conseil Senegal (Agence)',
      message: 'Bonjour, je souhaiterais obtenir la fiche technique de l\'appartement F4 à Mermoz.',
      created_at: '2026-09-08T10:15:00Z',
      property_title: 'Appartement Haut Standing F4 avec Balcon Vue Mer'
    }
  ];

  private localReports: PropertyReport[] = [];
  private localVerifications: VerificationRequest[] = [
    {
      id: 1,
      user_name: 'Cheikh Seck',
      user_email: 'cheikh.seck@email.sn',
      user_phone: '+221 77 612 34 56',
      user_type: 'owner',
      document_type: 'Titre Foncier / CNI',
      status: 'pending',
      submitted_at: '2026-09-05'
    },
    {
      id: 2,
      user_name: 'Teranga Real Estate',
      user_email: 'contact@terangarealestate.sn',
      user_phone: '+221 33 820 10 10',
      user_type: 'agency',
      document_type: 'NINEA & Registre du Commerce',
      status: 'pending',
      submitted_at: '2026-09-07'
    }
  ];

  private customProperties: Property[] = [];

  constructor(private http: HttpClient) {}

  private getStoredUser(): UserSession | null {
    const data = localStorage.getItem('izivilla_user');
    if (data) {
      try { return JSON.parse(data); } catch { return null; }
    }
    return null;
  }

  private getStoredUserRole(): 'tenant' | 'owner' | 'agency' | 'admin' {
    const user = this.getStoredUser();
    return user ? user.role : 'tenant';
  }

  getCurrentUser(): UserSession | null {
    return this.currentUser$.getValue();
  }

  loginUser(email: string, pass: string, selectedRole: 'tenant' | 'owner' | 'agency' | 'admin'): { success: boolean; message: string } {
    let role: 'tenant' | 'owner' | 'agency' | 'admin' = selectedRole;
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPass = (pass || '').trim();

    // Auto-detect Admin credentials regardless of selected tab
    if (cleanEmail === 'admin@izivilla.sn' || cleanEmail === 'admin' || cleanPass === 'admin123' || (cleanEmail.includes('admin') && cleanPass === 'admin123')) {
      if (cleanPass !== 'admin123' && cleanPass !== 'admin') {
        return { success: false, message: 'Mot de passe Administrateur incorrect.' };
      }
      role = 'admin';
    } else if (role === 'admin') {
      if (cleanPass !== 'admin123' && cleanPass !== 'admin') {
        return { success: false, message: 'Mot de passe Administrateur incorrect. (Démo: admin123)' };
      }
    }

    const registeredKey = 'izivilla_reg_' + cleanEmail;
    const registeredData = localStorage.getItem(registeredKey);
    let session: UserSession;

    if (registeredData) {
      try {
        const parsed = JSON.parse(registeredData);
        session = {
          name: parsed.name,
          email: parsed.email,
          phone: parsed.phone,
          role: parsed.role
        };
        role = parsed.role;
      } catch {
        session = {
          name: email.split('@')[0] || 'Utilisateur Izivilla',
          email: email || 'user@izivilla.sn',
          role: role
        };
      }
    } else {
      const userName = role === 'admin' ? 'Super Admin Izivilla' : (email.split('@')[0] || 'Utilisateur Izivilla');
      session = {
        name: userName,
        email: email || 'user@izivilla.sn',
        role: role
      };
    }

    localStorage.setItem('izivilla_logged_in', 'true');
    localStorage.setItem('izivilla_user', JSON.stringify(session));

    this.currentRole$.next(role);
    this.currentUser$.next(session);
    this.isLoggedIn$.next(true);

    return { success: true, message: `Connexion réussie en tant que ${role} !` };
  }

  registerUser(name: string, email: string, phone: string, pass: string, role: 'tenant' | 'owner' | 'agency'): { success: boolean; message: string } {
    const session: UserSession = {
      name: name || 'Nouvel Utilisateur',
      email: email,
      phone: phone,
      role: role
    };

    const cleanEmail = (email || '').toLowerCase().trim();
    localStorage.setItem('izivilla_reg_' + cleanEmail, JSON.stringify(session));

    return { success: true, message: `Compte ${role} créé avec succès ! Veuillez vous connecter.` };
  }

  login(): void {
    localStorage.setItem('izivilla_logged_in', 'true');
    this.isLoggedIn$.next(true);
  }

  logout(): void {
    localStorage.removeItem('izivilla_logged_in');
    localStorage.removeItem('izivilla_user');
    this.isLoggedIn$.next(false);
    this.currentUser$.next(null);
    this.currentRole$.next('tenant');
  }

  getProperties(filter: PropertyFilter = {}): Observable<any> {
    let params = new HttpParams();
    Object.keys(filter).forEach(key => {
      const val = (filter as any)[key];
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, val);
      }
    });

    return this.http.get<any>(`${this.apiUrl}/properties`, { params }).pipe(
      catchError(() => of(null)),
      map(res => {
        let list: Property[] = [];
        if (res && Array.isArray(res.data) && res.data.length > 0) {
          list = res.data;
        } else if (res && Array.isArray(res) && res.length > 0) {
          list = res;
        } else {
          list = this.getAllPropertiesCombined();
        }

        if (filter.transaction_type) {
          list = list.filter(p => p.transaction_type === filter.transaction_type);
        }
        if (filter.property_type) {
          list = list.filter(p => p.property_type?.toLowerCase() === filter.property_type?.toLowerCase());
        }
        if (filter.city) {
          list = list.filter(p => p.city?.toLowerCase().includes(filter.city!.toLowerCase()));
        }
        if (filter.bedrooms) {
          list = list.filter(p => (p.bedrooms || 0) >= Number(filter.bedrooms));
        }
        if (filter.max_price) {
          list = list.filter(p => (p.price_fcfa || 0) <= Number(filter.max_price));
        }

        return { data: list };
      })
    );
  }

  getPropertyById(id: number): Observable<Property> {
    return this.http.get<Property>(`${this.apiUrl}/properties/${id}`).pipe(
      catchError(() => {
        const all = this.getAllPropertiesCombined();
        const mock = all.find(p => p.id === Number(id));
        return of(mock || all[0]);
      })
    );
  }

  createProperty(propertyData: any): Observable<any> {
    const user = this.getCurrentUser();
    const newProp: Property = {
      id: Date.now(),
      title: propertyData.title || 'Nouveau Bien Immobilier Izivilla',
      description: propertyData.description || '',
      property_type: propertyData.property_type || 'Appartement',
      transaction_type: propertyData.transaction_type || 'sale',
      price_fcfa: propertyData.price_fcfa || 0,
      charges_included: propertyData.charges_included || false,
      region: propertyData.region || 'Dakar',
      city: propertyData.city || 'Dakar',
      quartier: propertyData.quartier || 'Almadies',
      address: propertyData.address || '',
      bedrooms: propertyData.bedrooms || 1,
      bathrooms: propertyData.bathrooms || 1,
      surface_sqm: propertyData.surface_sqm || 100,
      is_furnished: propertyData.is_furnished || false,
      has_air_con: propertyData.has_air_con || false,
      has_generator: propertyData.has_generator || false,
      has_security: propertyData.has_security || false,
      has_parking: propertyData.has_parking || false,
      has_pool: propertyData.has_pool || false,
      equipments: propertyData.equipments || [],
      latitude: propertyData.latitude || 14.7454,
      longitude: propertyData.longitude || -17.5194,
      status: 'available',
      is_featured: false,
      is_boosted: false,
      views_count: 1,
      owner_type: propertyData.owner_type || (user?.role === 'agency' ? 'Agence' : 'Propriétaire'),
      owner_name: propertyData.owner_name || user?.name || 'Propriétaire Izivilla',
      owner_phone: propertyData.owner_phone || user?.phone || '+221 77 000 00 00',
      owner_email: propertyData.owner_email || user?.email || 'proprietaire@izivilla.sn',
      is_verified: false, // Verification MUST be manually validated by Admin
      contact_phone: propertyData.owner_phone || user?.phone || '+221 77 000 00 00',
      contact_whatsapp: propertyData.owner_phone || user?.phone || '+221 77 000 00 00',
      created_at: new Date().toISOString(),
      images: propertyData.images && propertyData.images.length > 0 
        ? propertyData.images 
        : [{ image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', is_primary: true }]
    };

    this.customProperties.unshift(newProp);

    return this.http.post<any>(`${this.apiUrl}/properties`, propertyData).pipe(
      catchError(() => of({ success: true, message: 'Votre bien a été publié. La vérification du profil sera effectuée par l\'Admin Izivilla.', property: newProp }))
    );
  }

  getAgencies(): Observable<Agency[]> {
    return this.http.get<Agency[]>(`${this.apiUrl}/agencies`).pipe(
      catchError(() => of(this.getMockAgencies()))
    );
  }

  getAgencyById(id: number): Observable<Agency> {
    return this.http.get<Agency>(`${this.apiUrl}/agencies/${id}`).pipe(
      catchError(() => of(this.getMockAgencies()[0]))
    );
  }

  // Messaging & Inquiries
  sendDirectMessage(messageData: Partial<DirectMessage>): Observable<any> {
    const newMsg: DirectMessage = {
      id: Date.now(),
      property_id: messageData.property_id || 1,
      sender_name: messageData.sender_name || 'Visiteur Izivilla',
      sender_email: messageData.sender_email || '',
      sender_phone: messageData.sender_phone || '',
      receiver_name: messageData.receiver_name || 'Annonceur',
      message: messageData.message || '',
      created_at: new Date().toISOString(),
      property_title: messageData.property_title || 'Bien Izivilla'
    };
    this.localMessages.unshift(newMsg);

    return this.http.post<any>(`${this.apiUrl}/messages`, messageData).pipe(
      catchError(() => of({ success: true, message: 'Votre message a été transmis directement à l\'annonceur !', data: newMsg }))
    );
  }

  getMessages(): Observable<DirectMessage[]> {
    return of(this.localMessages);
  }

  // Listing Reports
  submitReport(reportData: Partial<PropertyReport>): Observable<any> {
    const newReport: PropertyReport = {
      id: Date.now(),
      property_id: reportData.property_id || 1,
      reporter_name: reportData.reporter_name || 'Utilisateur Izivilla',
      reporter_email: reportData.reporter_email || '',
      reason: reportData.reason || 'Autre',
      description: reportData.description || '',
      status: 'pending',
      created_at: new Date().toISOString()
    };
    this.localReports.unshift(newReport);

    return this.http.post<any>(`${this.apiUrl}/reports`, reportData).pipe(
      catchError(() => of({ success: true, message: 'Le signalement a bien été transmis à nos modérateurs. Merci !' }))
    );
  }

  getReports(): Observable<PropertyReport[]> {
    return of(this.localReports);
  }

  // Verifications Requests (Owner / Agency)
  submitVerificationRequest(reqData: any): Observable<any> {
    const newReq: VerificationRequest = {
      id: Date.now(),
      user_name: reqData.user_name || reqData.owner_name || 'Annonceur',
      user_email: reqData.user_email || 'annonceur@izivilla.sn',
      user_phone: reqData.user_phone || '+221 77 000 00 00',
      user_type: reqData.user_type || reqData.owner_type || 'owner',
      owner_type: reqData.owner_type || reqData.user_type || 'owner',
      owner_name: reqData.owner_name || reqData.user_name || 'Annonceur',
      document_type: reqData.document_type || 'Pièce d\'identité (CNI / NINEA)',
      document_number: reqData.document_number || 'CNI-001',
      document_url: reqData.document_url || 'https://example.com/justificatif.pdf',
      status: 'pending',
      submitted_at: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };
    this.localVerifications.unshift(newReq);

    return of({ success: true, message: 'Votre dossier de vérification a été transmis à l\'Admin Izivilla. Il sera contrôlé sous 24h.' });
  }

  getVerifications(): Observable<VerificationRequest[]> {
    return of(this.localVerifications);
  }

  getVerificationRequests(): Observable<VerificationRequest[]> {
    return of(this.localVerifications);
  }

  approveVerification(id: number): Observable<any> {
    const item = this.localVerifications.find(v => v.id === id);
    if (item) {
      item.status = 'approved';
      // Mark all matching advertiser properties as verified
      this.getAllPropertiesCombined().forEach(p => {
        if (p.owner_name?.toLowerCase() === item.owner_name?.toLowerCase() || p.owner_name?.toLowerCase() === item.user_name?.toLowerCase()) {
          p.is_verified = true;
        }
      });
    }
    return of({ success: true, message: 'Annonceur validé et certifié avec le badge d\'authenticité par l\'Admin Izivilla !' });
  }

  rejectVerification(id: number): Observable<any> {
    const item = this.localVerifications.find(v => v.id === id);
    if (item) {
      item.status = 'rejected';
    }
    return of({ success: true, message: 'Demande de vérification refusée par l\'Admin.' });
  }

  submitAppointment(data: any): Observable<any> {
    const prop = this.getAllPropertiesCombined().find(p => p.id === data.property_id);
    const newAppointment = {
      id: Date.now(),
      ...data,
      status: 'pending',
      created_at: new Date().toISOString(),
      property: prop || this.getMockProperties()[0]
    };
    this.localAppointments.unshift(newAppointment);

    return this.http.post<any>(`${this.apiUrl}/appointments`, data).pipe(
      catchError(() => of({ message: 'Demande de visite enregistrée avec succès !', appointment: newAppointment }))
    );
  }

  checkoutBoost(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/boosts/checkout`, data).pipe(
      catchError(() => of({
        success: true,
        message: `Paiement ${data.payment_method} effectué avec succès ! Votre annonce est boostée sur Izivilla pour ${data.duration_days} jours.`,
        transaction_reference: `IZI-${data.payment_method.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`
      }))
    );
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/properties/stats`).pipe(
      catchError(() => of({
        total_listings: 124,
        active_agencies: 18,
        verified_owners: 42,
        boosted_listings: 14,
        total_views: 18450,
        city_breakdown: { Dakar: 82, Saly: 24, Thiès: 10, 'Saint-Louis': 8 }
      }))
    );
  }

  getTenantAppointments(email: string): Observable<any[]> {
    return of(this.localAppointments);
  }

  createAlert(data: any): Observable<any> {
    const newAlert = {
      id: Date.now(),
      ...data,
      is_active: true,
      created_at: new Date().toISOString()
    };
    this.localAlerts.unshift(newAlert);

    return of({
      message: 'Alerte email créée avec succès sur Izivilla !',
      alert: newAlert
    });
  }

  getAlertsByEmail(email: string): Observable<any[]> {
    return of(this.localAlerts);
  }

  deleteAlert(id: number): Observable<any> {
    this.localAlerts = this.localAlerts.filter(a => a.id !== id);
    return of({ message: 'Alerte supprimée avec succès.' });
  }

  toggleFavorite(propertyId: number): void {
    const current = this.favorites$.getValue();
    if (current.includes(propertyId)) {
      this.favorites$.next(current.filter(id => id !== propertyId));
    } else {
      this.favorites$.next([...current, propertyId]);
    }
  }

  isFavorite(propertyId: number): boolean {
    return this.favorites$.getValue().includes(propertyId);
  }

  public getAllPropertiesCombined(): Property[] {
    return [...this.customProperties, ...this.getMockProperties()];
  }

  // Real Senegalese Property Mock Dataset fully mapped for IZIVILLA core value
  private getMockProperties(): Property[] {
    return [
      {
        id: 1,
        title: 'Villa Contemporaine 5 Chambres avec Piscine aux Almadies',
        slug: 'villa-contemporaine-5-chambres-piscine-almadies',
        description: 'Magnifique villa contemporaine située au cœur des Almadies. Comprend 5 grandes chambres autonomes, grand séjour baigné de lumière, cuisine équipée moderne, jardin avec piscine privée, garage 2 voitures et poste de garde 24h/24. Annonce directe de particulier à particulier.',
        property_type: 'Villa',
        transaction_type: 'sale',
        price_fcfa: 350000000,
        charges_included: true,
        region: 'Dakar',
        city: 'Dakar',
        quartier: 'Almadies',
        address: 'Rue des Ambassades, Almadies',
        bedrooms: 5,
        bathrooms: 4,
        surface_sqm: 450,
        is_furnished: true,
        has_air_con: true,
        has_generator: true,
        has_security: true,
        has_parking: true,
        has_pool: true,
        equipments: ['Piscine', 'Groupe Électrogène', 'Caméras Sécurité', 'Bassin d\'eau', 'Smart Home'],
        latitude: 14.7454,
        longitude: -17.5194,
        status: 'available',
        is_featured: true,
        is_boosted: true,
        views_count: 1420,
        
        // Direct Owner Advertiser
        owner_type: 'Propriétaire',
        owner_name: 'Amadou Sow',
        owner_phone: '+221 77 645 12 34',
        owner_email: 'amadou.sow@izivilla.sn',
        owner_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        is_verified: true,

        contact_phone: '+221 77 645 12 34',
        contact_whatsapp: '+221 77 645 12 34',
        created_at: '2026-09-01',
        images: [
          { image_url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80', is_primary: true },
          { image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', is_primary: false },
          { image_url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80', is_primary: false }
        ]
      },
      {
        id: 2,
        title: 'Appartement Haut Standing F4 avec Balcon Vue Mer à Mermoz',
        slug: 'appartement-haut-standing-f4-vue-mer-mermoz',
        description: 'Superbe appartement F4 neuf dans un immeuble récent avec ascenseur à Mermoz VDN. Salon spacieux, 3 chambres climatisées avec dressing, balcon panoramique, cuisine américaine.',
        property_type: 'Appartement',
        transaction_type: 'rent',
        price_fcfa: 750000,
        charges_included: true,
        region: 'Dakar',
        city: 'Dakar',
        quartier: 'Mermoz',
        address: 'Avenue Cheikh Anta Diop, Mermoz',
        bedrooms: 3,
        bathrooms: 3,
        surface_sqm: 165,
        is_furnished: false,
        has_air_con: true,
        has_generator: true,
        has_security: true,
        has_parking: true,
        has_pool: false,
        equipments: ['Ascenseur', 'Surveillance 24h/7d', 'Parking Sous-sol', 'Groupe Réserve'],
        latitude: 14.7081,
        longitude: -17.4697,
        status: 'available',
        is_featured: true,
        is_boosted: true,
        views_count: 980,

        // Direct Agency Advertiser
        owner_type: 'Agence',
        owner_name: 'Immo Conseil Sénégal',
        owner_phone: '+221 33 869 40 40',
        owner_email: 'contact@immoconseil.sn',
        owner_avatar: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&q=80',
        is_verified: true,

        contact_phone: '+221 33 869 40 40',
        contact_whatsapp: '+221 78 120 45 67',
        created_at: '2026-09-03',
        agency: {
          id: 1,
          name: 'Immo Conseil Sénégal',
          slug: 'immo-conseil-senegal',
          logo_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&q=80',
          phone_whatsapp: '+221 78 120 45 67',
          email: 'contact@immoconseil.sn',
          city: 'Dakar',
          address: 'Immeuble VDN 2, Mermoz',
          description: 'Agence immobilière certifiée spécialisée dans les biens résidentiels d\'exception à Dakar.',
          is_verified: true,
          active_listings_count: 14
        },
        images: [
          { image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', is_primary: true },
          { image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', is_primary: false }
        ]
      },
      {
        id: 3,
        title: 'Studio Cosy Meublé avec Wi-Fi & Smart TV à Sacré-Cœur 3',
        slug: 'studio-cosy-meuble-sacre-coeur-3',
        description: 'Studio indépendant moderne et parfaitement équipé à Sacré-Cœur 3. Idéal pour professionnels ou séjours courts. Wi-Fi haut débit, ménage inclus 2x/semaine.',
        property_type: 'Studio',
        transaction_type: 'rent',
        price_fcfa: 280000,
        charges_included: true,
        region: 'Dakar',
        city: 'Dakar',
        quartier: 'Sacré-Cœur',
        bedrooms: 1,
        bathrooms: 1,
        surface_sqm: 42,
        is_furnished: true,
        has_air_con: true,
        has_generator: true,
        has_security: true,
        has_parking: false,
        has_pool: false,
        equipments: ['Wi-Fi inclus', 'Canal+', 'Micro-ondes', 'Refrigérateur'],
        latitude: 14.7180,
        longitude: -17.4720,
        status: 'available',
        is_featured: false,
        is_boosted: false,
        views_count: 640,

        // Direct Owner Advertiser
        owner_type: 'Propriétaire',
        owner_name: 'Fatou Kiné Ba',
        owner_phone: '+221 77 312 88 99',
        owner_email: 'fatoukine.ba@izivilla.sn',
        owner_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        is_verified: true,

        contact_phone: '+221 77 312 88 99',
        contact_whatsapp: '+221 77 312 88 99',
        created_at: '2026-09-04',
        images: [
          { image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', is_primary: true },
          { image_url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80', is_primary: false }
        ]
      },
      {
        id: 4,
        title: 'Terrain Viabilisé Pieds dans l\'Eau de 600m² à Saly Portudal',
        slug: 'terrain-viabilise-600m2-saly-portudal',
        description: 'Magnifique parcelle de terrain à bâtir avec titre foncier individuel. Emplacement exceptionnel proche mer à Saly Portudal. Eau, électricité et accès goudronné immédiats.',
        property_type: 'Terrain',
        transaction_type: 'sale',
        price_fcfa: 65000000,
        charges_included: false,
        region: 'Thiès',
        city: 'Saly',
        quartier: 'Saly Portudal',
        bedrooms: 0,
        bathrooms: 0,
        surface_sqm: 600,
        is_furnished: false,
        has_air_con: false,
        has_generator: false,
        has_security: false,
        has_parking: false,
        has_pool: false,
        equipments: ['Titre Foncier', 'Eau Onas', 'Senelec', 'Vue Mer'],
        latitude: 14.4447,
        longitude: -17.0094,
        status: 'available',
        is_featured: true,
        is_boosted: true,
        views_count: 2100,

        // Direct Owner Advertiser
        owner_type: 'Propriétaire',
        owner_name: 'Babacar Ndiaye',
        owner_phone: '+221 70 888 77 66',
        owner_email: 'babacar.ndiaye@izivilla.sn',
        owner_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        is_verified: true,

        contact_phone: '+221 70 888 77 66',
        contact_whatsapp: '+221 70 888 77 66',
        created_at: '2026-09-02',
        images: [
          { image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', is_primary: true }
        ]
      },
      {
        id: 5,
        title: 'Plateau de Bureaux Modernes 250m² sur l\'Avenue VDN',
        slug: 'plateau-de-bureaux-modernes-250m2-vdn',
        description: 'Espace commercial et bureaux aménagés au 3ème étage d\'un immeuble d\'affaires très prisé sur la VDN. Fibre optique, climatisation centrale, parking privé.',
        property_type: 'Bureau',
        transaction_type: 'rent',
        price_fcfa: 1800000,
        charges_included: true,
        region: 'Dakar',
        city: 'Dakar',
        quartier: 'Ouakam',
        address: 'Avenue VDN, face Cité Keur Gorgui',
        bedrooms: 0,
        bathrooms: 2,
        surface_sqm: 250,
        is_furnished: false,
        has_air_con: true,
        has_generator: true,
        has_security: true,
        has_parking: true,
        has_pool: false,
        equipments: ['Fibre Optique', 'Groupes 250kVA', 'Gardiennage 24/7', 'Cafétéria'],
        latitude: 14.7230,
        longitude: -17.4750,
        status: 'available',
        is_featured: false,
        is_boosted: false,
        views_count: 530,

        // Direct Agency Advertiser
        owner_type: 'Agence',
        owner_name: 'Dakar Prestige Immobilier',
        owner_phone: '+221 77 845 12 34',
        owner_email: 'contact@dakarprestige.sn',
        owner_avatar: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&q=80',
        is_verified: true,

        contact_phone: '+221 77 845 12 34',
        contact_whatsapp: '+221 77 845 12 34',
        created_at: '2026-09-06',
        agency: {
          id: 2,
          name: 'Dakar Prestige Immobilier',
          slug: 'dakar-prestige-immobilier',
          logo_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&q=80',
          phone_whatsapp: '+221 77 845 12 34',
          email: 'contact@dakarprestige.sn',
          city: 'Dakar',
          address: 'Route des Almadies, Dakar',
          description: 'Le spécialiste de l\'immobilier d\'entreprise et de prestige à Dakar.',
          is_verified: true,
          active_listings_count: 18
        },
        images: [
          { image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', is_primary: true }
        ]
      },
      {
        id: 6,
        title: 'Grande Maison Familiale 6 Pièces à Parcelles Assainies',
        slug: 'grande-maison-familiale-6-pieces-parcelles-assainies',
        description: 'Jolie maison individuelle R+1 bien située aux Parcelles Assainies Unité 15. Proche commodités et transports. Idéal grande famille.',
        property_type: 'Maison',
        transaction_type: 'sale',
        price_fcfa: 78000000,
        charges_included: false,
        region: 'Dakar',
        city: 'Dakar',
        quartier: 'Parcelles Assainies',
        bedrooms: 4,
        bathrooms: 3,
        surface_sqm: 200,
        is_furnished: false,
        has_air_con: false,
        has_generator: false,
        has_security: true,
        has_parking: true,
        has_pool: false,
        equipments: ['Bâche à eau', 'Cour intérieure', 'Garage fermant'],
        latitude: 14.7550,
        longitude: -17.4350,
        status: 'available',
        is_featured: false,
        is_boosted: false,
        views_count: 410,

        // Direct Owner Advertiser
        owner_type: 'Propriétaire',
        owner_name: 'Ousmane Fall',
        owner_phone: '+221 76 500 11 22',
        owner_email: 'ousmane.fall@izivilla.sn',
        owner_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
        is_verified: true,

        contact_phone: '+221 76 500 11 22',
        contact_whatsapp: '+221 76 500 11 22',
        created_at: '2026-09-05',
        images: [
          { image_url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80', is_primary: true }
        ]
      }
    ];
  }

  private getMockAgencies(): Agency[] {
    return [
      {
        id: 1,
        name: 'Immo Conseil Sénégal',
        slug: 'immo-conseil-senegal',
        logo_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&q=80',
        phone_whatsapp: '+221 78 120 45 67',
        email: 'contact@immoconseil.sn',
        city: 'Dakar',
        address: 'Immeuble VDN 2, Mermoz, Dakar',
        description: 'Agence immobilière certifiée spécialisée dans la vente, location et gestion locative directe.',
        website: 'https://immoconseil.sn',
        creation_year: 2018,
        is_verified: true,
        active_listings_count: 14,
        subscription_tier: 'Pro'
      },
      {
        id: 2,
        name: 'Dakar Prestige Immobilier',
        slug: 'dakar-prestige-immobilier',
        logo_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=200&q=80',
        phone_whatsapp: '+221 77 845 12 34',
        email: 'contact@dakarprestige.sn',
        city: 'Dakar',
        address: 'Route des Almadies, Dakar',
        description: 'Spécialiste de la location résidentielle de luxe et de terrains d\'investissement.',
        website: 'https://dakarprestige.sn',
        creation_year: 2015,
        is_verified: true,
        active_listings_count: 18,
        subscription_tier: 'Enterprise'
      }
    ];
  }
}

