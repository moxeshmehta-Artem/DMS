import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ChatbotComponent } from './shared/components/chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent, ChatbotComponent],
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
