import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/auth/auth.service';
import { Appointment } from '../../core/models/appointment.model';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    ButtonModule,
    TagModule,
    ToastModule,
    DatePipe
  ],
  providers: [MessageService],
  template: `
    <div class="p-4">
        <p-toast></p-toast>
        <p-card header="Appointment Requests" subheader="Manage your upcoming schedule">
            <p-table [value]="appointments" [tableStyle]="{ 'min-width': '50rem' }">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Patient Name</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-appt>
                    <tr>
                        <td>{{ appt.patientName }}</td>
                        <td>{{ appt.date | date:'mediumDate' }}</td>
                        <td>{{ appt.timeSlot }}</td>
                        <td>{{ appt.description }}</td>
                        <td>
                            <p-tag [value]="appt.status" [severity]="getSeverity(appt.status)"></p-tag>
                        </td>
                        <td>
                            <div class="flex gap-2" *ngIf="appt.status === 'Pending'">
                                <p-button icon="pi pi-check" severity="success" [rounded]="true" [text]="true" pTooltip="Accept" (onClick)="updateStatus(appt, 'Confirmed')"></p-button>
                                <p-button icon="pi pi-times" severity="danger" [rounded]="true" [text]="true" pTooltip="Reject" (onClick)="updateStatus(appt, 'Rejected')"></p-button>
                            </div>
                            <span *ngIf="appt.status !== 'Pending'" class="text-500 font-italic">No actions</span>
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="6" class="text-center p-4">No appointment requests found.</td>
                    </tr>
                </ng-template>
            </p-table>
        </p-card>
    </div>
    `
})
export class AppointmentComponent implements OnInit {
  appointments: Appointment[] = [];

  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    // In a real app, use the logged in Dietitian's ID
    // For this demo, we can just show all appointments filtered by "dietitian" mock ID (which is 3 in AuthService)
    // Or better yet, check the current user's ID
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.appointments = this.appointmentService.getAppointmentsForDietitian(currentUser.id);
      // If empty (e.g. testing with a new user), maybe show a mock one for demo if they are a dietitian
      if (this.appointments.length === 0 && currentUser.role === 'Dietitian') {
        // Optional: Auto-generate one for visualization?
        // this.appointments = this.appointmentService.getAppointmentsForDietitian(3); 
      }
    }
  }

  updateStatus(appt: Appointment, status: 'Confirmed' | 'Rejected') {
    this.appointmentService.updateStatus(appt.id, status);
    appt.status = status; // Optimistic update
    this.messageService.add({
      severity: status === 'Confirmed' ? 'success' : 'warn',
      summary: status,
      detail: `Appointment has been ${status.toLowerCase()}.`
    });
  }

  getSeverity(status: string): 'success' | 'warning' | 'danger' | undefined {
    switch (status) {
      case 'Confirmed': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'danger';
      default: return undefined;
    }
  }
}
