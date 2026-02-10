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
  template: `
    <div class="flex justify-content-center align-items-center surface-ground min-h-screen">
      <p-card header="Welcome Back" [style]="{ width: '360px' }" styleClass="shadow-4">
        <ng-template pTemplate="subtitle">
          Please sign in to continue
        </ng-template>
        
        <div class="flex flex-column gap-3 mt-3">
          <!-- Username -->
          <div class="flex flex-column gap-2">
            <label for="username">Username</label>
            <input 
              pInputText 
              id="username" 
              [(ngModel)]="username" 
              #user="ngModel"
              required
              placeholder="Enter your username" />
              <small class="text-red-500" *ngIf="user.invalid && (user.dirty || user.touched)">Username is required</small>
          </div>

          <!-- Password -->
          <div class="flex flex-column gap-2">
            <label for="password">Password</label>
            <p-password 
              id="password" 
              [(ngModel)]="password" 
              #pass="ngModel"
              required
              [feedback]="false"
              [toggleMask]="true" 
              placeholder="Enter your password"
              [style]="{'width':'100%'}" 
              [inputStyle]="{'width':'100%'}">
            </p-password>
            <small class="text-red-500" *ngIf="pass.invalid && (pass.dirty || pass.touched)">Password is required</small>
            
          </div>
          
          <div *ngIf="loginError" class="text-red-500 text-sm">
            Invalid username or password.
          </div>

          <p-button 
            label="Sign In" 
            (onClick)="onLogin()" 
            [loading]="isLoading" 
            [disabled]="!username || !password"
            styleClass="w-full mt-2">
          </p-button>
        </div>
      </p-card>
    </div>
  `
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
