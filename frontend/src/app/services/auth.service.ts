import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'tenant' | 'owner' | 'agency' | 'admin';
  email_verified_at?: string | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  email?: string;
  user?: User;
  needs_verification?: boolean;
  code_debug?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  public currentUser$ = new BehaviorSubject<User | null>(this.getStoredUser());
  public isLoggedIn$ = new BehaviorSubject<boolean>(!!this.getStoredUser());

  constructor(private http: HttpClient) {}

  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem('izivilla_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Inscription d'un utilisateur
   */
  register(data: { name: string; email: string; password: string; phone?: string; role?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      catchError(err => throwError(() => err.error || { success: false, message: 'Erreur lors de l\'inscription.' }))
    );
  }

  /**
   * Validation du code OTP à 6 chiffres
   */
  verifyCode(email: string, code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/verify-code`, { email, code }).pipe(
      tap(res => {
        if (res.success && res.user) {
          this.setSession(res.user);
        }
      }),
      catchError(err => throwError(() => err.error || { success: false, message: 'Code de vérification invalide.' }))
    );
  }

  /**
   * Renvoi d'un nouveau code OTP par email
   */
  resendCode(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/resend-code`, { email }).pipe(
      catchError(err => throwError(() => err.error || { success: false, message: 'Erreur lors du renvoi du code.' }))
    );
  }

  /**
   * Connexion
   */
  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.user) {
          this.setSession(res.user);
        }
      }),
      catchError(err => throwError(() => err.error || { success: false, message: 'Identifiants incorrects.' }))
    );
  }

  /**
   * Déconnexion
   */
  logout(): void {
    localStorage.removeItem('izivilla_user');
    localStorage.removeItem('izivilla_logged_in');
    this.currentUser$.next(null);
    this.isLoggedIn$.next(false);
  }

  private setSession(user: User): void {
    localStorage.setItem('izivilla_user', JSON.stringify(user));
    localStorage.setItem('izivilla_logged_in', 'true');
    localStorage.setItem('izivilla_user_role', user.role || 'tenant');
    this.currentUser$.next(user);
    this.isLoggedIn$.next(true);
  }
}
