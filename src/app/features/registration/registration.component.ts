import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { User } from '../../core/models/user.model';
import { Router } from '@angular/router';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    CalendarModule,
    DropdownModule,
    InputNumberModule,
    InputTextareaModule,
    ToastModule,
    PasswordModule,
    DividerModule
  ],
  providers: [MessageService],
  template: `
    <div class="flex justify-content-center p-4">
        <p-toast></p-toast>
        <p-card header="Patient Registration" subheader="Register new patient and record vitals" [style]="{ width: '100%', maxWidth: '800px' }">
            <form [formGroup]="regForm" (ngSubmit)="onSubmit()" class="flex flex-column gap-3">
                
                <!-- PERSONAL DETAILS -->
                <h3 class="m-0 text-primary">Personal Details</h3>
                <div class="grid p-fluid">
                    <div class="col-12 md:col-6">
                        <label class="block mb-2 font-bold">First Name</label>
                        <input pInputText formControlName="firstName" placeholder="First Name" />
                        <small class="text-red-500" *ngIf="isInvalid('firstName')">First Name is required</small>
                    </div>
                    <div class="col-12 md:col-6">
                        <label class="block mb-2 font-bold">Last Name</label>
                        <input pInputText formControlName="lastName" placeholder="Last Name" />
                        <small class="text-red-500" *ngIf="isInvalid('lastName')">Last Name is required</small>
                    </div>
                    
                    <div class="col-12 md:col-6">
                        <label class="block mb-2 font-bold">Date of Birth</label>
                        <p-calendar formControlName="dob" dateFormat="dd/mm/yy" [showIcon]="true" placeholder="DD/MM/YYYY"></p-calendar>
                        <small class="text-red-500" *ngIf="isInvalid('dob')">Date of Birth is required</small>
                    </div>
                    <div class="col-12 md:col-6">
                        <label class="block mb-2 font-bold">Gender</label>
                        <p-dropdown [options]="genders" formControlName="gender" placeholder="Select Gender"></p-dropdown>
                        <small class="text-red-500" *ngIf="isInvalid('gender')">Gender is required</small>
                    </div>

                    <div class="col-12 md:col-6">
                        <label class="block mb-2 font-bold">Email</label>
                        <input pInputText formControlName="email" placeholder="email@example.com" />
                        <small class="text-red-500" *ngIf="isInvalid('email')">Email is required</small>
                    </div>
                    <div class="col-12 md:col-6">
                        <label class="block mb-2 font-bold">Phone</label>
                        <input pInputText formControlName="phone" placeholder="+1 234 567 890" />
                        <small class="text-red-500" *ngIf="isInvalid('phone')">Phone must be 10-15 digits</small>
                    </div>
                    
                    <div class="col-12">
                        <label class="block mb-2 font-bold">Address</label>
                        <textarea pInputTextarea formControlName="address" rows="2" placeholder="Street Address"></textarea>
                        <small class="text-red-500" *ngIf="isInvalid('address')">Address is required</small>
                    </div>
                </div>

                <p-divider></p-divider>

                <!-- LOGIN CREDENTIALS -->
                <h3 class="m-0 text-primary">Account Credentials</h3>
                <div class="grid p-fluid">
                    <div class="col-12 md:col-6">
                        <label class="block mb-2 font-bold">Username</label>
                        <input pInputText formControlName="username" placeholder="Username" />
                        <small class="text-red-500" *ngIf="isInvalid('username')">Username is required on registration</small>
                    </div>
                    <div class="col-12 md:col-6">
                        <label class="block mb-2 font-bold">Password</label>
                        <p-password formControlName="password" [toggleMask]="true" [feedback]="false" placeholder="Initial Password"></p-password>
                        <small class="text-red-500" *ngIf="isInvalid('password')">Password is required</small>
                    </div>
                </div>

                <p-divider></p-divider>
                
                <!-- VITALS -->
                <h3 class="m-0 text-primary">Initial Vitals</h3>
                <div class="grid p-fluid" formGroupName="vitals">
                    <div class="col-6 md:col-3">
                        <label class="block mb-2 font-bold">Height (cm)</label>
                        <p-inputNumber formControlName="height" suffix=" cm" [min]="0"></p-inputNumber>
                        <small class="text-red-500 block" *ngIf="regForm.get('vitals.height')?.invalid && regForm.get('vitals.height')?.touched">Height is required (0-300)</small>
                    </div>
                    <div class="col-6 md:col-3">
                        <label class="block mb-2 font-bold">Weight (kg)</label>
                        <p-inputNumber formControlName="weight" suffix=" kg" [min]="0" [maxFractionDigits]="1"></p-inputNumber>
                        <small class="text-red-500 block" *ngIf="regForm.get('vitals.weight')?.invalid && regForm.get('vitals.weight')?.touched">Weight is required (0-500)</small>
                    </div>
                    <div class="col-6 md:col-3">
                        <label class="block mb-2 font-bold">BP (Systolic)</label>
                        <p-inputNumber formControlName="bloodPressureSys" suffix=" mmHg" [min]="0"></p-inputNumber>
                        <small class="text-red-500 block" *ngIf="regForm.get('vitals.bloodPressureSys')?.invalid && regForm.get('vitals.bloodPressureSys')?.touched">Range: 0-300</small>
                    </div>
                    <div class="col-6 md:col-3">
                        <label class="block mb-2 font-bold">BP (Diastolic)</label>
                        <p-inputNumber formControlName="bloodPressureDia" suffix=" mmHg" [min]="0"></p-inputNumber>
                         <small class="text-red-500 block" *ngIf="regForm.get('vitals.bloodPressureDia')?.invalid && regForm.get('vitals.bloodPressureDia')?.touched">Range: 0-300</small>
                    </div>
                    <div class="col-6 md:col-3">
                        <label class="block mb-2 font-bold">Heart Rate</label>
                        <p-inputNumber formControlName="heartRate" suffix=" bpm" [min]="0"></p-inputNumber>
                        <small class="text-red-500 block" *ngIf="regForm.get('vitals.heartRate')?.invalid && regForm.get('vitals.heartRate')?.touched">Range: 0-300</small>
                    </div>
                    <div class="col-6 md:col-3">
                        <label class="block mb-2 font-bold">Body Temp (°C)</label>
                        <p-inputNumber formControlName="temperature" suffix=" °C" [min]="0" [maxFractionDigits]="1"></p-inputNumber>
                        <small class="text-red-500 block" *ngIf="regForm.get('vitals.temperature')?.invalid && regForm.get('vitals.temperature')?.touched">Range: 30-45</small>
                    </div>
                </div>

                <div class="flex justify-content-end mt-4 gap-2">
                    <p-button label="Reset" icon="pi pi-refresh" styleClass="p-button-secondary" (onClick)="resetForm()"></p-button>
                    <p-button label="Register Patient" icon="pi pi-check" (onClick)="onSubmit()" [disabled]="regForm.invalid"></p-button>
                </div>
            </form>
        </p-card>
    </div>
    `
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
    vitals: this.fb.group({
      height: [null, [Validators.required, Validators.min(0), Validators.max(300)]],
      weight: [null, [Validators.required, Validators.min(0), Validators.max(500)]],
      bloodPressureSys: [null, [Validators.min(0), Validators.max(300)]],
      bloodPressureDia: [null, [Validators.min(0), Validators.max(300)]],
      heartRate: [null, [Validators.min(0), Validators.max(300)]],
      temperature: [null, [Validators.min(30), Validators.max(45)]]
    })
  });

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
        address: formVal.address,
        vitals: {
          height: formVal.vitals.height,
          weight: formVal.vitals.weight,
          bloodPressureSys: formVal.vitals.bloodPressureSys,
          bloodPressureDia: formVal.vitals.bloodPressureDia,
          heartRate: formVal.vitals.heartRate,
          temperature: formVal.vitals.temperature
        }
      };

      const success = this.authService.registerPatient(newUser, formVal.password);

      if (success) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Patient Registered Successfully' });
        this.resetForm();
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Registration failed' });
      }
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
