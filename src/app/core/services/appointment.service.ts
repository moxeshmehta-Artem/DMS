import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Appointment, AppointmentRequest, AppointmentStatus } from '../models/appointment.model';
import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';
import { Observable, map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AppointmentService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private userService = inject(UserService);
    private readonly API_URL = 'http://localhost:8080/api/v1/appointments';

    getDietitians() {
        return this.userService.getDietitians().pipe(
            map(users => users.map(u => ({
                id: u.id,
                name: (u.firstName && u.lastName)
                    ? `${u.firstName} ${u.lastName}`
                    : (u.firstName || u.lastName || u.username),
                speciality: 'Certified Dietitian',
                username: u.username
            })))
        );
    }

    getAllAppointments(): Observable<Appointment[]> {
        return this.http.get<Appointment[]>(this.API_URL);
    }

    getAppointmentsForPatient(patientId: number): Observable<Appointment[]> {
        return this.http.get<Appointment[]>(`${this.API_URL}/patient/${patientId}`);
    }

    getAppointmentsForDietitian(dietitianId: number): Observable<Appointment[]> {
        return this.http.get<Appointment[]>(`${this.API_URL}/provider/${dietitianId}`);
    }

    bookAppointment(appt: AppointmentRequest): Observable<Appointment> {
        return this.http.post<Appointment>(this.API_URL, appt);
    }

    updateStatus(id: number, status: AppointmentStatus, notes?: string): Observable<Appointment> {
        return this.http.put<Appointment>(`${this.API_URL}/${id}/status`, null, {
            params: {
                status: status,
                ...(notes ? { notes: notes } : {})
            }
        });
    }

    isSlotAvailable(dietitianId: number, date: string, timeSlot: string): Observable<boolean> {
        return this.getAppointmentsForDietitian(dietitianId).pipe(
            map(appts => !appts.some(a =>
                a.appointmentDate === date &&
                a.timeSlot === timeSlot &&
                (a.status === 'CONFIRMED' || a.status === 'PENDING')
            ))
        );
    }

    addDietitian(data: any): Observable<any> {
        return this.authService.registerDietitian(data, data.password);
    }

    getAvailableSlots(providerId: number, date: string): Observable<string[]> {
        return this.http.get<string[]>(`${this.API_URL}/available-slots`, {
            params: {
                providerId: providerId.toString(),
                date: date
            }
        });
    }

    removeDietitian(id: number): Observable<any> {
        return this.userService.deleteUser(id);
    }
}
