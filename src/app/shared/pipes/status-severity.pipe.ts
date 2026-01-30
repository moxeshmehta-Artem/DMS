
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'statusSeverity',
    standalone: true
})
export class StatusSeverityPipe implements PipeTransform {
    transform(status: string): 'success' | 'warning' | 'danger' | 'info' | undefined {
        switch (status) {
            case 'Confirmed': return 'success';
            case 'Pending': return 'warning';
            case 'Rejected': return 'danger';
            case 'Completed': return 'info';
            default: return undefined;
        }
    }
}
