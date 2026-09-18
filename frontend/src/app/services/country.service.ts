import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Country {
  code: string;
  name: string;
  flag: string;
  flagUrl: string;
  currency: string;
  phonePrefix: string;
  rateFromFcfa: number;
}

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  public readonly countries: Country[] = [
    { code: 'SN', name: 'Sénégal', flag: '🇸🇳', flagUrl: 'https://flagcdn.com/w40/sn.png', currency: 'FCFA', phonePrefix: '+221', rateFromFcfa: 1 },
    { code: 'CI', name: 'Côte d’Ivoire', flag: '🇨🇮', flagUrl: 'https://flagcdn.com/w40/ci.png', currency: 'FCFA', phonePrefix: '+225', rateFromFcfa: 1 },
    { code: 'CM', name: 'Cameroun', flag: '🇨🇲', flagUrl: 'https://flagcdn.com/w40/cm.png', currency: 'FCFA', phonePrefix: '+237', rateFromFcfa: 1 },
    { code: 'MR', name: 'Mauritanie', flag: '🇲🇷', flagUrl: 'https://flagcdn.com/w40/mr.png', currency: 'MRU', phonePrefix: '+222', rateFromFcfa: 0.0667 },
    { code: 'CV', name: 'Cap-Vert', flag: '🇨🇻', flagUrl: 'https://flagcdn.com/w40/cv.png', currency: 'CVE', phonePrefix: '+238', rateFromFcfa: 0.1667 },
    { code: 'CD', name: 'RDC', flag: '🇨🇩', flagUrl: 'https://flagcdn.com/w40/cd.png', currency: 'USD', phonePrefix: '+243', rateFromFcfa: 0.001667 },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬', flagUrl: 'https://flagcdn.com/w40/ng.png', currency: 'NGN', phonePrefix: '+234', rateFromFcfa: 2.5 },
    { code: 'KE', name: 'Kenya', flag: '🇰🇪', flagUrl: 'https://flagcdn.com/w40/ke.png', currency: 'KES', phonePrefix: '+254', rateFromFcfa: 0.217 },
    { code: 'GH', name: 'Ghana', flag: '🇬🇭', flagUrl: 'https://flagcdn.com/w40/gh.png', currency: 'GHS', phonePrefix: '+233', rateFromFcfa: 0.025 },
    { code: 'TZ', name: 'Tanzanie', flag: '🇹🇿', flagUrl: 'https://flagcdn.com/w40/tz.png', currency: 'TZS', phonePrefix: '+255', rateFromFcfa: 4.545 },
    { code: 'UG', name: 'Ouganda', flag: '🇺🇬', flagUrl: 'https://flagcdn.com/w40/ug.png', currency: 'UGX', phonePrefix: '+256', rateFromFcfa: 6.25 },
    { code: 'ET', name: 'Éthiopie', flag: '🇪🇹', flagUrl: 'https://flagcdn.com/w40/et.png', currency: 'ETB', phonePrefix: '+251', rateFromFcfa: 0.2 },
    { code: 'FR', name: 'France (Euro)', flag: '🇪🇺', flagUrl: 'https://flagcdn.com/w40/eu.png', currency: 'EUR', phonePrefix: '+33', rateFromFcfa: 0.001524 }
  ];

  private selectedCountrySubject = new BehaviorSubject<Country>(this.countries[0]);
  public selectedCountry$ = this.selectedCountrySubject.asObservable();

  constructor() {
    const savedCode = localStorage.getItem('izivilla_country');
    if (savedCode) {
      const found = this.countries.find(c => c.code === savedCode);
      if (found) {
        this.selectedCountrySubject.next(found);
      }
    }
  }

  public get currentCountry(): Country {
    return this.selectedCountrySubject.value;
  }

  public setCountryByCode(code: string): void {
    const found = this.countries.find(c => c.code === code);
    if (found) {
      this.selectedCountrySubject.next(found);
      localStorage.setItem('izivilla_country', found.code);
    }
  }

  public convertPrice(priceInFcfa: number): number {
    if (!priceInFcfa || isNaN(priceInFcfa)) return 0;
    const rate = this.currentCountry.rateFromFcfa || 1;
    return Math.round(priceInFcfa * rate);
  }

  public formatPrice(priceInFcfa: number): string {
    const converted = this.convertPrice(priceInFcfa);
    return converted.toLocaleString();
  }
}
