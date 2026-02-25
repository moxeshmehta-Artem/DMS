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
    templateUrl: './dashboard.component.html'
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
