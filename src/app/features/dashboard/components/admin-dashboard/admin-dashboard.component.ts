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
    template: `
    <div class="mt-4">
        <p-toast></p-toast>
        <p-card header="All Dietitians" subheader="Start managing your team">
             <p-table [value]="dietitians" [tableStyle]="{ 'min-width': '50rem' }">
                <ng-template pTemplate="header">
                    <tr>
                        <th style="width: 50px"></th>
                        <th>Name</th>
                        <th>Speciality</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-doc>
                    <tr>
                        <td>
                             <p-avatar icon="pi pi-user" shape="circle" styleClass="bg-blue-100 text-blue-500"></p-avatar>
                        </td>
                        <td class="font-bold">{{ doc.name }}</td>
                        <td>{{ doc.speciality }}</td>
                        <td>
                            <p-tag severity="success" value="Active"></p-tag>
                        </td>
                        <td>
                            <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" pTooltip="Remove" (onClick)="deleteDietitian(doc)"></p-button>
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="5" class="text-center p-4">No dietitians found.</td>
                    </tr>
                </ng-template>
            </p-table>
        </p-card>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
    dietitians: any[] = [];
    private appointmentService = inject(AppointmentService);
    private messageService = inject(MessageService);

    ngOnInit() {
        this.refreshList();
    }

    refreshList() {
        this.appointmentService.getDietitians().subscribe({
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
            this.appointmentService.removeDietitian(doc.id);
            this.messageService.add({ severity: 'success', summary: 'Removed', detail: 'Dietitian removed successfully' });
            this.refreshList();
        }
    }
}
