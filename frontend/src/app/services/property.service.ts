import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of, Subject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Property, PropertyFilter, Agency, DirectMessage, PropertyReport, VerificationRequest, PropertyRequest, AppNotification } from '../models/property.model';

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

  // Izivilla Phase 1 Automations - Notifications & Property Requests
  public notifications$ = new BehaviorSubject<AppNotification[]>([
    {
      id: 1,
      recipient_email: 'amadou.sow@izivilla.sn',
      title: '🔔 Nouvelle demande sur votre annonce',
      message: "Appartement 3 chambres – Rufisque\nClient : Abdou Diop\n« Je souhaite visiter le bien. »",
      type: 'NEW_REQUEST',
      link: '/espace-proprietaire',
      is_read: false,
      created_at: new Date().toISOString()
    }
  ]);
  public unreadNotificationsCount$ = new BehaviorSubject<number>(1);
  private localPropertyRequests: PropertyRequest[] = [
    {
      id: 1,
      property_id: 1,
      client_name: 'Abdou Diop',
      client_email: 'abdou.diop@client.sn',
      client_phone: '+221 77 654 32 10',
      advertiser_email: 'amadou.sow@izivilla.sn',
      message: 'Je souhaite visiter le bien ce samedi si possible.',
      status: 'NOUVEAU',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      property: {
        id: 1,
        title: 'Appartement 3 chambres – Rufisque',
        quartier: 'Rufisque',
        city: 'Dakar',
        price_fcfa: 250000,
        property_type: 'Appartement',
        transaction_type: 'rent',
        description: 'Appartement lumineux avec balcon',
        charges_included: true,
        bedrooms: 3,
        bathrooms: 2,
        is_furnished: true,
        owner_name: 'Amadou Sow',
        owner_phone: '+221 77 645 12 34',
        owner_email: 'amadou.sow@izivilla.sn'
      }
    },
    {
      id: 2,
      property_id: 2,
      client_name: 'Fatou Ndiaye',
      client_email: 'fatou.ndiaye@client.sn',
      client_phone: '+221 78 123 45 67',
      advertiser_email: 'amadou.sow@izivilla.sn',
      message: 'Bonjour, le bien est-il toujours disponible pour une entrée immédiate ?',
      status: 'CONTACTÉ',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      property: {
        id: 2,
        title: 'Villa Contemporaine 5 Chambres avec Piscine',
        quartier: 'Almadies',
        city: 'Dakar',
        price_fcfa: 1500000,
        property_type: 'Villa',
        transaction_type: 'rent',
        description: 'Superbe villa avec piscine',
        bedrooms: 5,
        bathrooms: 4,
        is_furnished: true,
        owner_name: 'Amadou Sow',
        owner_phone: '+221 77 645 12 34',
        owner_email: 'amadou.sow@izivilla.sn'
      }
    },
    {
      id: 3,
      property_id: 1,
      client_name: 'Mamadou Kane',
      client_email: 'mamadou.kane@prospect.sn',
      client_phone: '+221 77 444 88 99',
      advertiser_email: 'amadou.sow@izivilla.sn',
      message: 'Bonjour, j\'ai consulté l\'annonce et je suis très intéressé par la localisation.',
      status: 'INTÉRESSÉ',
      created_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
      inactive_days: 6,
      is_inactive: true,
      property: {
        id: 1,
        title: 'Appartement 3 chambres – Rufisque',
        quartier: 'Rufisque',
        city: 'Dakar',
        price_fcfa: 250000,
        property_type: 'Appartement',
        transaction_type: 'rent',
        owner_name: 'Amadou Sow',
        owner_phone: '+221 77 645 12 34',
        owner_email: 'amadou.sow@izivilla.sn'
      }
    },
    {
      id: 4,
      property_id: 3,
      client_name: 'Awa Faye',
      client_email: 'awa.faye@email.sn',
      client_phone: '+221 76 999 11 22',
      advertiser_email: 'amadou.sow@izivilla.sn',
      message: 'Rendez-vous de visite sollicité pour le penthouse aux Almadies.',
      status: 'VISITE',
      created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      property: {
        id: 3,
        title: 'Penthouse Vue Mer Panoramique aux Almadies',
        quartier: 'Almadies',
        city: 'Dakar',
        price_fcfa: 1200000,
        property_type: 'Appartement',
        transaction_type: 'rent',
        owner_name: 'Amadou Sow',
        owner_phone: '+221 77 645 12 34',
        owner_email: 'amadou.sow@izivilla.sn'
      }
    },
    {
      id: 5,
      property_id: 2,
      client_name: 'Ousmane Cissé',
      client_email: 'ousmane.cisse@prospect.sn',
      client_phone: '+221 78 555 33 22',
      advertiser_email: 'amadou.sow@izivilla.sn',
      message: 'Proposition tarifaire transmise par le client après visite.',
      status: 'NÉGOCIATION',
      created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
      inactive_days: 8,
      is_inactive: true,
      property: {
        id: 2,
        title: 'Villa Contemporaine 5 Chambres avec Piscine',
        quartier: 'Almadies',
        city: 'Dakar',
        price_fcfa: 1500000,
        property_type: 'Villa',
        transaction_type: 'rent',
        owner_name: 'Amadou Sow',
        owner_phone: '+221 77 645 12 34',
        owner_email: 'amadou.sow@izivilla.sn'
      }
    },
    {
      id: 6,
      property_id: 1,
      client_name: 'Seydou Ba',
      client_email: 'seydou.ba@client.sn',
      client_phone: '+221 77 222 33 44',
      advertiser_email: 'amadou.sow@izivilla.sn',
      message: 'Bail signé et caution versée.',
      status: 'CONCLU',
      created_at: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      property: {
        id: 1,
        title: 'Appartement 3 chambres – Rufisque',
        quartier: 'Rufisque',
        city: 'Dakar',
        price_fcfa: 250000,
        property_type: 'Appartement',
        transaction_type: 'rent',
        owner_name: 'Amadou Sow',
        owner_phone: '+221 77 645 12 34',
        owner_email: 'amadou.sow@izivilla.sn'
      }
    }
  ];



  private localAppointments: any[] = [
    {
      id: 1,
      property_id: 1,
      tenant_name: 'Abdou Diop',
      tenant_email: 'abdou.diop@client.sn',
      tenant_phone: '+221 77 654 32 10',
      advertiser_email: 'amadou.sow@izivilla.sn',
      preferred_date: '2026-09-15T15:00:00',
      message: 'Je souhaite visiter ce bien ce samedi à 15h00.',
      status: 'confirmed',
      reminder_24h_sent: false,
      reminder_2h_sent: false,
      created_at: new Date().toISOString(),
      property: {
        id: 1,
        title: 'Villa Contemporaine 5 Chambres avec Piscine aux Almadies',
        quartier: 'Almadies',
        city: 'Dakar',
        price_fcfa: 350000000,
        property_type: 'Villa',
        transaction_type: 'sale',
        owner_name: 'Amadou Sow',
        owner_phone: '+221 77 645 12 34',
        owner_email: 'amadou.sow@izivilla.sn',
        images: [{ image_url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80', is_primary: true }]
      }
    },
    {
      id: 2,
      property_id: 2,
      tenant_name: 'Fatou Ndiaye',
      tenant_email: 'fatou.ndiaye@client.sn',
      tenant_phone: '+221 78 123 45 67',
      advertiser_email: 'amadou.sow@izivilla.sn',
      preferred_date: '2026-09-16T10:00:00',
      message: 'Visite souhaitée dans la matinée.',
      status: 'pending',
      reminder_24h_sent: false,
      reminder_2h_sent: false,
      created_at: new Date().toISOString(),
      property: {
        id: 2,
        title: 'Appartement Haut Standing F4 avec Balcon Vue Mer à Mermoz',
        quartier: 'Mermoz',
        city: 'Dakar',
        price_fcfa: 750000,
        property_type: 'Appartement',
        transaction_type: 'rent',
        owner_name: 'Immo Conseil Sénégal',
        owner_phone: '+221 33 869 40 40',
        owner_email: 'contact@immoconseil.sn',
        images: [{ image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', is_primary: true }]
      }
    }
  ];
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

  private demoAccounts: { [email: string]: UserSession & { password?: string } } = {
    'amadou.sow@izivilla.sn': { name: 'Amadou Sow', email: 'amadou.sow@izivilla.sn', phone: '+221 77 645 12 34', role: 'owner' },
    'contact@immoconseil.sn': { name: 'Immo Conseil Senegal', email: 'contact@immoconseil.sn', phone: '+221 33 821 00 00', role: 'agency' },
    'abdou.diop@client.sn': { name: 'Abdou Diop', email: 'abdou.diop@client.sn', phone: '+221 77 654 32 10', role: 'tenant' },
    'moussa@gmail.com': { name: 'Moussa Diallo', email: 'moussa@gmail.com', phone: '+221 77 123 45 67', role: 'tenant' },
    'admin@izivilla.sn': { name: 'Super Admin Izivilla', email: 'admin@izivilla.sn', role: 'admin' },
    'admin': { name: 'Super Admin Izivilla', email: 'admin@izivilla.sn', role: 'admin' }
  };

  loginUser(email: string, pass: string, selectedRole: 'tenant' | 'owner' | 'agency' | 'admin'): { success: boolean; message: string } {
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPass = (pass || '').trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, message: 'Veuillez renseigner votre identifiant et votre mot de passe.' };
    }

    // 1. Admin login check
    if (cleanEmail === 'admin@izivilla.sn' || cleanEmail === 'admin' || selectedRole === 'admin') {
      if (cleanPass !== 'admin123' && cleanPass !== 'admin') {
        return { success: false, message: 'Mot de passe Administrateur incorrect. (Démo: admin123)' };
      }
      const adminSession: UserSession = {
        name: 'Super Admin Izivilla',
        email: 'admin@izivilla.sn',
        role: 'admin'
      };
      this.saveUserSession(adminSession);
      return { success: true, message: 'Connexion réussie en tant qu\'Administrateur !' };
    }

    // 2. Check registered user in localStorage
    const registeredKey = 'izivilla_reg_' + cleanEmail;
    const registeredData = localStorage.getItem(registeredKey);

    if (registeredData) {
      try {
        const parsed = JSON.parse(registeredData);
        if (parsed.password && parsed.password !== cleanPass) {
          return { success: false, message: 'Mot de passe incorrect.' };
        }
        const session: UserSession = {
          name: parsed.name,
          email: parsed.email,
          phone: parsed.phone,
          role: parsed.role || selectedRole
        };
        this.saveUserSession(session);
        return { success: true, message: `Connexion réussie !` };
      } catch {
        return { success: false, message: 'Erreur lors de la lecture du compte enregistré.' };
      }
    }

    // 3. Check demo accounts
    if (this.demoAccounts[cleanEmail]) {
      const demo = this.demoAccounts[cleanEmail];
      const session: UserSession = {
        name: demo.name,
        email: demo.email,
        phone: demo.phone,
        role: demo.role
      };
      this.saveUserSession(session);
      return { success: true, message: `Connexion réussie en tant que ${demo.role} !` };
    }

    // 4. Account not found
    return { success: false, message: 'Compte introuvable ou identifiants incorrects. Veuillez vérifier votre adresse email ou créer un nouveau compte.' };
  }

  private saveUserSession(session: UserSession): void {
    localStorage.setItem('izivilla_logged_in', 'true');
    localStorage.setItem('izivilla_user', JSON.stringify(session));

    this.currentRole$.next(session.role);
    this.currentUser$.next(session);
    this.isLoggedIn$.next(true);
  }

  public loginWithUserSession(session: UserSession): void {
    this.saveUserSession(session);
  }

  registerUser(name: string, email: string, phone: string, pass: string, role: 'tenant' | 'owner' | 'agency'): { success: boolean; message: string } {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail) {
      return { success: false, message: 'Veuillez saisir une adresse email valide.' };
    }

    const userData = {
      name: name || 'Nouvel Utilisateur',
      email: cleanEmail,
      phone: phone,
      password: pass,
      role: role
    };

    localStorage.setItem('izivilla_reg_' + cleanEmail, JSON.stringify(userData));
    return { success: true, message: `Compte ${role} créé avec succès ! Vous pouvez maintenant vous connecter.` };
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
    return this.http.get<any>(`${this.apiUrl}/properties/${id}`).pipe(
      map(res => {
        if (res && res.id) return res;
        if (res && res.property && res.property.id) return res.property;
        if (res && res.data && res.data.id) return res.data;
        const all = this.getAllPropertiesCombined();
        return all.find(p => p.id === Number(id)) || all[0];
      }),
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

    // Generate automated matching alert notifications (Étape E)
    this.localAlerts.forEach(alert => {
      const alertNotif: AppNotification = {
        id: Date.now(),
        recipient_email: alert.user_email || 'moussa@gmail.com',
        title: '🔔 Nouvelle alerte bien publié',
        message: `Un nouveau bien correspondant à vos critères ("${newProp.city} - ${newProp.property_type}") vient d'être publié : "${newProp.title}".`,
        type: 'MATCHING_ALERT',
        link: `/annonces/${newProp.id}`,
        is_read: false,
        created_at: new Date().toISOString()
      };
      const current = this.notifications$.getValue();
      this.notifications$.next([alertNotif, ...current]);
    });
    this.unreadNotificationsCount$.next(this.notifications$.getValue().filter(n => !n.is_read).length);

    return this.http.post<any>(`${this.apiUrl}/properties`, propertyData).pipe(
      catchError(() => of({ success: true, message: 'Votre bien a été publié. La vérification du profil sera effectuée par l\'Admin Izivilla.', property: newProp }))
    );
  }

  updatePropertyStatus(id: number, status: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/properties/${id}/status`, { status }).pipe(
      tap(() => {
        const all = this.getAllPropertiesCombined();
        const prop = all.find(p => p.id === id);
        if (prop) {
          prop.status = status;
        }
      }),
      catchError(() => {
        const all = this.getAllPropertiesCombined();
        const prop = all.find(p => p.id === id);
        if (prop) {
          prop.status = status;
        }
        return of({ message: 'Statut du bien mis à jour avec succès' });
      })
    );
  }

  renewProperty(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/properties/${id}/renew`, {}).pipe(
      tap(() => this.applyLocalPropertyRenew(id)),
      catchError(() => {
        this.applyLocalPropertyRenew(id);
        return of({ message: 'Annonce renouvelée avec succès pour 60 jours supplémentaires !' });
      })
    );
  }

  confirmPropertyAvailability(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/properties/${id}/confirm-availability`, {}).pipe(
      tap(() => this.applyLocalPropertyConfirm(id)),
      catchError(() => {
        this.applyLocalPropertyConfirm(id);
        return of({ message: 'Disponibilité du bien confirmée avec succès !' });
      })
    );
  }

  triggerPropertyExpirationCheck(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/properties/check-expirations`, {}).pipe(
      tap(() => this.applyLocalPropertyExpirationCheck()),
      catchError(() => {
        const count = this.applyLocalPropertyExpirationCheck();
        return of({ message: `Contrôle d'expiration exécuté avec succès. ${count} notification(s) générée(s).` });
      })
    );
  }

  private applyLocalPropertyRenew(id: number): void {
    const all = this.getAllPropertiesCombined();
    const prop = all.find(p => p.id === id);
    if (prop) {
      const future60 = new Date();
      future60.setDate(future60.getDate() + 60);
      prop.expires_at = future60.toISOString();
      prop.last_confirmed_at = new Date().toISOString();
      prop.status = 'available';
      prop.is_expiration_warning_sent = false;
      prop.is_inactivity_warning_sent = false;
    }
  }

  private applyLocalPropertyConfirm(id: number): void {
    const all = this.getAllPropertiesCombined();
    const prop = all.find(p => p.id === id);
    if (prop) {
      prop.last_confirmed_at = new Date().toISOString();
      prop.is_inactivity_warning_sent = false;
      if (prop.status === 'expired') {
        prop.status = 'available';
      }
    }
  }

  private applyLocalPropertyExpirationCheck(): number {
    let count = 0;
    const all = this.getAllPropertiesCombined();
    const now = new Date();

    all.forEach(prop => {
      // 1. Check expiration date (if expired or within 7 days)
      const expDate = prop.expires_at ? new Date(prop.expires_at) : null;
      const advertiserEmail = prop.owner_email || prop.agency?.email || 'amadou.sow@izivilla.sn';

      if (expDate && expDate <= now && prop.status !== 'expired') {
        prop.status = 'expired';
        count++;
        const expNotif: AppNotification = {
          id: Date.now() + count,
          recipient_email: advertiserEmail,
          title: '⚠️ Votre annonce a expiré',
          message: `Votre annonce "${prop.title}" a atteint sa date d'expiration. Elle n'est plus visible dans les recherches publiques. Cliquez pour la renouveler.`,
          type: 'PROPERTY_EXPIRATION',
          link: '/espace-proprietaire?tab=properties',
          is_read: false,
          created_at: new Date().toISOString()
        };
        const currentNotifs = this.notifications$.getValue();
        this.notifications$.next([expNotif, ...currentNotifs]);
      } else if (expDate && !prop.is_expiration_warning_sent) {
        const daysLeft = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        if (daysLeft <= 7 && daysLeft > 0) {
          prop.is_expiration_warning_sent = true;
          count++;
          const warningNotif: AppNotification = {
            id: Date.now() + count,
            recipient_email: advertiserEmail,
            title: '⚠️ Votre annonce arrive bientôt à expiration',
            message: `Attention : Votre annonce "${prop.title}" expire dans ${daysLeft} jour(s). Pensez à la renouveler pour conserver sa visibilité.`,
            type: 'PROPERTY_EXPIRATION',
            link: '/espace-proprietaire?tab=properties',
            is_read: false,
            created_at: new Date().toISOString()
          };
          const currentNotifs = this.notifications$.getValue();
          this.notifications$.next([warningNotif, ...currentNotifs]);
        }
      }

      // 2. Check 30-day inactivity
      const lastConfirm = prop.last_confirmed_at ? new Date(prop.last_confirmed_at) : (prop.created_at ? new Date(prop.created_at) : new Date(now.getTime() - 86400000 * 32));
      const daysInactive = Math.floor((now.getTime() - lastConfirm.getTime()) / (1000 * 3600 * 24));

      if (daysInactive >= 30 && !prop.is_inactivity_warning_sent && prop.status === 'available') {
        prop.is_inactivity_warning_sent = true;
        count++;
        const inactivityNotif: AppNotification = {
          id: Date.now() + count,
          recipient_email: advertiserEmail,
          title: '🔔 Votre annonce est en ligne depuis 30 jours',
          message: `Bonjour, votre bien "${prop.title}" est-il toujours disponible ?\n\nConfirmez la disponibilité ou mettez à jour son statut en Vendu/Loué.`,
          type: 'PROPERTY_STATUS',
          link: '/espace-proprietaire?tab=properties',
          is_read: false,
          created_at: new Date().toISOString()
        };
        const currentNotifs = this.notifications$.getValue();
        this.notifications$.next([inactivityNotif, ...currentNotifs]);
      }
    });

    this.unreadNotificationsCount$.next(this.notifications$.getValue().filter(n => !n.is_read).length);
    return count;
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
    const advertiserEmail = prop?.owner_email || prop?.agency?.email || 'amadou.sow@izivilla.sn';

    const newAppointment = {
      id: Date.now(),
      property_id: data.property_id,
      tenant_name: data.tenant_name,
      tenant_email: data.tenant_email,
      tenant_phone: data.tenant_phone,
      advertiser_email: advertiserEmail,
      preferred_date: data.preferred_date,
      message: data.message || '',
      status: 'pending',
      reminder_24h_sent: false,
      reminder_2h_sent: false,
      created_at: new Date().toISOString(),
      property: prop || this.getMockProperties()[0]
    };
    this.localAppointments.unshift(newAppointment);

    // Create notifications in local stream
    const advertiserNotif: AppNotification = {
      id: Date.now(),
      recipient_email: advertiserEmail,
      title: '📅 Demande de visite reçue',
      message: `Demande de visite sur "${prop?.title || 'Votre annonce'}"\nClient : ${data.tenant_name} (${data.tenant_phone})\nDate souhaitée : ${new Date(data.preferred_date).toLocaleString('fr-FR')}\n« ${data.message || 'Souhaite effectuer une visite.'} »`,
      type: 'VISIT_REQUEST',
      link: '/espace-proprietaire?tab=appointments',
      is_read: false,
      created_at: new Date().toISOString()
    };

    const clientNotif: AppNotification = {
      id: Date.now() + 1,
      recipient_email: data.tenant_email,
      title: '📅 Demande de visite transmise',
      message: `Bonjour ${data.tenant_name}, votre demande de visite pour "${prop?.title || 'le bien'}" a bien été transmise à l'annonceur.`,
      type: 'VISIT_SUBMITTED',
      link: '/espace-locataire?tab=appointments',
      is_read: false,
      created_at: new Date().toISOString()
    };

    const currentNotifs = this.notifications$.getValue();
    this.notifications$.next([clientNotif, advertiserNotif, ...currentNotifs]);
    this.unreadNotificationsCount$.next(this.notifications$.getValue().filter(n => !n.is_read).length);

    return this.http.post<any>(`${this.apiUrl}/appointments`, data).pipe(
      catchError(() => of({ message: 'Demande de visite transmise avec succès à l\'annonceur !', appointment: newAppointment }))
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

  getTenantAppointments(email: string): Observable<any[]> {
    let params = new HttpParams();
    if (email) params = params.set('tenant_email', email);

    return this.http.get<any[]>(`${this.apiUrl}/appointments`, { params }).pipe(
      map(res => (res && res.length > 0) ? res : this.localAppointments.filter(a => !email || a.tenant_email?.toLowerCase() === email.toLowerCase())),
      catchError(() => of(this.localAppointments.filter(a => !email || a.tenant_email?.toLowerCase() === email.toLowerCase())))
    );
  }

  getAdvertiserAppointments(email: string): Observable<any[]> {
    let params = new HttpParams();
    if (email) params = params.set('advertiser_email', email);

    return this.http.get<any[]>(`${this.apiUrl}/appointments`, { params }).pipe(
      map(res => (res && res.length > 0) ? res : this.localAppointments),
      catchError(() => of(this.localAppointments))
    );
  }

  updateAppointmentStatus(id: number, action: 'accept' | 'reschedule' | 'refuse', rescheduledDate?: string, comment?: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/appointments/${id}/status`, { action, rescheduled_date: rescheduledDate, comment }).pipe(
      tap(() => {
        this.applyLocalAppointmentStatusUpdate(id, action, rescheduledDate, comment);
      }),
      catchError(() => {
        this.applyLocalAppointmentStatusUpdate(id, action, rescheduledDate, comment);
        return of({ message: 'Statut de la visite mis à jour avec succès.' });
      })
    );
  }

  private applyLocalAppointmentStatusUpdate(id: number, action: 'accept' | 'reschedule' | 'refuse', rescheduledDate?: string, comment?: string): void {
    const item = this.localAppointments.find(a => a.id === id);
    if (!item) return;

    const propTitle = item.property?.title || 'le bien';
    const ownerName = item.property?.owner_name || 'L\'annonceur';

    if (action === 'accept') {
      item.status = 'confirmed';
      if (comment) item.advertiser_comment = comment;

      const clientNotif: AppNotification = {
        id: Date.now(),
        recipient_email: item.tenant_email,
        title: '✅ Visite confirmée',
        message: `✅ Visite confirmée !\n📍 Bien : ${propTitle}\n📅 Date & Heure : ${new Date(item.preferred_date).toLocaleString('fr-FR')}\nAnnonceur : ${ownerName}`,
        type: 'VISIT_CONFIRMED',
        link: '/espace-locataire?tab=appointments',
        is_read: false,
        created_at: new Date().toISOString()
      };

      const advertiserNotif: AppNotification = {
        id: Date.now() + 1,
        recipient_email: item.advertiser_email || '',
        title: '✅ Visite confirmée enregistrée',
        message: `Vous avez accepté le rendez-vous de visite avec ${item.tenant_name} pour "${propTitle}".`,
        type: 'VISIT_CONFIRMED',
        link: '/espace-proprietaire?tab=appointments',
        is_read: false,
        created_at: new Date().toISOString()
      };

      const currentNotifs = this.notifications$.getValue();
      this.notifications$.next([clientNotif, advertiserNotif, ...currentNotifs]);
    } else if (action === 'reschedule') {
      item.status = 'rescheduled';
      if (rescheduledDate) item.rescheduled_date = rescheduledDate;
      if (comment) item.advertiser_comment = comment;

      const clientNotif: AppNotification = {
        id: Date.now(),
        recipient_email: item.tenant_email,
        title: '⏰ Nouvelle date proposée pour la visite',
        message: `L'annonceur a proposé une nouvelle date pour "${propTitle}" : ${new Date(rescheduledDate || '').toLocaleString('fr-FR')}.${comment ? ' Commentaire : ' + comment : ''}`,
        type: 'VISIT_RESCHEDULED',
        link: '/espace-locataire?tab=appointments',
        is_read: false,
        created_at: new Date().toISOString()
      };
      const currentNotifs = this.notifications$.getValue();
      this.notifications$.next([clientNotif, ...currentNotifs]);
    } else if (action === 'refuse') {
      item.status = 'cancelled';
      if (comment) item.advertiser_comment = comment;

      const clientNotif: AppNotification = {
        id: Date.now(),
        recipient_email: item.tenant_email,
        title: '❌ Demande de visite refusée',
        message: `Votre demande de visite pour "${propTitle}" n'a pas pu être acceptée par l'annonceur.${comment ? ' Motif : ' + comment : ''}`,
        type: 'VISIT_CANCELLED',
        link: '/espace-locataire?tab=appointments',
        is_read: false,
        created_at: new Date().toISOString()
      };
      const currentNotifs = this.notifications$.getValue();
      this.notifications$.next([clientNotif, ...currentNotifs]);
    }
    this.unreadNotificationsCount$.next(this.notifications$.getValue().filter(n => !n.is_read).length);
  }

  triggerVisitReminders(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/appointments/send-reminders`, {}).pipe(
      tap(() => this.applyLocalVisitReminders()),
      catchError(() => {
        const count = this.applyLocalVisitReminders();
        return of({ message: `Rappels de visites traités. ${count} rappel(s) généré(s).` });
      })
    );
  }

  private applyLocalVisitReminders(): number {
    let count = 0;
    this.localAppointments.forEach(apt => {
      if (apt.status === 'confirmed') {
        if (!apt.reminder_24h_sent) {
          apt.reminder_24h_sent = true;
          count++;
          const reminderNotif: AppNotification = {
            id: Date.now() + count,
            recipient_email: apt.tenant_email,
            title: '🔔 Rappel de visite (Demain)',
            message: `🔔 Rappel : votre visite pour "${apt.property?.title || 'le bien'}" est prévue demain à ${new Date(apt.preferred_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`,
            type: 'VISIT_REMINDER',
            link: '/espace-locataire?tab=appointments',
            is_read: false,
            created_at: new Date().toISOString()
          };
          const currentNotifs = this.notifications$.getValue();
          this.notifications$.next([reminderNotif, ...currentNotifs]);
        }
      }
    });
    this.unreadNotificationsCount$.next(this.notifications$.getValue().filter(n => !n.is_read).length);
    return count;
  }

  createAlert(data: any): Observable<any> {
    const newAlert = {
      id: Date.now(),
      user_email: data.user_email || 'client@izivilla.sn',
      city: data.city || '',
      quartier: data.quartier || '',
      property_type: data.property_type || '',
      transaction_type: data.transaction_type || '',
      bedrooms: data.bedrooms || null,
      max_price: data.max_price || null,
      is_furnished: data.is_furnished || false,
      is_active: true,
      created_at: new Date().toISOString()
    };
    this.localAlerts.unshift(newAlert);

    return this.http.post<any>(`${this.apiUrl}/alerts`, data).pipe(
      catchError(() => of({
        message: 'Alerte email activée avec succès sur Izivilla ! Vous recevrez un avis dès qu\'un nouveau bien correspondra.',
        alert: newAlert
      }))
    );
  }

  getAlertsByEmail(email: string): Observable<any[]> {
    let params = new HttpParams();
    if (email) params = params.set('email', email);

    return this.http.get<any[]>(`${this.apiUrl}/alerts`, { params }).pipe(
      map(res => (res && res.length > 0) ? res : this.localAlerts),
      catchError(() => of(this.localAlerts))
    );
  }

  toggleAlertStatus(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/alerts/${id}/toggle`, {}).pipe(
      tap(() => {
        const item = this.localAlerts.find(a => a.id === id);
        if (item) item.is_active = !item.is_active;
      }),
      catchError(() => {
        const item = this.localAlerts.find(a => a.id === id);
        if (item) item.is_active = !item.is_active;
        const statusText = item?.is_active ? 'activée' : 'désactivée';
        return of({ message: `L'alerte a été ${statusText} avec succès.` });
      })
    );
  }

  deleteAlert(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/alerts/${id}`).pipe(
      tap(() => {
        this.localAlerts = this.localAlerts.filter(a => a.id !== id);
      }),
      catchError(() => {
        this.localAlerts = this.localAlerts.filter(a => a.id !== id);
        return of({ message: 'Alerte supprimée avec succès.' });
      })
    );
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

  // ==========================================
  // IZIVILLA PHASE 1 : AUTOMATISATIONS METHODS
  // ==========================================

  sendPropertyRequest(reqData: { property_id: number; client_name: string; client_email: string; client_phone?: string; message: string; advertiser_email?: string; property_title?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/property-requests`, reqData).pipe(
      tap(res => {
        // Also sync local state & generate instant notification for advertiser
        const newReq: PropertyRequest = {
          id: res?.request?.id || Date.now(),
          property_id: reqData.property_id,
          client_name: reqData.client_name,
          client_email: reqData.client_email,
          client_phone: reqData.client_phone,
          advertiser_email: reqData.advertiser_email || 'owner@izivilla.sn',
          message: reqData.message,
          status: 'NOUVEAU',
          created_at: new Date().toISOString()
        };
        this.localPropertyRequests.unshift(newReq);

        // 1. Generate instant notification for advertiser
        const advertiserNotif: AppNotification = {
          id: Date.now(),
          recipient_email: newReq.advertiser_email || '',
          title: '🔔 Nouvelle demande sur votre annonce',
          message: `${reqData.property_title || 'Votre bien'}\nClient : ${reqData.client_name}\n« ${reqData.message} »`,
          type: 'NEW_REQUEST',
          link: '/espace-proprietaire?tab=requests',
          is_read: false,
          created_at: new Date().toISOString(),
          data: { request_id: newReq.id, property_id: reqData.property_id }
        };

        // 2. Generate instant confirmation notification for client (PRIORITÉ 3)
        const clientNotif: AppNotification = {
          id: Date.now() + 1,
          recipient_email: newReq.client_email,
          title: '✅ Confirmation de votre demande',
          message: `Bonjour ${reqData.client_name},\n\nvotre demande concernant ${reqData.property_title || 'le bien'} a bien été transmise à l'annonceur.\n\nVous serez contacté prochainement.`,
          type: 'REQUEST_CONFIRMATION',
          link: '/espace-locataire?tab=requests',
          is_read: false,
          created_at: new Date().toISOString(),
          data: { request_id: newReq.id, property_id: reqData.property_id }
        };

        const currentNotifs = this.notifications$.getValue();
        const updated = [clientNotif, advertiserNotif, ...currentNotifs];
        this.notifications$.next(updated);
        this.unreadNotificationsCount$.next(updated.filter(n => !n.is_read).length);
      }),
      catchError(err => {
        // Fallback for offline/mock mode
        const newReq: PropertyRequest = {
          id: Date.now(),
          property_id: reqData.property_id,
          client_name: reqData.client_name,
          client_email: reqData.client_email,
          client_phone: reqData.client_phone,
          advertiser_email: reqData.advertiser_email || 'owner@izivilla.sn',
          message: reqData.message,
          status: 'NOUVEAU',
          created_at: new Date().toISOString()
        };
        this.localPropertyRequests.unshift(newReq);

        const advertiserNotif: AppNotification = {
          id: Date.now(),
          recipient_email: newReq.advertiser_email || '',
          title: '🔔 Nouvelle demande sur votre annonce',
          message: `${reqData.property_title || 'Votre bien'}\nClient : ${reqData.client_name}\n« ${reqData.message} »`,
          type: 'NEW_REQUEST',
          link: '/espace-proprietaire?tab=requests',
          is_read: false,
          created_at: new Date().toISOString()
        };

        const clientNotif: AppNotification = {
          id: Date.now() + 1,
          recipient_email: newReq.client_email,
          title: '✅ Confirmation de votre demande',
          message: `Bonjour ${reqData.client_name},\n\nvotre demande concernant ${reqData.property_title || 'le bien'} a bien été transmise à l'annonceur.\n\nVous serez contacté prochainement.`,
          type: 'REQUEST_CONFIRMATION',
          link: '/espace-locataire?tab=requests',
          is_read: false,
          created_at: new Date().toISOString()
        };

        const currentNotifs = this.notifications$.getValue();
        const updated = [clientNotif, advertiserNotif, ...currentNotifs];
        this.notifications$.next(updated);
        this.unreadNotificationsCount$.next(updated.filter(n => !n.is_read).length);

        return of({
          message: `Bonjour ${reqData.client_name}, votre demande concernant ${reqData.property_title || 'le bien'} a bien été transmise à l'annonceur. Vous serez contacté prochainement.`,
          request: newReq
        });
      })
    );
  }


  getPropertyRequests(params?: { advertiser_email?: string; client_email?: string; status?: string }): Observable<PropertyRequest[]> {
    let httpParams = new HttpParams();
    if (params?.advertiser_email) httpParams = httpParams.set('advertiser_email', params.advertiser_email);
    if (params?.client_email) httpParams = httpParams.set('client_email', params.client_email);
    if (params?.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<PropertyRequest[]>(`${this.apiUrl}/property-requests`, { params: httpParams }).pipe(
      map(res => (res && res.length > 0) ? res : this.localPropertyRequests),
      catchError(() => of(this.localPropertyRequests))
    );
  }


  updateRequestStatus(id: number, status: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/property-requests/${id}/status`, { status }).pipe(
      tap(() => {
        const item = this.localPropertyRequests.find(r => r.id === id);
        if (item) {
          item.status = status as any;
          const statusNotif: AppNotification = {
            id: Date.now(),
            recipient_email: item.client_email,
            title: `📌 Statut de demande mis à jour : ${status}`,
            message: `L'annonceur a mis à jour le statut de votre demande sur "${item.property?.title || 'votre demande'}" en "${status}".`,
            type: 'STATUS_UPDATE',
            link: '/mes-demandes',
            is_read: false,
            created_at: new Date().toISOString()
          };
          const currentNotifs = this.notifications$.getValue();
          this.notifications$.next([statusNotif, ...currentNotifs]);
          this.unreadNotificationsCount$.next(this.notifications$.getValue().filter(n => !n.is_read).length);
        }
      }),
      catchError(() => {
        const item = this.localPropertyRequests.find(r => r.id === id);
        if (item) {
          item.status = status as any;
          const statusNotif: AppNotification = {
            id: Date.now(),
            recipient_email: item.client_email,
            title: `📌 Statut de demande mis à jour : ${status}`,
            message: `L'annonceur a mis à jour le statut de votre demande sur "${item.property?.title || 'votre demande'}" en "${status}".`,
            type: 'STATUS_UPDATE',
            link: '/mes-demandes',
            is_read: false,
            created_at: new Date().toISOString()
          };
          const currentNotifs = this.notifications$.getValue();
          this.notifications$.next([statusNotif, ...currentNotifs]);
          this.unreadNotificationsCount$.next(this.notifications$.getValue().filter(n => !n.is_read).length);
        }
        return of({ message: 'Statut mis à jour avec succès' });
      })
    );
  }

  sendProspectFollowup(id: number, message: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/property-requests/${id}/send-followup`, { message }).pipe(
      tap(() => {
        const item = this.localPropertyRequests.find(r => r.id === id);
        if (item) {
          item.updated_at = new Date().toISOString();
          item.last_followup_at = new Date().toISOString();
          item.is_inactive = false;
          item.inactive_days = 0;
          const followupNotif: AppNotification = {
            id: Date.now(),
            recipient_email: item.client_email,
            title: `💬 Message de l'annonceur concernant votre demande`,
            message: message,
            type: 'PROSPECT_FOLLOWUP',
            link: '/espace-locataire?tab=requests',
            is_read: false,
            created_at: new Date().toISOString()
          };
          const currentNotifs = this.notifications$.getValue();
          this.notifications$.next([followupNotif, ...currentNotifs]);
          this.unreadNotificationsCount$.next(this.notifications$.getValue().filter(n => !n.is_read).length);
        }
      }),
      catchError(() => {
        const item = this.localPropertyRequests.find(r => r.id === id);
        if (item) {
          item.updated_at = new Date().toISOString();
          item.last_followup_at = new Date().toISOString();
          item.is_inactive = false;
          item.inactive_days = 0;
          const followupNotif: AppNotification = {
            id: Date.now(),
            recipient_email: item.client_email,
            title: `💬 Message de l'annonceur concernant votre demande`,
            message: message,
            type: 'PROSPECT_FOLLOWUP',
            link: '/espace-locataire?tab=requests',
            is_read: false,
            created_at: new Date().toISOString()
          };
          const currentNotifs = this.notifications$.getValue();
          this.notifications$.next([followupNotif, ...currentNotifs]);
          this.unreadNotificationsCount$.next(this.notifications$.getValue().filter(n => !n.is_read).length);
        }
        return of({ message: 'Relance transmise avec succès au prospect !' });
      })
    );
  }

  triggerAutomatedReminders(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/property-requests/send-reminders`, {}).pipe(
      tap(res => {
        this.localPropertyRequests.forEach(req => {
          if (req.status === 'NOUVEAU') {
            req.is_reminder_sent = true;
            const reminderNotif: AppNotification = {
              id: Date.now(),
              recipient_email: req.advertiser_email || 'owner@izivilla.sn',
              title: '⏰ Rappel : Demande client en attente de réponse',
              message: `Rappel Izivilla : Vous avez 1 demande sans réponse de ${req.client_name} pour le bien "${req.property?.title || 'Votre annonce'}".`,
              type: 'REQUEST_REMINDER',
              link: '/espace-proprietaire?tab=requests',
              is_read: false,
              created_at: new Date().toISOString()
            };
            const currentNotifs = this.notifications$.getValue();
            this.notifications$.next([reminderNotif, ...currentNotifs]);
          }
        });
        this.unreadNotificationsCount$.next(this.notifications$.getValue().filter(n => !n.is_read).length);
      }),
      catchError(() => {
        let count = 0;
        this.localPropertyRequests.forEach(req => {
          if (req.status === 'NOUVEAU') {
            req.is_reminder_sent = true;
            count++;
            const reminderNotif: AppNotification = {
              id: Date.now(),
              recipient_email: req.advertiser_email || 'owner@izivilla.sn',
              title: '⏰ Rappel : Demande client en attente de réponse',
              message: `Rappel Izivilla : Vous avez 1 demande sans réponse de ${req.client_name} pour le bien "${req.property?.title || 'Votre annonce'}".`,
              type: 'REQUEST_REMINDER',
              link: '/espace-proprietaire?tab=requests',
              is_read: false,
              created_at: new Date().toISOString()
            };
            const currentNotifs = this.notifications$.getValue();
            this.notifications$.next([reminderNotif, ...currentNotifs]);
          }
        });
        this.unreadNotificationsCount$.next(this.notifications$.getValue().filter(n => !n.is_read).length);
        return of({ message: `Rappels automatiques envoyés à ${count} annonceur(s)` });
      })
    );
  }

  getNotifications(recipientEmail?: string): Observable<{ notifications: AppNotification[]; unread_count: number }> {
    let params = new HttpParams();
    if (recipientEmail) params = params.set('recipient_email', recipientEmail);

    return this.http.get<{ notifications: AppNotification[]; unread_count: number }>(`${this.apiUrl}/notifications`, { params }).pipe(
      tap(res => {
        if (res.notifications) {
          this.notifications$.next(res.notifications);
          this.unreadNotificationsCount$.next(res.unread_count);
        }
      }),
      catchError(() => {
        const current = this.notifications$.getValue();
        const unread = current.filter(n => !n.is_read).length;
        return of({ notifications: current, unread_count: unread });
      })
    );
  }

  markNotificationAsRead(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/notifications/${id}/read`, {}).pipe(
      tap(() => {
        const current = this.notifications$.getValue().map(n => n.id === id ? { ...n, is_read: true } : n);
        this.notifications$.next(current);
        this.unreadNotificationsCount$.next(current.filter(n => !n.is_read).length);
      }),
      catchError(() => {
        const current = this.notifications$.getValue().map(n => n.id === id ? { ...n, is_read: true } : n);
        this.notifications$.next(current);
        this.unreadNotificationsCount$.next(current.filter(n => !n.is_read).length);
        return of({ message: 'Marqué comme lu' });
      })
    );
  }

  markAllNotificationsAsRead(recipientEmail?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/notifications/mark-all-read`, { recipient_email: recipientEmail }).pipe(
      tap(() => {
        const current = this.notifications$.getValue().map(n => ({ ...n, is_read: true }));
        this.notifications$.next(current);
        this.unreadNotificationsCount$.next(0);
      }),
      catchError(() => {
        const current = this.notifications$.getValue().map(n => ({ ...n, is_read: true }));
        this.notifications$.next(current);
        this.unreadNotificationsCount$.next(0);
        return of({ message: 'Toutes les notifications ont été marquées comme lues' });
      })
    );
  }
}


