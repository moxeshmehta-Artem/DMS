export interface Appointment {
    id: number;
    patientId: number;
    patientName: string;
    dietitianId: number;
    dietitianName: string;
    description: string;
    date: Date;
    timeSlot: string; // e.g. "10:00 AM"
    status: 'Pending' | 'Confirmed' | 'Rejected';
    notes?: string;
}
