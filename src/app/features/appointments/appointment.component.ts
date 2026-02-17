import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/auth/auth.service';
import { Appointment, AppointmentStatus } from '../../core/models/appointment.model';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../core/services/patient.service';
import { VitalsService } from '../../core/services/vitals.service';
import { User } from '../../core/models/user.model';

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
    DialogModule,
    InputTextareaModule,
    FormsModule,
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
                        <td>
                            <span class="text-primary cursor-pointer hover:underline font-bold" (click)="viewPatient(appt.patientId)">{{ appt.patientName }}</span>
                        </td>
                        <td>{{ appt.appointmentDate | date:'mediumDate' }}</td>
                        <td>{{ appt.timeSlot }}</td>
                        <td>{{ appt.description }}</td>
                        <td>
                            <p-tag [value]="appt.status" [severity]="getSeverity(appt.status)"></p-tag>
                        </td>
                        <td>
                            <div class="flex gap-2" *ngIf="appt.status === 'PENDING'">
                                <p-button icon="pi pi-check" severity="success" [rounded]="true" [text]="true" pTooltip="Accept" (onClick)="updateStatus(appt, 'CONFIRMED')"></p-button>
                                <p-button icon="pi pi-times" severity="danger" [rounded]="true" [text]="true" pTooltip="Reject" (onClick)="updateStatus(appt, 'REJECTED')"></p-button>
                            </div>
                            <div class="flex gap-2" *ngIf="appt.status === 'CONFIRMED'">
                                <p-button label="Create Plan" icon="pi pi-book" severity="info" [rounded]="true" [outlined]="true" pTooltip="Create Diet Plan" (onClick)="openDietPlan(appt)"></p-button>
                                <p-button label="Complete" icon="pi pi-check-circle" severity="help" [rounded]="true" [outlined]="true" pTooltip="Mark as Completed" (onClick)="updateStatus(appt, 'COMPLETED')"></p-button>
                            </div>
                            <span *ngIf="appt.status === 'REJECTED' || appt.status === 'COMPLETED' || appt.status === 'CANCELLED'" class="text-500 font-italic">No actions</span>
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

        <!-- DIET PLAN DIALOG -->
        <p-dialog [(visible)]="displayDietPlanDialog" header="Create Diet Plan" [modal]="true" [style]="{width: '600px'}">
            <div class="flex flex-column gap-3 pt-2">
                <label class="font-bold">Plan Details for {{ selectedAppt?.patientName }}</label>
                
                <div class="grid p-fluid">
                    <div class="col-12 md:col-6">
                        <label class="block mb-2 font-bold">Breakfast <span class="text-red-500">*</span></label>
                        <textarea pInputTextarea [(ngModel)]="newPlan.breakfast" rows="3" placeholder="Oats, Eggs..." [ngClass]="{'ng-invalid ng-dirty': !newPlan.breakfast}"></textarea>
                        <small class="text-red-500" *ngIf="!newPlan.breakfast">Breakfast is required</small>
                    </div>
                    <div class="col-12 md:col-6">
                        <label class="block mb-2 font-bold">Lunch <span class="text-red-500">*</span></label>
                        <textarea pInputTextarea [(ngModel)]="newPlan.lunch" rows="3" placeholder="Salad, Chicken..." [ngClass]="{'ng-invalid ng-dirty': !newPlan.lunch}"></textarea>
                        <small class="text-red-500" *ngIf="!newPlan.lunch">Lunch is required</small>
                    </div>
                    <div class="col-12 md:col-6">
                        <label class="block mb-2 font-bold">Dinner <span class="text-red-500">*</span></label>
                        <textarea pInputTextarea [(ngModel)]="newPlan.dinner" rows="3" placeholder="Soup, Fish..." [ngClass]="{'ng-invalid ng-dirty': !newPlan.dinner}"></textarea>
                        <small class="text-red-500" *ngIf="!newPlan.dinner">Dinner is required</small>
                    </div>
                    <div class="col-12 md:col-6">
                        <label class="block mb-2 font-bold">Snacks</label>
                        <textarea pInputTextarea [(ngModel)]="newPlan.snacks" rows="3" placeholder="Nuts, Fruits..."></textarea>
                    </div>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Save & Complete" icon="pi pi-check" (onClick)="saveDietPlan()" [disabled]="!isPlanValid"></p-button>
            </ng-template>
        </p-dialog>

        <!-- PATIENT DETAILS DIALOG -->
        <p-dialog [(visible)]="displayPatientDialog" [header]="selectedPatient?.firstName + ' ' + selectedPatient?.lastName" [modal]="true" [style]="{width: '400px'}">
            <div class="flex flex-column gap-3" *ngIf="selectedPatient">
                <div class="grid">
                    <div class="col-6 font-bold">Age:</div>
                    <div class="col-6">{{ selectedPatient.dob | date:'mediumDate' }}</div>
                    
                    <div class="col-6 font-bold">Gender:</div>
                    <div class="col-6">{{ selectedPatient.gender }}</div>
                    
                    <div class="col-12"><hr class="opacity-50"></div>
                    <div class="col-12 text-primary font-bold">Vitals</div>

                    <div class="col-6 font-bold">Height:</div>
                    <div class="col-6">{{ selectedPatient.vitals?.height || '-' }} cm</div>

                    <div class="col-6 font-bold">Weight:</div>
                    <div class="col-6">{{ selectedPatient.vitals?.weight || '-' }} kg</div>
                    
                    <div class="col-6 font-bold">Blood Pressure:</div>
                    <div class="col-6">
                        {{ selectedPatient.vitals?.bloodPressureSys || '-' }}/{{ selectedPatient.vitals?.bloodPressureDia || '-' }}
                    </div>

                    <div class="col-6 font-bold">Heart Rate:</div>
                    <div class="col-6">{{ selectedPatient.vitals?.heartRate || '-' }} bpm</div>
                </div>
            </div>
        </p-dialog>
    </div>
  `
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
    const user = this.authService.getAllUsers().find(u => u.id === patientId);
    if (user) {
      this.selectedPatient = { ...user };

      // Fetch latest vitals from backend
      this.vitalsService.getLatestVitals(patientId).subscribe({
        next: (vitals) => {
          if (this.selectedPatient && this.selectedPatient.id === patientId) {
            this.selectedPatient.vitals = vitals;
          }
        },
        error: (err) => {
          console.warn('Could not fetch latest vitals', err);
          // Fallback to what we have or empty
        }
      });

      this.displayPatientDialog = true;
    }
  }

  updateStatus(appt: Appointment, status: AppointmentStatus) {
    this.appointmentService.updateStatus(appt.id, status).subscribe({
      next: (updated) => {
        appt.status = updated.status;
        this.messageService.add({
          severity: status === 'CONFIRMED' ? 'success' : 'warn',
          summary: status,
          detail: `Appointment has been ${status.toLowerCase()}.`
        });
      },
      error: (err) => {
        console.error('Update status failed', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update appointment status' });
      }
    });
  }

  getSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' | undefined {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'danger';
      case 'COMPLETED': return 'info';
      case 'CANCELLED': return 'danger';
      default: return undefined;
    }
  }
}
