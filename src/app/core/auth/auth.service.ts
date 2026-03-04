import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { Role } from '../models/role.enum';
import { tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { JwtResponse, LoginRequest, SignupRequest } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly TOKEN_KEY = 'auth_token';
    private readonly API_URL = 'http://localhost:8080/api/auth';

    private http = inject(HttpClient);
    private router = inject(Router);

    currentUser = signal<User | null>(null);

    constructor() {
        this.restoreSession();
    }

    private restoreSession() {
        if (typeof localStorage !== 'undefined') {
            const token = localStorage.getItem(this.TOKEN_KEY);
            if (token) {
                const user = this.decodeToken(token);
                if (user) {
                    this.currentUser.set(user);
                } else {
                    this.logout();
                }
            }
        }
    }

    private decodeToken(token: string): User | null {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                id: payload.id,
                username: payload.sub,
                role: this.mapBackendRoleToEnum([payload.role]),
                token: token,
                permissions: [],
                firstName: payload.sub, // Fallback as names are not in token
                lastName: ''
            };
        } catch (e) {
            console.error('Error decoding token', e);
            return null;
        }
    }

    login(credentials: LoginRequest): Observable<User> {
        return this.http.post<JwtResponse>(`${this.API_URL}/login`, credentials).pipe(
            map(response => {
                const user: User = {
                    id: response.id,
                    username: response.username,
                    role: this.mapBackendRoleToEnum(response.roles),
                    firstName: response.username,
                    lastName: '',
                    email: response.email,
                    token: response.token,
                    permissions: []
                };

                this.saveToken(response.token, user);
                return user;
            })
        );
    }

    register(userData: SignupRequest): Observable<any> {
        return this.http.post(`${this.API_URL}/register`, userData);
    }

    registerPatient(userModel: User, password: string): Observable<any> {
        const signupRequest: SignupRequest = {
            username: userModel.username,
            email: userModel.email || '',
            password: password,
            role: 'ROLE_PATIENT',
            firstName: userModel.firstName,
            lastName: userModel.lastName,
            phone: userModel.phone,
            gender: userModel.gender,
            dateOfBirth: userModel.dob ? (userModel.dob instanceof Date ? userModel.dob.toISOString().split('T')[0] : userModel.dob) : undefined
        };
        return this.register(signupRequest);
    }

    registerDietitian(user: Partial<User>, password: string): Observable<any> {
        const signupRequest: SignupRequest = {
            username: user.username!,
            email: user.email || '',
            password: password,
            role: 'ROLE_DIETITIAN',
            firstName: user.firstName,
            lastName: user.lastName
        };
        return this.register(signupRequest);
    }

    logout() {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(this.TOKEN_KEY);
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

    private saveToken(token: string, user: User) {
        this.currentUser.set(user);
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.TOKEN_KEY, token);
        }
    }

    private mapBackendRoleToEnum(roles: string[]): Role {
        if (!roles || roles.length === 0) return Role.Patient;
        const roleStr = roles[0].replace('ROLE_', '').toUpperCase();

        if (roleStr === 'ADMIN') return Role.Admin;
        if (roleStr === 'DIETITIAN') return Role.Dietitian;
        if (roleStr === 'FRONTDESK') return Role.Frontdesk;
        return Role.Patient;
    }
}
