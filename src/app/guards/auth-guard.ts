import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ÉTAPE 1 : Est-ce que l'utilisateur est authentifié ?
  // (Pour l'instant, on fait une vérification basique, on verra après comment stocker l'état)
  if (authService.isLoggedIn()) {
    return true; // Accès autorisé !
  }

  // ÉTAPE 2 : Sinon, redirection immédiate vers la racine
  router.navigate(['/']);
  return false; // Accès bloqué !
};
