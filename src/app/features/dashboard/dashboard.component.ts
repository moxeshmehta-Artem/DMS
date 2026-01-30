import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { Role } from '../../core/models/role.enum';
import { MENU_ITEMS } from '../../core/constants/permissions';
import { StatusSeverityPipe } from '../../shared/pipes/status-severity.pipe';
import { SharedUiModule } from '../../shared/modules/shared-ui.module';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        SharedUiModule,
        StatusSeverityPipe
    ],
    template: `
    <div class="min-h-screen surface-ground">
      <!-- Content -->
      <div class="p-5">
        <div class="grid">
            <div class="col-12 md:col-6 lg:col-4" *ngFor="let item of menuItems">
                <div class="surface-card shadow-2 p-3 border-round cursor-pointer hover:surface-100 transition-duration-200"
                     (click)="navigateTo(item.routerLink)">
                    <div class="flex align-items-center mb-3">
                        <i [class]="item.icon" class="text-xl text-primary mr-2"></i>
                        <span class="text-900 font-medium text-xl">{{ item.label }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- FRONTDESK SPECIFIC: Patient Overview -->
        <div class="surface-card p-4 shadow-2 border-round mt-4" *ngIf="isFrontdesk">
            <div class="flex align-items-center justify-content-between mb-3">
                <div class="text-2xl font-medium text-900">Patient Overview</div>
                <p-button label="Register New Patient" icon="pi pi-user-plus" (onClick)="navigateTo('registration')"></p-button>
            </div>
            
            <p-table [value]="patientOverview" [tableStyle]="{'min-width': '60rem'}">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Patient Name</th>
                        <th>Username</th>
                        <th>Registration Status</th>
                        <th>Last/Next Appointment</th>
                        <th>Doctor</th>
                        <th>Status</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-patient>
                    <tr>
                        <td class="font-bold">{{ patient.firstName }} {{ patient.lastName }}</td>
                        <td>{{ patient.username }}</td>
                        <td><p-tag severity="success" value="Registered"></p-tag></td>
                        <td>
                            <span *ngIf="patient.latestAppointment">{{ patient.latestAppointment.date | date:'shortDate' }}</span>
                            <span *ngIf="!patient.latestAppointment" class="text-500">None</span>
                        </td>
                        <td>
                            <span *ngIf="patient.latestAppointment">{{ patient.latestAppointment.dietitianName }}</span>
                            <span *ngIf="!patient.latestAppointment">-</span>
                        </td>
                        <td>
                            <p-tag *ngIf="patient.latestAppointment" [severity]="patient.latestAppointment.status | statusSeverity" [value]="patient.latestAppointment.status"></p-tag>
                            <span *ngIf="!patient.latestAppointment">-</span>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <!-- PATIENT SPECIFIC: My Appointments -->
        <div class="surface-card p-4 shadow-2 border-round mt-4" *ngIf="isPatient">
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
                        <td>{{ appt.date | date:'mediumDate' }}</td>
                        <td>{{ appt.timeSlot }}</td>
                        <td>{{ appt.dietitianName }}</td>
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

        <div class="surface-card p-4 shadow-2 border-round mt-4" *ngIf="!isFrontdesk && !isPatient">
            <div class="text-2xl font-medium text-900 mb-3">Welcome to your Dashboard</div>
            <p class="text-600 line-height-3 mb-4">
                You are logged in as <strong>{{ currentUser()?.username }}</strong>. 
                Below are the features you have permission to access:
            </p>
            
            <div class="flex flex-wrap gap-2" *ngIf="userPermissions; else noPermissions">
                <p-chip *ngIf="userPermissions.includes('register_patient')" label="" icon="pi pi-check"></p-chip>
                <p-chip *ngIf="userPermissions.includes('manage_dietitians')" label="Manage Dietitians" icon="pi pi-check"></p-chip>
                <p-chip *ngIf="userPermissions.includes('manage_doctors')" label="Add Doctor" icon="pi pi-check"></p-chip>
                <p-chip *ngIf="userPermissions.includes('view_patients')" label="View Patients" icon="pi pi-check"></p-chip>
                <p-chip *ngIf="userPermissions.includes('schedule_appointment')" label="Schedule Appointment" icon="pi pi-check"></p-chip>
                <p-chip *ngIf="userPermissions.includes('add_diet_plan')" label="Add Diet Plan" icon="pi pi-check"></p-chip>
                <p-chip *ngIf="userPermissions.includes('view_doctors')" label="View Doctors" icon="pi pi-check"></p-chip>
                <p-chip *ngIf="userPermissions.includes('view_diet_plan')" label="View Diet Plan" icon="pi pi-check"></p-chip>
            </div>
            <ng-template #noPermissions>
                <p>No special permissions assigned.</p>
            </ng-template>
        </div>
      </div>
    </div>
    `
})
export class DashboardComponent implements OnInit {
    currentUser = this.authService.currentUser;
    menuItems: any[] = [];

    patientOverview: any[] = [];
    myAppointments: any[] = []; // for patients
    isFrontdesk = false;
    isPatient = false;

    private appointmentService = inject(AppointmentService);

    constructor(private authService: AuthService, private router: Router) { }

    get userPermissions(): string[] {
        return this.currentUser()?.permissions || [];
    }

    ngOnInit() {
        const role = this.authService.getUserRole();
        if (role) {
            this.menuItems = MENU_ITEMS[role] || [];
            this.isFrontdesk = role === Role.Frontdesk;
            this.isPatient = role === Role.Patient;

            if (this.isFrontdesk) {
                this.loadPatientOverview();
            } else if (this.isPatient) {
                this.loadMyAppointments();
            }
        }
    }

    loadMyAppointments() {
        const user = this.currentUser();
        if (user) {
            this.myAppointments = this.appointmentService.getAppointmentsForPatient(user.id);
        }
    }

    loadPatientOverview() {
        const allUsers = this.authService.getAllUsers();
        const patients = allUsers.filter(u => u.role === Role.Patient);
        const allAppointments = this.appointmentService.getAllAppointments();

        this.patientOverview = patients.map(patient => {
            // Find latest appointment
            const patientAppts = allAppointments.filter(a => a.patientId === patient.id);
            const latestAppt = patientAppts.length > 0 ? patientAppts[patientAppts.length - 1] : null;

            return {
                ...patient,
                latestAppointment: latestAppt
            };
        });
    }

    navigateTo(path: string) {
        this.router.navigate([path]);
    }

    logout() {
        this.authService.logout();
    }
}
