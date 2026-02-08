import { Role } from '../models/role.enum';

export const PERMISSIONS = {
    [Role.Frontdesk]: {
        canRegisterPatient: true,
        canLogin: true // Only meaningful after registration, but Frontdesk user itself can login logic
    },
    [Role.Admin]: {
        canManageDietitians: true,
        canAddDietitian: true
    },
    [Role.Dietitian]: {
        canViewPatients: true,
        canScheduleAppointment: true,
        canAddDietPlan: true
    },
    [Role.Patient]: {
        canViewDoctors: true,
        canViewDietPlan: true
    }
};

export const MENU_ITEMS = {
    [Role.Frontdesk]: [
        { label: 'Register Patient', icon: 'pi pi-user-plus', routerLink: '/registration' }
    ],
    [Role.Admin]: [
        { label: 'Manage Dietitians', icon: 'pi pi-users', routerLink: '/dietitian-management' },
        { label: 'Add Dietitian', icon: 'pi pi-plus', routerLink: '/add-dietitian' }
    ],
    [Role.Dietitian]: [
        { label: 'My Patients', icon: 'pi pi-list', routerLink: '/patient-list' },
        { label: 'Appointments', icon: 'pi pi-calendar', routerLink: '/appointments' }
    ],
    [Role.Patient]: [
        { label: 'Find Doctor', icon: 'pi pi-search', routerLink: '/doctor-selection' },
        { label: 'My Diet Plan', icon: 'pi pi-book', routerLink: '/diet-plan-view' }
    ]
};
