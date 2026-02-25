import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedUiModule } from '../../../../shared/modules/shared-ui.module';
import { StatusSeverityPipe } from '../../../../shared/pipes/status-severity.pipe';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Appointment } from '../../../../core/models/appointment.model';
import { CardModule } from 'primeng/card';

@Component({
    selector: 'app-patient-dashboard',
    standalone: true,
    imports: [CommonModule, SharedUiModule, StatusSeverityPipe, CardModule],
    templateUrl: './patient-dashboard.component.html'
})
export class PatientDashboardComponent implements OnInit {
    private appointmentService = inject(AppointmentService);
    private authService = inject(AuthService);
    currentUser = this.authService.currentUser;

    myAppointments: Appointment[] = [];
    nextAppointment: Appointment | null = null;

    ngOnInit() {
        this.loadMyAppointments();
    }

    loadMyAppointments() {
        const user = this.currentUser();
        if (user) {
            this.appointmentService.getAppointmentsForPatient(user.id).subscribe({
                next: (data) => {
                    this.myAppointments = data;

                    // Find next upcoming appointment
                    const now = new Date();
                    now.setHours(0, 0, 0, 0);

                    this.nextAppointment = this.myAppointments
                        .filter(a => new Date(a.appointmentDate) >= now && (a.status === 'CONFIRMED' || a.status === 'PENDING'))
                        .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())[0] || null;
                },
                error: (err) => console.error('Failed to load patient appointments', err)
            });
        }
    }
}
