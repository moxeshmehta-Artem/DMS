import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/auth/auth.service';
import { PatientService } from '../../core/services/patient.service';
import { MessageService, MenuItem } from 'primeng/api';
import { SharedUiModule } from '../../shared/modules/shared-ui.module';
import { Appointment } from '../../core/models/appointment.model';
import { forkJoin } from 'rxjs'; // Import forkJoin

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    SharedUiModule,
    DatePipe
  ],
  providers: [MessageService],
  templateUrl: './patient-list.component.html'
})
export class PatientListComponent implements OnInit {
  patients: any[] = [];

  // Dialog State
  displayPatientDialog = false;
  selectedPatient: any = null;
  selectedPatientDetails: any = null;
  latestVital: any = null;

  menuItems: MenuItem[] | undefined;

  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private patientService = inject(PatientService);
  private messageService = inject(MessageService);

  ngOnInit() {
    this.loadMyPatients();
  }

  loadMyPatients() {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    this.appointmentService.getAppointmentsForDietitian(currentUser.id).subscribe({
      next: (myAppts) => {
        const uniquePatientsMap = new Map();

        myAppts.forEach((appt: Appointment) => {
          if (!uniquePatientsMap.has(appt.patientId)) {
            uniquePatientsMap.set(appt.patientId, {
              id: appt.patientId,
              name: appt.patientName,
              lastVisit: appt.appointmentDate,
              status: appt.status,
              latestApptId: appt.id,
              totalAppts: 0
            });
          }

          const existing = uniquePatientsMap.get(appt.patientId);
          existing.totalAppts++;

          if (new Date(appt.appointmentDate) > new Date(existing.lastVisit)) {
            existing.lastVisit = appt.appointmentDate;
            existing.status = appt.status;
            existing.latestApptId = appt.id;
          }
        });

        this.patients = Array.from(uniquePatientsMap.values());
      },
      error: (err) => {
        console.error('Failed to load patient appointments', err);
      }
    });
  }

  @ViewChild('menu') menu!: any; // Access the menu component

  showMenu(event: any, patient: any) {
    this.selectedPatient = patient;
    this.menuItems = [
      {
        label: 'Actions',
        items: [
          {
            label: 'View Patient Details',
            icon: 'pi pi-eye',
            command: () => this.viewPatientDetails(patient)
          },
          {
            label: 'Mark Consultation Complete',
            icon: 'pi pi-check-circle',
            visible: patient.status === 'CONFIRMED',
            command: () => this.completeConsultation(patient)
          },
          {
            label: 'Status: ' + patient.status,
            icon: 'pi pi-info-circle',
            disabled: true
          }
        ]
      }
    ];
    this.menu.toggle(event);
  }

  viewPatientDetails(patient: any) {
    this.selectedPatientDetails = null; // Reset
    this.latestVital = null; // Reset

    forkJoin({
      details: this.patientService.getPatientById(patient.id),
      history: this.patientService.getVitalsHistory(patient.id)
    }).subscribe({
      next: ({ details, history }) => {
        this.selectedPatientDetails = details;
        // Assuming history is sorted desc by backend (VitalsService.getVitalsHistory does this)
        this.latestVital = history && history.length > 0 ? history[0] : null;
        this.displayPatientDialog = true;
      },
      error: (err) => {
        console.error('Failed to load patient data', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load patient data' });
      }
    });
  }

  completeConsultation(patient: any) {
    if (patient.latestApptId) {
      this.appointmentService.updateStatus(patient.latestApptId, 'COMPLETED').subscribe({
        next: () => {
          patient.status = 'COMPLETED';
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Consultation marked as complete' });
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update consultation status' });
        }
      });
    }
  }
}
