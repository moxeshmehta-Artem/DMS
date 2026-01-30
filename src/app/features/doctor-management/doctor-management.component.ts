import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AppointmentService } from '../../core/services/appointment.service';
import { MessageService } from 'primeng/api';
import { passwordMatchValidator } from '../../shared/validators/match-password.validator';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { PasswordModule } from 'primeng/password'; // Added

@Component({
  selector: 'app-doctor-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    DropdownModule,
    InputNumberModule,
    PasswordModule
  ],
  providers: [MessageService],
  template: `
    <div class="flex justify-content-center p-4">
        <p-toast></p-toast>
        <p-card header="Add New Doctor" subheader="Onboard a new specialist to the system" [style]="{ width: '100%', maxWidth: '600px' }">
            <form [formGroup]="doctorForm" (ngSubmit)="onSubmit()" class="flex flex-column gap-3">
                
                <div class="field">
                    <label class="block font-bold mb-2">Doctor Name</label>
                    <input pInputText formControlName="name" placeholder="Dr. Jane Doe" class="w-full" />
                    <small *ngIf="isInvalid('name')" class="text-red-500">Name is required</small>
                </div>

                <div class="field">
                    <label class="block font-bold mb-2">Username</label>
                    <input pInputText formControlName="username" placeholder="jdoe" class="w-full" />
                    <small *ngIf="isInvalid('username')" class="text-red-500">Username is required</small>
                </div>

                <div class="field">
                    <label class="block font-bold mb-2">Password</label>
                    <p-password formControlName="password" [toggleMask]="true" [feedback]="false" styleClass="w-full" [inputStyle]="{'width':'100%'}"></p-password>
                    <small *ngIf="isInvalid('password')" class="text-red-500">Password is required</small>
                </div>

                <div class="field">
                    <label class="block font-bold mb-2">Confirm Password</label>
                    <p-password formControlName="confirmPassword" [toggleMask]="true" [feedback]="false" styleClass="w-full" [inputStyle]="{'width':'100%'}"></p-password>
                    <small *ngIf="doctorForm.hasError('mismatch') && (doctorForm.get('confirmPassword')?.dirty || doctorForm.get('confirmPassword')?.touched)" class="text-red-500">Passwords do not match</small>
                </div>

                <div class="field">
                    <label class="block font-bold mb-2">Speciality</label>
                    <p-dropdown [options]="specialities" formControlName="speciality" placeholder="Select Speciality" styleClass="w-full"></p-dropdown>
                    <small *ngIf="isInvalid('speciality')" class="text-red-500">Speciality is required</small>
                </div>

                <div class="formgrid grid">
                    <div class="field col">
                        <label class="block font-bold mb-2">Qualification</label>
                        <input pInputText formControlName="qualification" placeholder="MBBS, MD" class="w-full" />
                        <small *ngIf="isInvalid('qualification')" class="text-red-500">Qualification is required</small>
                    </div>
                    <div class="field col">
                        <label class="block font-bold mb-2">Experience (Years)</label>
                        <p-inputNumber formControlName="experience" [min]="0" suffix=" Years" styleClass="w-full"></p-inputNumber>
                        <small *ngIf="isInvalid('experience')" class="text-red-500">Experience is required (non-negative)</small>
                    </div>
                </div>

                <div class="mt-4 flex justify-content-end gap-2">
                    <p-button label="Clear" icon="pi pi-eraser" styleClass="p-button-secondary" (onClick)="doctorForm.reset()"></p-button>
                    <p-button label="Add Doctor" icon="pi pi-check" type="submit" [disabled]="doctorForm.invalid"></p-button>
                </div>

            </form>
        </p-card>
    </div>
    `
})
export class DoctorManagementComponent {
  private fb = inject(FormBuilder);
  private appointmentService = inject(AppointmentService);
  private messageService = inject(MessageService);

  specialities = [
    'General Physician',
    'Dietitian / Nutritionist',
    'Cardiologist',
    'Endocrinologist',
    'Sports Medicine',
    'Pediatrician'
  ];

  doctorForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    username: ['', Validators.required],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
    speciality: ['', Validators.required],
    qualification: ['', Validators.required],
    experience: [null, [Validators.required, Validators.min(0)]]
  }, { validators: passwordMatchValidator });

  isInvalid(controlName: string): boolean {
    const control = this.doctorForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.doctorForm.valid) {
      const val = this.doctorForm.value;
      this.appointmentService.addDoctor({
        name: val.name,
        speciality: val.speciality,
        username: val.username,
        password: val.password
      });

      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Doctor added successfully' });
      this.doctorForm.reset();
    }
  }
}
