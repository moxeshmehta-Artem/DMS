import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedUiModule } from '../../../../shared/modules/shared-ui.module';
import { StatusSeverityPipe } from '../../../../shared/pipes/status-severity.pipe';

@Component({
    selector: 'app-registered-patients',
    standalone: true,
    imports: [CommonModule, SharedUiModule, StatusSeverityPipe],
    templateUrl: './registered-patients.component.html',
    styleUrls: ['./registered-patients.component.scss']
})
export class RegisteredPatientsComponent {
    @Input() patients: any[] = [];
    @Output() onRegister = new EventEmitter<void>();
    @Output() onAddVitals = new EventEmitter<number>();

    getAge(dob: any): number {
        if (!dob) return 0;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
}
