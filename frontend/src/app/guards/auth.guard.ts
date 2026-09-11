import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PropertyService } from '../services/property.service';

export const authGuard: CanActivateFn = (route, state) => {
  const propertyService = inject(PropertyService);
  const router = inject(Router);

  const currentUser = propertyService.getCurrentUser();
  const requiredRole = route.data?.['role'] as string | undefined;

  if (!propertyService.isLoggedIn$.getValue() || !currentUser) {
    propertyService.openAuthModal(
      'login',
      'Veuillez vous connecter ou créer un compte pour continuer.',
      state.url
    );
    return false;
  }

  const roleStr = currentUser.role as string;

  if (state.url.includes('/deposer-annonce') && roleStr === 'tenant') {
    propertyService.openAuthModal(
      'register',
      'Les comptes "Chercheur" ne peuvent pas publier d\'annonces. Veuillez créer ou vous connecter à un compte Propriétaire ou Agence.',
      '/deposer-annonce'
    );
    return false;
  }

  if (requiredRole && roleStr !== requiredRole && roleStr !== 'admin') {
    if (requiredRole === 'admin' && roleStr !== 'admin') {
      router.navigate(['/'], { queryParams: { unauthorized: true } });
      return false;
    }
  }

  return true;
};
