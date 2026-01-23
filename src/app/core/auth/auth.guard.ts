import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from '../models/role.enum';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
        return router.createUrlTree(['/auth/login']);
    }

    const expectedRoles = route.data['roles'] as Role[];
    const userRole = authService.getUserRole();

    if (expectedRoles && userRole && !expectedRoles.includes(userRole)) {
        // Role not authorized, redirect to dashboard or home
        return router.createUrlTree(['/dashboard']);
    }

    return true;
};
