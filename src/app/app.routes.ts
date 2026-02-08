import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/auth/auth.guard';
import { Role } from './core/models/role.enum';

export const routes: Routes = [
    // Auth Login Route
    {
        path: 'auth/login',
        canActivate: [noAuthGuard],
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    },

    {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard]
    },
    // FEATURES
    {
        path: 'add-dietitian',
        canActivate: [authGuard],
        data: { roles: [Role.Admin] },
        loadComponent: () => import('./features/dietitian-management/add-dietitian/add-dietitian.component').then(m => m.AddDietitianComponent)
    },
    {
        path: 'dietitian-management',
        canActivate: [authGuard],
        data: { roles: [Role.Admin] },
        loadComponent: () => import('./features/dietitian-management/dietitian-management.component').then(m => m.DietitianManagementComponent)
    },
    {
        path: 'registration',
        canActivate: [authGuard],
        data: { roles: [Role.Frontdesk] },
        loadComponent: () => import('./features/registration/registration.component').then(m => m.RegistrationComponent)
    },
    {
        path: 'patient-list',
        canActivate: [authGuard],
        data: { roles: [Role.Dietitian] },
        loadComponent: () => import('./features/patient-list/patient-list.component').then(m => m.PatientListComponent)
    },
    {
        path: 'appointments',
        canActivate: [authGuard],
        data: { roles: [Role.Dietitian] },
        loadComponent: () => import('./features/appointments/appointment.component').then(m => m.AppointmentComponent)
    },
    {
        path: 'doctor-selection',
        canActivate: [authGuard],
        data: { roles: [Role.Patient] },
        loadComponent: () => import('./features/doctor-selection/doctor-selection.component').then(m => m.DoctorSelectionComponent)
    },
    {
        path: 'diet-plan-view',
        canActivate: [authGuard],
        data: { roles: [Role.Patient] },
        loadComponent: () => import('./features/diet-plan-view/diet-plan-view.component').then(m => m.DietPlanViewComponent)
    },
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'auth/login'
    }
];
