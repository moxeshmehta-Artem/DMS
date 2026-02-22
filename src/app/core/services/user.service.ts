import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Role } from '../models/role.enum';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly API_URL = 'http://localhost:8080/api/users';
    private http = inject(HttpClient);

    getUsers(): Observable<User[]> {
        return this.http.get<any[]>(this.API_URL).pipe(
            map(users => users.map(u => this.mapToUser(u)))
        );
    }

    getAllPatients(): Observable<User[]> {
        return this.http.get<any[]>(`${this.API_URL}/patients`).pipe(
            map(users => users.map(u => ({
                ...this.mapToUser(u),
                role: Role.Patient
            })))
        );
    }

    getDietitians(): Observable<User[]> {
        return this.http.get<any[]>(`${this.API_URL}/dietitians`).pipe(
            map(users => users.map(u => ({
                ...this.mapToUser(u),
                role: Role.Dietitian
            })))
        );
    }

    deleteUser(id: number): Observable<any> {
        return this.http.delete(`${this.API_URL}/${id}`);
    }

    private mapToUser(u: any): User {
        return {
            id: u.id,
            username: u.username,
            role: this.mapBackendRoleToEnum([u.role || u.roles?.[0] || 'ROLE_PATIENT']),
            firstName: u.firstName,
            lastName: u.lastName,
            gender: u.gender,
            email: u.email,
            phone: u.phone,
            age: u.age,
            permissions: [],
            token: ''
        };
    }

    mapBackendRoleToEnum(roles: string[]): Role {
        if (!roles || roles.length === 0) return Role.Patient;
        const roleStr = roles[0].replace('ROLE_', '').toUpperCase();

        switch (roleStr) {
            case 'ADMIN': return Role.Admin;
            case 'DIETITIAN': return Role.Dietitian;
            case 'FRONTDESK': return Role.Frontdesk;
            default: return Role.Patient;
        }
    }
}
