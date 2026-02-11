import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { Role } from '../models/role.enum';
import { tap, catchError, map } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

// Aligning with Backend DTOs
export interface JwtResponse {
    token: string;
    id: number;
    username: string;
    email: string;
    roles: string[];
    type: string;
}

export interface LoginRequest {
    username: string;
    password?: string;
}

export interface SignupRequest {
    username: string;
    email: string;
    password: string;
    role: string;
    firstName?: string;
    lastName?: string;
    // Vitals could be a separate call or added to DTO if backend supports it
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly USER_KEY = 'auth_user';
    // TODO: Use environment variable
    private readonly API_URL = 'http://localhost:8080/api/auth';

    private http = inject(HttpClient);
    private router = inject(Router);

    currentUser = signal<User | null>(null);

    constructor() {
        this.restoreSession();
    }

    private restoreSession() {
        if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem(this.USER_KEY);
            if (stored) {
                try {
                    const user = JSON.parse(stored);
                    this.currentUser.set(user);
                } catch (e) {
                    console.error('Error parsing stored user', e);
                    this.logout();
                }
            }
        }
    }

    login(credentials: LoginRequest): Observable<User> {
        return this.http.post<JwtResponse>(`${this.API_URL}/login`, credentials).pipe(
            map(response => {
                // Map Backend JWT Response to Frontend User Model
                const user: User = {
                    id: response.id,
                    username: response.username,
                    // Handle role parsing (Backend sends List<String>, Frontend expects Role enum)
                    role: this.mapBackendRoleToEnum(response.roles),
                    firstName: response.username, // logical fallback as backend Login response might not have full details yet
                    lastName: '',
                    email: response.email,
                    token: response.token,
                    permissions: [] // Permissions logic can be expanded
                };

                this.saveUser(user);
                return user;
            })
        );
    }

    register(userData: SignupRequest): Observable<any> {
        return this.http.post(`${this.API_URL}/register`, userData);
    }

    // Helper for Patient Registration (matches registration component usage)
    registerPatient(userModel: User, password: string): Observable<any> {
        const signupRequest: SignupRequest = {
            username: userModel.username,
            email: userModel.email || '', // Ensure email is present
            password: password,
            role: 'ROLE_PATIENT',
            firstName: userModel.firstName,
            lastName: userModel.lastName
        };
        console.log('Registering Patient with payload:', signupRequest);
        // Note: detailed medical info (vitals, address) might need a separate endpoint 
        // or the backend SignupRequest needs to be updated. 
        // For now we register the user account.
        return this.register(signupRequest);
    }

    logout() {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(this.USER_KEY);
        }
        this.currentUser.set(null);
        this.router.navigate(['/auth/login']);
    }

    isAuthenticated(): boolean {
        return !!this.currentUser();
    }

    getUserRole(): Role | undefined {
        return this.currentUser()?.role;
    }

    getToken(): string | undefined {
        return this.currentUser()?.token;
    }

    private saveUser(user: User) {
        this.currentUser.set(user);
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
    }

    // TEMPORARY: Keep mock for other components until they are connected to backend
    private MOCK_USERS: User[] = [
        {
            id: 1,
            username: 'admin',
            role: Role.Admin,
            firstName: 'Super',
            lastName: 'Admin',
            permissions: ['add_dietitian', 'manage_dietitians'],
            email: 'admin@test.com',
            token: ''
        },
        {
            id: 2,
            username: 'frontdesk',
            role: Role.Frontdesk,
            firstName: 'Front',
            lastName: 'Desk',
            permissions: ['register_patient'],
            email: 'frontdesk@test.com',
            token: ''
        },
        {
            id: 3,
            username: 'dietitian',
            role: Role.Dietitian,
            firstName: 'Sarah',
            lastName: 'Dietitian',
            permissions: ['view_patients', 'schedule_appointment', 'add_diet_plan'],
            email: 'dietitian@test.com',
            token: ''
        },
        {
            id: 4,
            username: 'patient',
            role: Role.Patient,
            firstName: 'John',
            lastName: 'Doe',
            permissions: ['view_doctors', 'view_diet_plan'],
            email: 'patient@test.com',
            token: ''
        }
    ];

    // Updated to fetch REAL users from backend
    getUsers(): Observable<User[]> {
        return this.http.get<any[]>(`${this.API_URL.replace('/auth', '/users')}`).pipe(
            map(users => users.map(u => ({
                id: u.id,
                username: u.username,
                role: this.mapBackendRoleToEnum([u.role || u.roles?.[0] || 'ROLE_PATIENT']), // Handle potential format differences
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
                token: '', // Not needed for list
                permissions: []
            })))
        );
    }

    // Helper to get only patients
    getAllPatients(): Observable<User[]> {
        return this.http.get<any[]>(`${this.API_URL.replace('/auth', '/users/patients')}`).pipe(
            map(users => users.map(u => ({
                id: u.id,
                username: u.username,
                role: Role.Patient,
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
                token: '',
                permissions: []
            })))
        );
    }

    // Legacy Mock - eventually remove
    getAllUsers(): User[] {
        return this.MOCK_USERS;
    }

    registerDietitian(user: Partial<User>, password: string): Observable<any> {
        const signupRequest: SignupRequest = {
            username: user.username!,
            email: user.username + '@test.com', // Fallback email generation if not provided in UI
            password: password,
            role: 'ROLE_DIETITIAN',
            firstName: user.firstName,
            lastName: user.lastName
        };
        return this.register(signupRequest);
    }

    private mapBackendRoleToEnum(roles: string[]): Role {
        if (!roles || roles.length === 0) return Role.Patient;

        const roleStr = roles[0].replace('ROLE_', '').toUpperCase();

        // Simple mapping logic
        if (roleStr === 'ADMIN') return Role.Admin;
        if (roleStr === 'DIETITIAN') return Role.Dietitian;
        if (roleStr === 'FRONTDESK') return Role.Frontdesk;
        if (roleStr === 'PATIENT') return Role.Patient;

        return Role.Patient;
    }
}
