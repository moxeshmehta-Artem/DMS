import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { Role } from '../models/role.enum';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly USER_KEY = 'mock_auth_user';
    currentUser = signal<User | null>(null);

    constructor(private router: Router) {
        this.restoreSession();
    }

    private restoreSession() {
        if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem(this.USER_KEY);
            if (stored) {
                this.currentUser.set(JSON.parse(stored));
            }
        }
    }

    // MOCK USERS DATABASE
    private MOCK_USERS: (User & { password: string })[] = [
        {
            id: 1,
            username: 'admin',
            password: '123',
            role: Role.Admin,
            firstName: 'Super',
            lastName: 'Admin',
            permissions: ['add_dietitian', 'manage_dietitians']
        },
        {
            id: 2,
            username: 'frontdesk',
            password: '123',
            role: Role.Frontdesk,
            firstName: 'Front',
            lastName: 'Desk',
            permissions: ['register_patient']
        },
        {
            id: 3,
            username: 'dietitian',
            password: '123',
            role: Role.Dietitian,
            firstName: 'Sarah',
            lastName: 'Dietitian',
            permissions: ['view_patients', 'schedule_appointment', 'add_diet_plan']
        },
        {
            id: 4,
            username: 'patient',
            password: '123',
            role: Role.Patient,
            firstName: 'John',
            lastName: 'Doe',
            permissions: ['view_doctors', 'view_diet_plan']
        }
    ];

    // MOCK LOGIN
    login(username: string, password?: string): boolean {
        const foundUser = this.MOCK_USERS.find(u => u.username === username && u.password === (password || '123'));

        if (foundUser) {
            // Simulating a JWT Token
            const mockToken = `mock-jwt-token-${Math.random().toString(36).substring(7)}`;

            const user: User = {
                id: foundUser.id,
                username: foundUser.username,
                role: foundUser.role,
                firstName: foundUser.firstName,
                lastName: foundUser.lastName,
                permissions: foundUser.permissions,
                token: mockToken
            };

            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
            this.currentUser.set(user);
            return true;
        }

        return false;
    }

    logout() {
        localStorage.removeItem(this.USER_KEY);
        this.currentUser.set(null);
        this.router.navigate(['/auth/login']);
    }

    isAuthenticated(): boolean {
        return !!this.currentUser();
    }

    getUserRole(): Role | undefined {
        return this.currentUser()?.role;
    }

    registerPatient(user: User, password: string): boolean {
        // Generate a new ID
        const newId = Math.max(...this.MOCK_USERS.map(u => u.id)) + 1;

        const newUser: User & { password: string } = {
            ...user,
            id: newId,
            password: password,
            role: Role.Patient,
            permissions: ['view_doctors', 'view_diet_plan']
        };

        this.MOCK_USERS.push(newUser);
        return true;
    }

    registerDietitian(user: Partial<User>, password: string): User {
        const newId = Math.max(...this.MOCK_USERS.map(u => u.id)) + 1;

        const newUser: User & { password: string } = {
            id: newId,
            username: user.username!,
            password: password,
            role: Role.Dietitian,
            firstName: user.firstName!,
            lastName: user.lastName!,
            permissions: ['view_patients', 'schedule_appointment', 'add_diet_plan'],
            token: '' // No token on registration
        };

        this.MOCK_USERS.push(newUser);
        return newUser;
    }

    getAllUsers(): User[] {
        return this.MOCK_USERS;
    }
}
