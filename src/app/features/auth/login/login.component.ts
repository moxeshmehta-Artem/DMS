import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { SharedUiModule } from '../../../shared/modules/shared-ui.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    SharedUiModule
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;
  loginError = false;

  constructor(private authService: AuthService, private router: Router) { }

  onLogin() {
    this.loginError = false;
    if (this.username && this.password) {
      this.isLoading = true;

      this.authService.login({ username: this.username, password: this.password })
        .subscribe({
          next: () => {
            this.router.navigate(['/dashboard']);
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Login failed', err);
            this.loginError = true;
            this.isLoading = false;
          }
        });
    }
  }
}
