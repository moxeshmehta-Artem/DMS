import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Role } from '../../core/models/role.enum';
import { MENU_ITEMS } from '../../core/constants/permissions';
import { SharedUiModule } from '../../shared/modules/shared-ui.module';
import { FrontDeskDashboardComponent } from './components/front-desk-dashboard/front-desk-dashboard.component';
import { PatientDashboardComponent } from './components/patient-dashboard/patient-dashboard.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule, // Add CommonModule to imports
        SharedUiModule,
        FrontDeskDashboardComponent,
        PatientDashboardComponent,
        AdminDashboardComponent
    ],
    template: `
    <div class="min-h-screen surface-ground">
        <!-- Content -->
      <div class="p-5">
        
        <!-- Menu Grid -->
        <div class="grid">
            <div class="col-12 md:col-6 lg:col-4" *ngFor="let item of menuItems">
                <div class="surface-card shadow-2 p-3 border-round cursor-pointer hover:shadow-4 hover:-translate-y-1 hover:bg-primary-50 transition-all transition-duration-300 border-left-3 border-primary"
                     (click)="navigateTo(item.routerLink)">
                    <div class="flex align-items-center mb-3">
                        <div class="flex align-items-center justify-content-center bg-primary-50 border-round mr-3" style="width:3rem;height:3rem">
                             <i [class]="item.icon" class="text-xl text-primary"></i>
                        </div>
                        <span class="text-900 font-bold text-xl">{{ item.label }}</span>
                        <i class="pi pi-arrow-right ml-auto text-primary-300"></i>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- FRONTDESK DASHBOARD -->
        <app-front-desk-dashboard *ngIf="isFrontdesk"></app-front-desk-dashboard>

        <!-- PATIENT DASHBOARD -->
        <app-patient-dashboard *ngIf="isPatient"></app-patient-dashboard>

        <!-- ADMIN DASHBOARD -->
        <app-admin-dashboard *ngIf="isAdmin"></app-admin-dashboard>

        <!-- NO ROLE / GENERIC VIEW -->
        <div class="surface-card p-4 shadow-2 border-round mt-4" *ngIf="!isFrontdesk && !isPatient && !isAdmin">
            <div class="text-2xl font-medium text-900 mb-3">Welcome to your Dashboard</div>
            <p class="text-600 line-height-3 mb-4">
                You are logged in as <strong>{{ currentUser()?.username }}</strong>. 
                Below are the features you have permission to access:
            </p>
            
            <div class="flex flex-wrap gap-2" *ngIf="userPermissions; else noPermissions">
                <p-chip *ngIf="userPermissions.includes('register_patient')" label="" icon="pi pi-check"></p-chip>
                <p-chip *ngIf="userPermissions.includes('add_dietitian')" label="Add Dietitian" icon="pi pi-check"></p-chip>
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
    isFrontdesk = false;
    isPatient = false;
    isAdmin = false;

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
            this.isAdmin = role === Role.Admin;
        }
    }

    navigateTo(path: string) {
        this.router.navigate([path]);
    }

    logout() {
        this.authService.logout();
    }
}
