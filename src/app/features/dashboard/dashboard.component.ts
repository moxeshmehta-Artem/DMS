import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { Role } from '../../core/models/role.enum';
import { MENU_ITEMS } from '../../core/constants/permissions';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { ChipModule } from 'primeng/chip';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        CardModule,
        ButtonModule,
        MenubarModule,
        AvatarModule,
        ChipModule,
        TableModule,
        TagModule
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
                            <p-tag *ngIf="patient.latestAppointment" [severity]="getSeverity(patient.latestAppointment.status)" [value]="patient.latestAppointment.status"></p-tag>
                            <span *ngIf="!patient.latestAppointment">-</span>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <div class="surface-card p-4 shadow-2 border-round mt-4" *ngIf="!isFrontdesk">
            <div class="text-2xl font-medium text-900 mb-3">Welcome to your Dashboard</div>
            <p class="text-600 line-height-3 mb-4">
                You are logged in as <strong>{{ currentUser()?.username }}</strong>. 
                Below are the features you have permission to access:
            </p>
            
            <div class="flex flex-wrap gap-2" *ngIf="userPermissions; else noPermissions">
                <p-chip *ngIf="userPermissions.includes('register_patient')" label="Register Patient" icon="pi pi-check"></p-chip>
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
    isFrontdesk = false;

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

            if (this.isFrontdesk) {
                this.loadPatientOverview();
            }
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

    getSeverity(status: string): 'success' | 'warning' | 'danger' | undefined {
        switch (status) {
            case 'Confirmed': return 'success';
            case 'Pending': return 'warning';
            case 'Rejected': return 'danger';
            default: return undefined;
        }
    }

    navigateTo(path: string) {
        this.router.navigate([path]);
    }

    logout() {
        this.authService.logout();
    }
}
