import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedUiModule } from '../../../../shared/modules/shared-ui.module';
import { StatusSeverityPipe } from '../../../../shared/pipes/status-severity.pipe';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Appointment } from '../../../../core/models/appointment.model';

@Component({
    selector: 'app-patient-dashboard',
    standalone: true,
    imports: [CommonModule, SharedUiModule, StatusSeverityPipe],
    template: `
    <div class="mt-4">
        <!-- Next Appointment Card -->
        <div class="grid mb-4" *ngIf="nextAppointment">
            <div class="col-12 md:col-6">
                <div class="surface-card shadow-2 p-4 border-round border-left-3 border-primary-500">
                    <div class="text-xl font-medium text-900 mb-2">Next Appointment</div>
                    <div class="flex align-items-center gap-3">
                        <div class="text-4xl font-bold text-primary">{{ nextAppointment.appointmentDate | date:'d' }}</div>
                        <div>
                            <div class="text-xl font-semibold">{{ nextAppointment.appointmentDate | date:'MMMM y' }}</div>
                            <div class="text-600">{{ nextAppointment.timeSlot }}</div>
                        </div>
                        <div class="ml-auto">
                            <p-tag [severity]="nextAppointment.status === 'CONFIRMED' ? 'success' : 'warning'" [value]="nextAppointment.status"></p-tag>
                        </div>
                    </div>
                    <div class="mt-3 text-600">
                        with <span class="font-medium text-900">{{ nextAppointment.providerName }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="surface-card p-4 shadow-2 border-round">
            <div class="text-2xl font-medium text-900 mb-3">My Appointments</div>
            <p-table [value]="myAppointments" [tableStyle]="{'min-width': '50rem'}">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Dietitian</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Notes</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-appt>
                    <tr>
                        <td>{{ appt.appointmentDate | date:'mediumDate' }}</td>
                        <td>{{ appt.timeSlot }}</td>
                        <td>{{ appt.providerName }}</td>
                        <td>{{ appt.description }}</td>
                        <td>
                            <p-tag [value]="appt.status" [severity]="appt.status | statusSeverity"></p-tag>
                        </td>
                        <td>
                            <span *ngIf="appt.notes">{{ appt.notes }}</span>
                            <span *ngIf="!appt.notes" class="text-500 font-italic">-</span>
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="6" class="text-center p-4">You have no scheduled appointments.</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    </div>
  `
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
