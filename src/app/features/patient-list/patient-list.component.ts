import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/auth/auth.service';
import { PatientService } from '../../core/services/patient.service';
import { MessageService, MenuItem } from 'primeng/api';
import { SharedUiModule } from '../../shared/modules/shared-ui.module';
import { Appointment } from '../../core/models/appointment.model';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    SharedUiModule,
    DatePipe
  ],
  providers: [MessageService],
  template: `
    <div class="p-4">
        <p-toast></p-toast>
        <p-card header="My Patients" subheader="Patients with active or past appointments">
            
            <p-table [value]="patients" [tableStyle]="{ 'min-width': '50rem' }">
                <ng-template pTemplate="header">
                    <tr>
                        <th style="width: 50px"></th>
                        <th>Name</th>
                        <th>Last Visit</th>
                        <th>Total Appointments</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-patient>
                    <tr>
                        <td>
                            <p-avatar icon="pi pi-user" shape="circle" styleClass="bg-primary-100 text-primary"></p-avatar>
                        </td>
                        <td class="font-bold">{{ patient.name }}</td>
                        <td>{{ patient.lastVisit | date:'mediumDate' }}</td>
                        <td>{{ patient.totalAppts }}</td>
                        <td>
                            <p-button icon="pi pi-ellipsis-v" [rounded]="true" [text]="true" (onClick)="showMenu($event, patient)"></p-button>
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="5" class="text-center p-4">
                            <span class="text-500">No patients found. Appointments usually link patients to you.</span>
                        </td>
                    </tr>
                </ng-template>
            </p-table>

        </p-card>

        <p-menu #menu [model]="menuItems" [popup]="true" appendTo="body"></p-menu>

        <!-- PATIENT DETAILS DIALOG -->
        <p-dialog [(visible)]="displayPatientDialog" [header]="selectedPatient?.name" [modal]="true" [style]="{width: '400px'}">
            <div class="flex flex-column gap-3" *ngIf="selectedPatientDetails">
                <div class="grid">
                    <div class="col-6 font-bold">Age:</div>
                    <div class="col-6">{{ selectedPatientDetails.dob | date:'mediumDate' }}</div>
                    
                    <div class="col-6 font-bold">Gender:</div>
                    <div class="col-6">{{ selectedPatientDetails.gender }}</div>
                    
                    <div class="col-12"><hr class="opacity-50"></div>
                    <div class="col-12 text-primary font-bold">Vitals</div>

                    <div class="col-6 font-bold">Height:</div>
                    <div class="col-6">{{ selectedPatientDetails.vitals?.height || '-' }} cm</div>

                    <div class="col-6 font-bold">Weight:</div>
                    <div class="col-6">{{ selectedPatientDetails.vitals?.weight || '-' }} kg</div>
                    
                    <div class="col-6 font-bold">Blood Pressure:</div>
                    <div class="col-6">
                        {{ selectedPatientDetails.vitals?.bloodPressureSys || '-' }}/{{ selectedPatientDetails.vitals?.bloodPressureDia || '-' }}
                    </div>

                    <div class="col-6 font-bold">Heart Rate:</div>
                    <div class="col-6">{{ selectedPatientDetails.vitals?.heartRate || '-' }} bpm</div>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Close" icon="pi pi-times" (onClick)="displayPatientDialog = false"></p-button>
            </ng-template>
        </p-dialog>
    </div>
    `
})
export class PatientListComponent implements OnInit {
  patients: any[] = [];

  // Dialog State
  displayPatientDialog = false;
  selectedPatient: any = null;
  selectedPatientDetails: any = null;

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
    // Currently using the cached users, eventually fetch from backend if needed
    const user = this.authService.getAllUsers().find(u => u.id === patient.id);
    if (user) {
      this.selectedPatientDetails = user;
      this.displayPatientDialog = true;
    }
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
