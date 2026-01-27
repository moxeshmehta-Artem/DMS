import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Added for ngModel
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/auth/auth.service';
import { PatientService } from '../../core/services/patient.service'; // Added

// PrimeNG
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { DialogModule } from 'primeng/dialog'; // Added
import { InputTextareaModule } from 'primeng/inputtextarea'; // Added
import { ToastModule } from 'primeng/toast'; // Added
import { MessageService } from 'primeng/api'; // Added

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    AvatarModule,
    DatePipe,
    DialogModule,
    InputTextareaModule,
    ToastModule
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
                            <p-button icon="pi pi-pencil" [rounded]="false" [text]="true" pTooltip="Add Note" (onClick)="addNote(patient)"></p-button>
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

        <!-- NOTE DIALOG -->
        <p-dialog [(visible)]="displayNoteDialog" [header]="'Diet Plan for ' + selectedPatient?.name" [modal]="true" [style]="{width: '600px'}">
            <div class="flex flex-column gap-3 pt-2">
                <label class="font-bold">Edit Diet Plan</label>
                <div class="grid p-fluid">
                    <div class="col-12 md:col-6">
                        <label class="block mb-2 font-bold">Breakfast</label>
                        <textarea pInputTextarea [(ngModel)]="newPlan.breakfast" rows="3"></textarea>
                    </div>
                    <div class="col-12 md:col-6">
                        <label class="block mb-2 font-bold">Lunch</label>
                        <textarea pInputTextarea [(ngModel)]="newPlan.lunch" rows="3"></textarea>
                    </div>
                    <div class="col-12 md:col-6">
                        <label class="block mb-2 font-bold">Dinner</label>
                        <textarea pInputTextarea [(ngModel)]="newPlan.dinner" rows="3"></textarea>
                    </div>
                    <div class="col-12 md:col-6">
                        <label class="block mb-2 font-bold">Snacks</label>
                        <textarea pInputTextarea [(ngModel)]="newPlan.snacks" rows="3"></textarea>
                    </div>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancel" icon="pi pi-times" styleClass="p-button-text" (onClick)="displayNoteDialog = false"></p-button>
                <p-button label="Save Plan" icon="pi pi-check" (onClick)="saveDietPlan()"></p-button>
            </ng-template>
        </p-dialog>
    </div>
    `
})
export class PatientListComponent implements OnInit {
  patients: any[] = [];

  // Dialog State
  displayNoteDialog = false;
  selectedPatient: any = null;
  newPlan = { breakfast: '', lunch: '', dinner: '', snacks: '' };

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

    const myAppts = this.appointmentService.getAppointmentsForDietitian(currentUser.id);

    const uniquePatientsMap = new Map();

    myAppts.forEach(appt => {
      if (!uniquePatientsMap.has(appt.patientId)) {
        uniquePatientsMap.set(appt.patientId, {
          id: appt.patientId,
          name: appt.patientName,
          lastVisit: appt.date,
          totalAppts: 0
        });
      }

      const existing = uniquePatientsMap.get(appt.patientId);
      existing.totalAppts++;

      if (new Date(appt.date) > new Date(existing.lastVisit)) {
        existing.lastVisit = appt.date;
      }
    });

    this.patients = Array.from(uniquePatientsMap.values());
  }

  addNote(patient: any) {
    this.selectedPatient = patient;
    const existingPlan = this.patientService.getDietPlan(patient.id);
    if (existingPlan) {
      this.newPlan = { ...existingPlan };
    } else {
      this.newPlan = { breakfast: '', lunch: '', dinner: '', snacks: '' };
    }
    this.displayNoteDialog = true;
  }

  saveDietPlan() {
    if (this.selectedPatient) {
      this.patientService.saveDietPlan(this.selectedPatient.id, this.newPlan);
      this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Diet plan updated.' });
      this.displayNoteDialog = false;
    }
  }
}
