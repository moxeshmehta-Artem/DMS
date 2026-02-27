import { Component, OnInit, inject } from '@angular/core';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { SharedUiModule } from '../../../../shared/modules/shared-ui.module';

import { MessageService } from 'primeng/api';
import { Appointment, AppointmentStatus } from '../../../../core/models/appointment.model';
import { StatusSeverityPipe } from '../../../../shared/pipes/status-severity.pipe';

@Component({
    selector: 'app-dietitian-dashboard',
    standalone: true,
    imports: [SharedUiModule, StatusSeverityPipe],
    providers: [MessageService],
    templateUrl: './dietitian-dashboard.component.html',
    styleUrls: ['./dietitian-dashboard.component.scss']
})
export class DietitianDashboardComponent implements OnInit {
    private appointmentService = inject(AppointmentService);
    private authService = inject(AuthService);
    private messageService = inject(MessageService);

    activeAppointments: Appointment[] = [];
    isLoading = false;

    ngOnInit() {
        this.loadPendingAppointments();
    }

    loadPendingAppointments() {
        const user = this.authService.currentUser();
        if (user) {
            this.isLoading = true;
            this.appointmentService.getAppointmentsForDietitian(user.id).subscribe({
                next: (data) => {
                    this.activeAppointments = data.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED');
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error('Failed to load active appointments', err);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load active appointments' });
                    this.isLoading = false;
                }
            });
        }
    }

    updateStatus(appt: Appointment, status: AppointmentStatus) {
        this.appointmentService.updateStatus(appt.id, status).subscribe({
            next: (updated) => {
                this.messageService.add({
                    severity: status === 'CONFIRMED' ? 'success' : 'warn',
                    summary: 'Updated',
                    detail: `Appointment ${status.toLowerCase()} successfully`
                });

                if (status === 'COMPLETED' || status === 'REJECTED' || status === 'CANCELLED') {
                    // Remove from dashboard list if it's no longer active
                    this.activeAppointments = this.activeAppointments.filter(a => a.id !== appt.id);
                } else {
                    // Update in place for status transitions like PENDING -> CONFIRMED
                    appt.status = updated.status;
                }
            },
            error: (err) => {
                console.error('Failed to update status', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update status' });
            }
        });
    }
}
