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
        <p-dialog [(visible)]="displayPatientDialog" [header]="selectedPatient?.name" [modal]="true" [style]="{width: '600px'}">
            <div class="flex flex-column gap-3" *ngIf="selectedPatientDetails">
                
                <div class="grid">
                    <!-- Column 1: Profile -->
                    <div class="col-6">
                        <h4 class="mt-0 mb-3 text-500">Profile</h4>
                        <div class="grid">
                             <div class="col-4 font-bold">Age:</div>
                             <div class="col-8">{{ selectedPatientDetails.age || '-' }}</div>
                             
                             <div class="col-4 font-bold">Gender:</div>
                             <div class="col-8">{{ selectedPatientDetails.gender }}</div>
                             
                             <div class="col-4 font-bold">Email:</div>
                             <div class="col-8" style="word-break: break-all;">{{ selectedPatientDetails.email }}</div>
                        </div>
                    </div>

                    <!-- Column 2: Latest Vitals (Fetched from History) -->
                    <div class="col-6 border-left-1 surface-border pl-3">
                        <h4 class="mt-0 mb-3 text-500">Latest Vitals</h4>
                        <div class="grid" *ngIf="latestVital; else noVitals">
                             <div class="col-5 font-bold">Height:</div>
                             <div class="col-7">{{ latestVital.height || '-' }} cm</div>

                             <div class="col-5 font-bold">Weight:</div>
                             <div class="col-7">{{ latestVital.weight || '-' }} kg</div>
                             
                             <div class="col-5 font-bold">BP:</div>
                             <div class="col-7">
                                {{ latestVital.bloodPressureSys || '-' }}/{{ latestVital.bloodPressureDia || '-' }}
                             </div>

                             <div class="col-5 font-bold">Heart Rate:</div>
                             <div class="col-7">{{ latestVital.heartRate || '-' }} bpm</div>
                        </div>
                        <ng-template #noVitals>
                            <div class="text-500 font-italic">No vitals recorded.</div>
                        </ng-template>
                    </div>
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
