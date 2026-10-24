import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<AdminDashboardData> {
    return this.http.get<AdminDashboardData>(`${this.apiUrl}/dashboard-stats`);
  }

  getProperties(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get<any>(`${this.apiUrl}/properties`, { params: httpParams });
  }

  updatePropertyStatus(id: number, status: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/properties/${id}/status`, { status });
  }

  deleteProperty(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/properties/${id}`);
  }

  getUsers(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get<any>(`${this.apiUrl}/users`, { params: httpParams });
  }

  updateUser(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/users/${id}`, data);
  }

  getVerifications(status: string = 'all'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/verifications`, {
      params: { status }
    });
  }

  approveVerification(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verifications/${id}/approve`, {});
  }

  rejectVerification(id: number, reason: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verifications/${id}/reject`, { reason });
  }

  getReports(status: string = 'all'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reports`, {
      params: { status }
    });
  }

  resolveReport(id: number, status: string, action_taken?: string, admin_notes?: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/reports/${id}/resolve`, {
      status,
      action_taken,
      admin_notes
    });
  }

  getActivityLogs(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/activity-logs`);
  }

  getAdvancedStats(period: string = 'month'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/advanced-stats`, {
      params: { period }
    });
  }
}
