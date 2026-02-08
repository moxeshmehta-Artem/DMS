import { Injectable, signal } from '@angular/core';
import { Appointment } from '../models/appointment.model';
import { AuthService } from '../auth/auth.service';
import { inject } from '@angular/core';
import { INITIAL_APPOINTMENTS, INITIAL_DIETITIANS } from '../constants/mock-data';

@Injectable({
    providedIn: 'root'
})
export class AppointmentService {
    private authService = inject(AuthService);

    private MOCK_APPOINTMENTS: Appointment[] = [...INITIAL_APPOINTMENTS as unknown as Appointment[]];

    // Mock Dietitians (Ideally fetched from UserService)
    private MOCK_DIETITIANS: { id: number, name: string, speciality: string }[] = [...INITIAL_DIETITIANS];

    getDietitians() {
        return this.MOCK_DIETITIANS;
    }

    addDietitian(dietitian: { name: string, speciality: string, username?: string, password?: string }) {
        if (dietitian.username && dietitian.password) {
            // Create User Account first
            const nameParts = dietitian.name.split(' ');
            const newUser = this.authService.registerDietitian({
                firstName: nameParts[0],
                lastName: nameParts.slice(1).join(' '),
                username: dietitian.username
            }, dietitian.password);

            // Use the User ID for the Dietitian
            this.MOCK_DIETITIANS.push({
                id: newUser.id,
                name: dietitian.name,
                speciality: dietitian.speciality
            });
        } else {
            // Fallback for legacy (should not happen with new form)
            const newId = Math.max(...this.MOCK_DIETITIANS.map(d => d.id)) + 1;
            this.MOCK_DIETITIANS.push({
                id: newId,
                name: dietitian.name,
                speciality: dietitian.speciality
            });
        }
    }

    removeDietitian(id: number) {
        this.MOCK_DIETITIANS = this.MOCK_DIETITIANS.filter(d => d.id !== id);
    }

    getAppointmentsForPatient(patientId: number): Appointment[] {
        return this.MOCK_APPOINTMENTS.filter(a => a.patientId === patientId);
    }

    getAppointmentsForDietitian(dietitianId: number): Appointment[] {
        return this.MOCK_APPOINTMENTS.filter(a => a.dietitianId === dietitianId);
    }

    hasActiveAppointment(patientId: number): boolean {
        return this.MOCK_APPOINTMENTS.some(a =>
            a.patientId === patientId &&
            (a.status === 'Pending' || a.status === 'Confirmed')
        );
    }

    isSlotAvailable(dietitianId: number, date: Date, timeSlot: string): boolean {
        return !this.MOCK_APPOINTMENTS.some(a =>
            a.dietitianId === dietitianId &&
            new Date(a.date).toDateString() === new Date(date).toDateString() &&
            a.timeSlot === timeSlot &&
            a.status === 'Confirmed'
        );
    }

    bookAppointment(appt: Omit<Appointment, 'id' | 'status'>): boolean {
        if (!this.isSlotAvailable(appt.dietitianId, appt.date, appt.timeSlot)) {
            return false;
        }

        const newAppt: Appointment = {
            ...appt,
            id: this.MOCK_APPOINTMENTS.length + 1,
            status: 'Pending'
        };
        this.MOCK_APPOINTMENTS.push(newAppt);
        return true;
    }

    updateStatus(id: number, status: 'Confirmed' | 'Rejected' | 'Completed'): void {
        const appt = this.MOCK_APPOINTMENTS.find(a => a.id === id);
        if (appt) {
            appt.status = status;
        }
    }

    getAllAppointments(): Appointment[] {
        return this.MOCK_APPOINTMENTS;
    }
}
