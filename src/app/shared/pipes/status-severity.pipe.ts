import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'statusSeverity',
    standalone: true
})
export class StatusSeverityPipe implements PipeTransform {
    transform(status: string | undefined): 'success' | 'warning' | 'danger' | 'info' | undefined {
        if (!status) return undefined;

        switch (status.toUpperCase()) {
            // Appointment Statuses
            case 'CONFIRMED': return 'success';
            case 'PENDING': return 'warning';
            case 'REJECTED': return 'danger';
            case 'COMPLETED': return 'info';
            case 'CANCELLED': return 'danger';
            case 'SCHEDULED': return 'info';
            case 'ONGOING': return 'warning';

            // Roles
            case 'ROLE_ADMIN': return 'danger';
            case 'ROLE_DIETITIAN': return 'info';
            case 'ROLE_PATIENT': return 'success';
            case 'ROLE_FRONTDESK': return 'warning';
            case 'ADMIN': return 'danger';
            case 'DIETITIAN': return 'info';
            case 'PATIENT': return 'success';
            case 'FRONTDESK': return 'warning';

            // General Statuses
            case 'ACTIVE': return 'success';
            case 'INACTIVE': return 'danger';
            case 'MALE': return 'info';
            case 'FEMALE': return 'warning';

            default: return undefined;
        }
    }
}
