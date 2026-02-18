import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { User } from '../../core/models/user.model';
import { Router } from '@angular/router';
import { passwordMatchValidator } from '../../shared/validators/match-password.validator';
import { SharedUiModule } from '../../shared/modules/shared-ui.module';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    SharedUiModule
  ],
  providers: [MessageService],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  genders = ['Male', 'Female', 'Other'];

  regForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    dob: [null, Validators.required],
    gender: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
    address: ['', Validators.required],
    username: ['', Validators.required],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  isInvalid(controlName: string): boolean {
    const control = this.regForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.regForm.valid) {
      const formVal = this.regForm.value;

      const newUser: User = {
        id: 0, // Will be generated
        username: formVal.username,
        role: 'Patient' as any, // Role is set in service, but casting for type
        permissions: [], // Set in service
        firstName: formVal.firstName,
        lastName: formVal.lastName,
        email: formVal.email,
        phone: formVal.phone,
        dob: formVal.dob,
        gender: formVal.gender,
        address: formVal.address
      };

      this.authService.registerPatient(newUser, formVal.password)
        .subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Patient Registered Successfully' });
            this.resetForm();
          },
          error: (err) => {
            console.error('Registration failed', err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Registration failed' });
          }
        });
    } else {
      this.regForm.markAllAsTouched();
    }
  }

  resetForm() {
    this.regForm.reset();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
