import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'statusSeverity',
    standalone: true
})
export class StatusSeverityPipe implements PipeTransform {
    transform(status: string | undefined): 'success' | 'warning' | 'danger' | 'info' | undefined {
        if (!status) return undefined;

        switch (status.toUpperCase()) {
            case 'CONFIRMED': return 'success';
            case 'PENDING': return 'warning';
            case 'REJECTED': return 'danger';
            case 'COMPLETED': return 'info';
            case 'CANCELLED': return 'danger';
            default: return undefined;
        }
    }
}
