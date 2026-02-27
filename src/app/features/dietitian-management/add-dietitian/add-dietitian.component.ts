import { Component, inject } from '@angular/core';
import { AppointmentService } from '../../../core/services/appointment.service';
import { MessageService } from 'primeng/api';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { passwordMatchValidator } from '../../../shared/validators/match-password.validator';
import { SharedUiModule } from '../../../shared/modules/shared-ui.module';

@Component({
    selector: 'app-add-dietitian',
    standalone: true,
    imports: [SharedUiModule],
    providers: [MessageService],
    templateUrl: './add-dietitian.component.html',
    styleUrls: ['./add-dietitian.component.scss']
})
export class AddDietitianComponent {
    private fb = inject(FormBuilder);
    private appointmentService = inject(AppointmentService);
    private messageService = inject(MessageService);

    dietitianForm: FormGroup = this.fb.group({
        name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
        username: ['', Validators.required],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
        qualification: ['', Validators.required],
        experience: [null, [Validators.required, Validators.min(0)]]
    }, { validators: passwordMatchValidator });

    isInvalid(controlName: string): boolean {
        const control = this.dietitianForm.get(controlName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    onSubmit() {
        if (this.dietitianForm.valid) {
            const val = this.dietitianForm.value;
            const result$ = this.appointmentService.addDietitian({
                name: val.name,
                speciality: 'Dietitian / Nutritionist',
                username: val.username,
                password: val.password
            });

            if (result$) {
                result$.subscribe({
                    next: (res: any) => {
                        console.log('Add Dietitian Success:', res);
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message || 'Dietitian added successfully' });
                        this.dietitianForm.reset();
                    },
                    error: (err) => {
                        console.error('Add Dietitian failed', err);
                        const errorMsg = err.error?.message || 'Failed to add Dietitian';
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: errorMsg });
                    }
                });
            } else {
                this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Operation completed locally' });
                this.dietitianForm.reset();
            }
        }
    }
}
