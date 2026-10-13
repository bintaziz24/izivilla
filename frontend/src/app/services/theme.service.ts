import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<ThemeMode>('light');
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem('izivilla_theme') as ThemeMode | null;
    // Default to clean luminous light mode (standard for modern real estate portals)
    const initialTheme: ThemeMode = savedTheme || 'light';
    this.setTheme(initialTheme);
  }

  public setTheme(theme: ThemeMode): void {
    this.themeSubject.next(theme);
    localStorage.setItem('izivilla_theme', theme);
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  public toggleTheme(): void {
    const nextTheme: ThemeMode = this.themeSubject.value === 'light' ? 'dark' : 'light';
    this.setTheme(nextTheme);
  }

  public isDark(): boolean {
    return this.themeSubject.value === 'dark';
  }
}
