import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { Appointment, AppointmentStatus } from '../../core/models/appointment.model';
import { StatusSeverityPipe } from '../../shared/pipes/status-severity.pipe';

import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../core/services/patient.service';
import { VitalsService } from '../../core/services/vitals.service';
import { User } from '../../core/models/user.model';
import { SharedUiModule } from '../../shared/modules/shared-ui.module';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule,
    SharedUiModule,
    FormsModule,
    DatePipe,
    StatusSeverityPipe
  ],
  providers: [MessageService],
  templateUrl: './appointment.component.html'
})
export class AppointmentComponent implements OnInit {
  appointments: Appointment[] = [];

  // Diet Plan State
  displayDietPlanDialog = false;
  newPlan = { breakfast: '', lunch: '', dinner: '', snacks: '' };
  selectedAppt: Appointment | null = null;

  // Patient Details State
  displayPatientDialog = false;
  selectedPatient: User | undefined;

  private appointmentService = inject(AppointmentService);
  private patientService = inject(PatientService);
  private userService = inject(UserService);
  private vitalsService = inject(VitalsService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.appointmentService.getAppointmentsForDietitian(currentUser.id).subscribe({
        next: (data) => {
          this.appointments = data;
        },
        error: (err) => {
          console.error('Failed to load appointments', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load appointments' });
        }
      });
    }
  }

  // DIET PLAN
  openDietPlan(appt: Appointment) {
    this.selectedAppt = appt;
    this.newPlan = { breakfast: '', lunch: '', dinner: '', snacks: '' };
    this.displayDietPlanDialog = true;
  }

  get isPlanValid(): boolean {
    return !!(this.newPlan.breakfast && this.newPlan.lunch && this.newPlan.dinner);
  }

  saveDietPlan() {
    if (this.selectedAppt && this.isPlanValid) {
      this.patientService.saveDietPlan(this.selectedAppt.patientId, this.newPlan).subscribe({
        next: () => {
          this.updateStatus(this.selectedAppt!, 'COMPLETED');
          this.displayDietPlanDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Plan Saved', detail: 'Diet plan created and appointment completed' });
        },
        error: (err) => {
          console.error('Failed to save diet plan', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save diet plan to database' });
        }
      });
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill in Breakfast, Lunch, and Dinner details' });
    }
  }

  // PATIENT DETAILS
  viewPatient(patientId: number) {
    this.userService.getUsers().subscribe((users: User[]) => {
      const user = users.find(u => u.id === patientId);
      if (user) {
        this.selectedPatient = { ...user };

        // Fetch latest vitals from backend
        this.vitalsService.getLatestVitals(patientId).subscribe({
          next: (vitals: any) => {
            if (this.selectedPatient && this.selectedPatient.id === patientId) {
              this.selectedPatient.vitals = vitals;
            }
          },
          error: (err: any) => {
            console.warn('Could not fetch latest vitals', err);
          }
        });

        this.displayPatientDialog = true;
      }
    });
  }

  updateStatus(appt: Appointment, status: AppointmentStatus) {
    this.appointmentService.updateStatus(appt.id, status).subscribe({
      next: (updated: Appointment) => {
        appt.status = updated.status;
        this.messageService.add({
          severity: status === 'CONFIRMED' ? 'success' : 'warn',
          summary: status,
          detail: `Appointment has been ${status.toLowerCase()}.`
        });
      },
      error: (err: any) => {
        console.error('Update status failed', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update appointment status' });
      }
    });
  }
}
