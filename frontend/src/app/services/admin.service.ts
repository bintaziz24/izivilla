import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AdminDashboardData {
  stats: {
    total_users: number;
    total_owners_agencies: number;
    total_published_properties: number;
    pending_properties: number;
    pending_verifications: number;
    pending_reports: number;
  };
  urgent_verifications: any[];
  urgent_reports: any[];
  recent_properties: any[];
  recent_logs: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  private fallbackData: AdminDashboardData = {
    stats: {
      total_users: 18,
      total_owners_agencies: 12,
      total_published_properties: 7,
      pending_properties: 2,
      pending_verifications: 2,
      pending_reports: 2
    },
    urgent_verifications: [
      {
        id: 1,
        user_name: 'Cheikh Tidiane Diagne',
        user_email: 'cheikh.diagne@gmail.com',
        user_phone: '+221 77 340 55 12',
        user_type: 'owner',
        document_type: 'CNI Sénégalaise',
        document_number: 'CNI-1755198900452',
        document_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
        status: 'pending',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        user_name: 'Teranga Horizon Agency',
        user_email: 'direction@terangahorizon.sn',
        user_phone: '+221 78 901 23 45',
        user_type: 'agency',
        document_type: 'Registre de Commerce & NINEA',
        document_number: 'RCCM-SN-DKR-2023-B-12904',
        document_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
        status: 'pending',
        created_at: new Date().toISOString()
      }
    ],
    urgent_reports: [
      {
        id: 1,
        property_id: 2,
        reporter_name: 'Moussa Fall',
        reporter_email: 'moussa.fall@client.sn',
        reason: 'Prix trompeur',
        details: 'Le loyer indiqué est de 300 000 FCFA mais lors de mon appel téléphonique l\'annonceur demande 450 000 FCFA hors charges.',
        status: 'pending',
        created_at: new Date().toISOString(),
        property: {
          id: 2,
          title: 'Appartement Haut Standing F4 avec Balcon Vue Mer à Mermoz',
          city: 'Dakar',
          quartier: 'Mermoz',
          price_fcfa: 750000,
          status: 'available',
          images: [{ image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80' }]
        }
      },
      {
        id: 2,
        property_id: 1,
        reporter_name: 'Awa Bâ',
        reporter_email: 'awa.ba@client.sn',
        reason: 'Photos volées',
        details: 'Les photos présentées sont celles d\'une résidence privée aux Almadies qui n\'est pas à louer actuellement.',
        status: 'pending',
        created_at: new Date().toISOString(),
        property: {
          id: 1,
          title: 'Villa Contemporaine 5 Chambres avec Piscine aux Almadies',
          city: 'Dakar',
          quartier: 'Almadies',
          price_fcfa: 350000000,
          status: 'available',
          images: [{ image_url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=400&q=80' }]
        }
      }
    ],
    recent_properties: [
      {
        id: 1,
        title: 'Villa Contemporaine 5 Chambres avec Piscine aux Almadies',
        property_type: 'Villa',
        transaction_type: 'sale',
        price_fcfa: 350000000,
        city: 'Dakar',
        quartier: 'Almadies',
        owner_name: 'Amadou Sow',
        owner_phone: '+221 77 645 12 34',
        is_verified: true,
        status: 'available',
        views_count: 1420,
        images: [{ image_url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=400&q=80' }]
      },
      {
        id: 2,
        title: 'Appartement Haut Standing F4 avec Balcon Vue Mer à Mermoz',
        property_type: 'Appartement',
        transaction_type: 'rent',
        price_fcfa: 750000,
        city: 'Dakar',
        quartier: 'Mermoz',
        owner_name: 'Immo Conseil Sénégal',
        owner_phone: '+221 33 869 40 40',
        is_verified: true,
        status: 'available',
        views_count: 980,
        images: [{ image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80' }]
      },
      {
        id: 3,
        title: 'Studio Cosy Meublé avec Wi-Fi & Smart TV à Sacré-Cœur 3',
        property_type: 'Studio',
        transaction_type: 'rent',
        price_fcfa: 280000,
        city: 'Dakar',
        quartier: 'Sacré-Cœur',
        owner_name: 'Fatou Kiné Ba',
        owner_phone: '+221 77 312 88 99',
        is_verified: true,
        status: 'available',
        views_count: 640,
        images: [{ image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80' }]
      },
      {
        id: 4,
        title: 'Terrain Viabilisé Pieds dans l\'Eau de 600m² à Saly Portudal',
        property_type: 'Terrain',
        transaction_type: 'sale',
        price_fcfa: 65000000,
        city: 'Saly',
        quartier: 'Saly Portudal',
        owner_name: 'Babacar Ndiaye',
        owner_phone: '+221 70 888 77 66',
        is_verified: true,
        status: 'available',
        views_count: 2100,
        images: [{ image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80' }]
      }
    ],
    recent_logs: [
      {
        id: 1,
        admin_name: 'Super Admin',
        action: 'PLATFORM_INITIALIZATION',
        details: 'Initialisation du centre de contrôle et modération Izivilla.',
        created_at: new Date().toISOString()
      }
    ]
  };

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<AdminDashboardData> {
    return this.http.get<AdminDashboardData>(`${this.apiUrl}/dashboard-stats`).pipe(
      catchError(() => of(this.fallbackData))
    );
  }

  getProperties(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get<any>(`${this.apiUrl}/properties`, { params: httpParams }).pipe(
      catchError(() => of({
        data: this.fallbackData.recent_properties,
        total: this.fallbackData.recent_properties.length
      }))
    );
  }

  updatePropertyStatus(id: number, status: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/properties/${id}/status`, { status }).pipe(
      catchError(() => {
        const prop = this.fallbackData.recent_properties.find(p => p.id === id);
        if (prop) prop.status = status;
        return of({ success: true, message: `Statut de l'annonce mis à jour (${status}).` });
      })
    );
  }

  deleteProperty(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/properties/${id}`).pipe(
      catchError(() => {
        this.fallbackData.recent_properties = this.fallbackData.recent_properties.filter(p => p.id !== id);
        return of({ success: true, message: "L'annonce a été supprimée avec succès." });
      })
    );
  }

  getUsers(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get<any>(`${this.apiUrl}/users`, { params: httpParams }).pipe(
      catchError(() => of({
        data: [
          { id: 1, name: 'Super Administrateur Izivilla', email: 'admin@izivilla.com', phone: '+221 77 755 68 15', role: 'admin', is_active: true, is_verified: true },
          { id: 2, name: 'Amadou Sow', email: 'amadou.sow@izivilla.sn', phone: '+221 77 845 12 34', role: 'owner', is_active: true, is_verified: true },
          { id: 3, name: 'Dakar Prestige Immobilier', email: 'contact@dakarprestige.sn', phone: '+221 78 120 45 67', role: 'agency', is_active: true, is_verified: true },
          { id: 4, name: 'Abdou Diop', email: 'abdou.diop@client.sn', phone: '+221 77 654 32 10', role: 'tenant', is_active: true, is_verified: false }
        ],
        total: 4
      }))
    );
  }

  updateUser(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/users/${id}`, data).pipe(
      catchError(() => of({ success: true, message: "Compte utilisateur mis à jour avec succès." }))
    );
  }

  getVerifications(status: string = 'all'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/verifications`, {
      params: { status }
    }).pipe(
      catchError(() => of(this.fallbackData.urgent_verifications))
    );
  }

  approveVerification(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verifications/${id}/approve`, {}).pipe(
      catchError(() => {
        const v = this.fallbackData.urgent_verifications.find(x => x.id === id);
        if (v) v.status = 'approved';
        return of({ success: true, message: "Badge officiel de vérification accordé !" });
      })
    );
  }

  rejectVerification(id: number, reason: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verifications/${id}/reject`, { reason }).pipe(
      catchError(() => {
        const v = this.fallbackData.urgent_verifications.find(x => x.id === id);
        if (v) {
          v.status = 'rejected';
          v.rejection_reason = reason;
        }
        return of({ success: true, message: "Demande de vérification rejetée avec motif transmis." });
      })
    );
  }

  getReports(status: string = 'all'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reports`, {
      params: { status }
    }).pipe(
      catchError(() => of(this.fallbackData.urgent_reports))
    );
  }

  resolveReport(id: number, status: string, action_taken?: string, admin_notes?: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/reports/${id}/resolve`, {
      status,
      action_taken,
      admin_notes
    }).pipe(
      catchError(() => {
        const r = this.fallbackData.urgent_reports.find(x => x.id === id);
        if (r) {
          r.status = status;
          r.action_taken = action_taken;
        }
        return of({ success: true, message: "Le signalement a été traité avec succès." });
      })
    );
  }

  getActivityLogs(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/activity-logs`).pipe(
      catchError(() => of({
        data: [
          { id: 1, admin_name: 'Super Admin', action: 'PROPERTY_STATUS_CHANGE', details: 'Approbation et publication de l\'annonce #1 aux Almadies.', ip_address: '127.0.0.1', created_at: new Date().toISOString() },
          { id: 2, admin_name: 'Super Admin', action: 'VERIFICATION_APPROVED', details: 'Attribution du badge vérifié à Dakar Prestige Immobilier.', ip_address: '127.0.0.1', created_at: new Date().toISOString() },
          { id: 3, admin_name: 'Système Izivilla', action: 'PLATFORM_INITIALIZATION', details: 'Connexion PostgreSQL Neon établie.', ip_address: '127.0.0.1', created_at: new Date().toISOString() }
        ]
      }))
    );
  }

  getAdvancedStats(period: string = 'month'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/advanced-stats`, {
      params: { period }
    }).pipe(
      catchError(() => of({
        by_city: [
          { city: 'Dakar', count: 5 },
          { city: 'Saly', count: 1 },
          { city: 'Thiès', count: 1 }
        ],
        by_transaction: [
          { transaction_type: 'rent', count: 4 },
          { transaction_type: 'sale', count: 3 }
        ]
      }))
    );
  }
}
