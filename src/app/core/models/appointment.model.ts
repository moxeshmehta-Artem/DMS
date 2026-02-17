export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
    id: number;
    patientId: number;
    patientName: string;
    providerId: number;
    providerName: string;
    description: string;
    appointmentDate: string; // ISO format from backend
    timeSlot: string; // e.g. "10:00 AM"
    status: AppointmentStatus;
    notes?: string;
    success?: boolean;
    message?: string;
}

export interface AppointmentRequest {
    patientId: number;
    providerId: number;
    appointmentDate: string; // yyyy-MM-dd
    timeSlot: string;
    description: string;
}
