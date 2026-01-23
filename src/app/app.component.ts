import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MenubarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'DMS';

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
