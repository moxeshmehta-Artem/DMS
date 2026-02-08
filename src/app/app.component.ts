import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { AuthService } from './core/auth/auth.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'DMS';
  private authService = inject(AuthService);
  private router = inject(Router);

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
