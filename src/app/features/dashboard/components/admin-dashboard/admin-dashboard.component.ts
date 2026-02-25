import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { MessageService } from 'primeng/api';

// PrimeNG
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        TableModule,
        AvatarModule,
        TagModule,
        ButtonModule,
        ToastModule,
        TooltipModule
    ],
    providers: [MessageService],
    templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
    dietitians: any[] = [];
    private appointmentService = inject(AppointmentService);
    private messageService = inject(MessageService);

    ngOnInit() {
        this.refreshList();
    }

    refreshList() {
        this.appointmentService.getDietitianSelection().subscribe({
            next: (data: any[]) => {
                this.dietitians = data;
            },
            error: (err: any) => {
                console.error('Error fetching dietitians', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load dietitians' });
            }
        });
    }

    deleteDietitian(doc: any) {
        if (confirm(`Are you sure you want to remove ${doc.name}?`)) {
            this.appointmentService.removeDietitian(doc.id).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Removed', detail: 'Dietitian removed successfully' });
                    this.refreshList();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove dietitian' });
                }
            });
        }
    }
}
