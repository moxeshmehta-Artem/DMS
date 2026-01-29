import { Injectable, signal } from '@angular/core';
import { Appointment } from '../models/appointment.model';
import { User } from '../models/user.model';
import { Role } from '../models/role.enum';
import { AuthService } from '../auth/auth.service'; // Added
import { inject } from '@angular/core'; // Added

@Injectable({
    providedIn: 'root'
})
export class AppointmentService {
    private authService = inject(AuthService); // Added

    private MOCK_APPOINTMENTS: Appointment[] = [
        {
            id: 1,
            patientId: 4,
            patientName: 'John Doe',
            dietitianId: 3,
            dietitianName: 'Sarah Dietitian',
            date: new Date(),
            timeSlot: '10:00 AM',
            status: 'Pending',
            description: 'Routine checkup'
        }
    ];

    // Mock Dietitians (Ideally fetched from UserService)
    private MOCK_DIETITIANS: { id: number, name: string, speciality: string }[] = [
        { id: 3, name: 'Sarah Dietitian', speciality: 'Weight Loss' },
        { id: 10, name: 'Dr. Mike Nutrition', speciality: 'Sports Nutrition' },
        { id: 11, name: 'Lisa Wellness', speciality: 'Diabetes Management' }
    ];

    getDietitians() {
        return this.MOCK_DIETITIANS;
    }

    addDoctor(doctor: { name: string, speciality: string, username?: string, password?: string }) {
        if (doctor.username && doctor.password) {
            // Create User Account first
            const nameParts = doctor.name.split(' ');
            const newUser = this.authService.registerDietitian({
                firstName: nameParts[0],
                lastName: nameParts.slice(1).join(' '),
                username: doctor.username
            }, doctor.password);

            // Use the User ID for the Doctor
            this.MOCK_DIETITIANS.push({
                id: newUser.id,
                name: doctor.name,
                speciality: doctor.speciality
            });
        } else {
            // Fallback for legacy (should not happen with new form)
            const newId = Math.max(...this.MOCK_DIETITIANS.map(d => d.id)) + 1;
            this.MOCK_DIETITIANS.push({
                id: newId,
                name: doctor.name,
                speciality: doctor.speciality
            });
        }
    }

    removeDoctor(id: number) {
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
            (a.status === 'Pending' || a.status === 'Confirmed')
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
