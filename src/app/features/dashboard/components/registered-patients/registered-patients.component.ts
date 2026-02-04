import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedUiModule } from '../../../../shared/modules/shared-ui.module';
import { StatusSeverityPipe } from '../../../../shared/pipes/status-severity.pipe';

@Component({
    selector: 'app-registered-patients',
    standalone: true,
    imports: [CommonModule, SharedUiModule, StatusSeverityPipe],
    template: `
    <div class="surface-card p-4 shadow-2 border-round mt-4">
        <div class="flex justify-content-between align-items-center mb-3">
            <div class="text-2xl font-medium text-900">Registered Patients</div>
            <button pButton icon="pi pi-user-plus" label="Register New" (click)="onRegister.emit()" class="p-button-sm"></button>
        </div>
        
        <p-table [value]="patients" [paginator]="true" [rows]="5" responsiveLayout="stack" [breakpoint]="'960px'">
            <ng-template pTemplate="header">
                <tr>
                    <th pSortableColumn="firstName">Name <p-sortIcon field="firstName"></p-sortIcon></th>
                    <th pSortableColumn="dob">Age <p-sortIcon field="dob"></p-sortIcon></th>
                    <th>Gender</th>
                    <th>Contact</th>
                    <th>Vitals (Latest)</th>
                    <th>Latest Appointment</th>
                    <th>Status</th>
                </tr>
            </ng-template>
            <ng-template pTemplate="body" let-patient>
                <tr>
                    <td>
                        <span class="p-column-title font-bold mr-2">Name</span>
                        <div class="inline-block vertical-align-middle">
                            <div class="font-medium">{{ patient.firstName }} {{ patient.lastName }}</div>
                            <small class="text-500">{{ patient.username }}</small>
                        </div>
                    </td>
                    <td>
                        <span class="p-column-title font-bold mr-2">Age</span>
                        {{ getAge(patient.dob) }} yrs
                    </td>
                    <td>
                        <span class="p-column-title font-bold mr-2">Gender</span>
                        {{ patient.gender }}
                    </td>
                    <td>
                        <span class="p-column-title font-bold mr-2">Contact</span>
                        <div class="inline-block vertical-align-middle">
                            <div>{{ patient.phone }}</div>
                        </div>
                    </td>
                    <td>
                        <span class="p-column-title font-bold mr-2">Vitals</span>
                        <div *ngIf="patient.vitals" class="text-sm inline-flex gap-3 vertical-align-middle">
                            <div><i class="pi pi-arrows-v text-primary mr-1"></i> {{ patient.vitals.height }}cm</div>
                            <div><i class="pi pi-stop text-primary mr-1"></i> {{ patient.vitals.weight }}kg</div>
                        </div>
                    </td>
                    <td>
                        <span class="p-column-title font-bold mr-2">Latest Appt</span>
                        <div *ngIf="patient.latestAppointment" class="inline-block vertical-align-middle pl-6">
                            <div class="font-medium" >{{ patient.latestAppointment.date | date:'shortDate' }}</div>
                        </div>
                        <span *ngIf="!patient.latestAppointment" class="text-500">-</span>
                    </td>
                    <td>
                        <span class="p-column-title font-bold mr-2">Status</span>
                            <div class="flex align-items-center gap-2">
                            <p-tag *ngIf="patient.latestAppointment" [severity]="patient.latestAppointment.status | statusSeverity" [value]="patient.latestAppointment.status"></p-tag>
                            </div>
                    </td>
                </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="7" class="text-center p-4">No patients registered yet.</td>
                </tr>
            </ng-template>
        </p-table>
    </div>
  `
})
export class RegisteredPatientsComponent {
    @Input() patients: any[] = [];
    @Output() onRegister = new EventEmitter<void>();

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
