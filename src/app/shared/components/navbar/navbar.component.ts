
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, MenubarModule],
    templateUrl: './navbar.component.html'
})
export class NavbarComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    // Compute menu items based on auth state
    items = computed<MenuItem[]>(() => {
        if (this.authService.currentUser()) {
            return [
                {
                    label: 'Dashboard',
                    icon: 'pi pi-home',
                    command: () => this.router.navigate(['/dashboard'])
                },
                {
                    label: 'User: ' + this.authService.currentUser()?.firstName,
                    icon: 'pi pi-user',
                    styleClass: 'ml-auto',
                    items: [
                        {
                            label: 'Logout',
                            icon: 'pi pi-power-off',
                            command: () => this.authService.logout()
                        }
                    ]
                }
            ];
        }
        return [];
    });
}
