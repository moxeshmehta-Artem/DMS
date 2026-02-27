import { Component, OnInit, inject } from '@angular/core';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { SharedUiModule } from '../../../../shared/modules/shared-ui.module';

import { MessageService } from 'primeng/api';
import { Appointment } from '../../../../core/models/appointment.model';

@Component({
    selector: 'app-dietitian-dashboard',
    standalone: true,
    imports: [SharedUiModule],
    providers: [MessageService],
    templateUrl: './dietitian-dashboard.component.html',
    styleUrls: ['./dietitian-dashboard.component.scss']
})
export class DietitianDashboardComponent implements OnInit {
    private appointmentService = inject(AppointmentService);
    private authService = inject(AuthService);
    private messageService = inject(MessageService);

    pendingAppointments: Appointment[] = [];
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
                    this.pendingAppointments = data.filter(a => a.status === 'PENDING');
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error('Failed to load pending appointments', err);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load pending appointments' });
                    this.isLoading = false;
                }
            });
        }
    }

    updateStatus(appt: Appointment, status: 'CONFIRMED' | 'REJECTED') {
        this.appointmentService.updateStatus(appt.id, status).subscribe({
            next: (updated) => {
                this.messageService.add({
                    severity: status === 'CONFIRMED' ? 'success' : 'warn',
                    summary: 'Updated',
                    detail: `Appointment ${status.toLowerCase()} successfully`
                });
                // Remove from pending list
                this.pendingAppointments = this.pendingAppointments.filter(a => a.id !== appt.id);
            },
            error: (err) => {
                console.error('Failed to update status', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update status' });
            }
        });
    }
}
