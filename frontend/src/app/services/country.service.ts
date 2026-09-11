import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Country {
  code: string;
  name: string;
  flag: string;
  flagUrl: string;
  currency: string;
  phonePrefix: string;
}

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  public readonly countries: Country[] = [
    { code: 'SN', name: 'Sénégal', flag: '🇸🇳', flagUrl: 'https://flagcdn.com/w40/sn.png', currency: 'FCFA', phonePrefix: '+221' },
    { code: 'CI', name: 'Côte d’Ivoire', flag: '🇨🇮', flagUrl: 'https://flagcdn.com/w40/ci.png', currency: 'FCFA', phonePrefix: '+225' },
    { code: 'MR', name: 'Mauritanie', flag: '🇲🇷', flagUrl: 'https://flagcdn.com/w40/mr.png', currency: 'MRU', phonePrefix: '+222' },
    { code: 'CV', name: 'Cap-Vert', flag: '🇨🇻', flagUrl: 'https://flagcdn.com/w40/cv.png', currency: 'CVE', phonePrefix: '+238' },
    { code: 'CM', name: 'Cameroun', flag: '🇨🇲', flagUrl: 'https://flagcdn.com/w40/cm.png', currency: 'FCFA', phonePrefix: '+237' },
    { code: 'CD', name: 'RDC', flag: '🇨🇩', flagUrl: 'https://flagcdn.com/w40/cd.png', currency: 'USD / CDF', phonePrefix: '+243' },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬', flagUrl: 'https://flagcdn.com/w40/ng.png', currency: 'NGN', phonePrefix: '+234' },
    { code: 'KE', name: 'Kenya', flag: '🇰🇪', flagUrl: 'https://flagcdn.com/w40/ke.png', currency: 'KES', phonePrefix: '+254' },
    { code: 'GH', name: 'Ghana', flag: '🇬🇭', flagUrl: 'https://flagcdn.com/w40/gh.png', currency: 'GHS', phonePrefix: '+233' },
    { code: 'TZ', name: 'Tanzanie', flag: '🇹🇿', flagUrl: 'https://flagcdn.com/w40/tz.png', currency: 'TZS', phonePrefix: '+255' },
    { code: 'UG', name: 'Ouganda', flag: '🇺🇬', flagUrl: 'https://flagcdn.com/w40/ug.png', currency: 'UGX', phonePrefix: '+256' },
    { code: 'ET', name: 'Éthiopie', flag: '🇪🇹', flagUrl: 'https://flagcdn.com/w40/et.png', currency: 'ETB', phonePrefix: '+251' }
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
}
