import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../core/services/appointment.service';
import { MessageService } from 'primeng/api';

// PrimeNG
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-dietitian-management',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    ButtonModule,
    TagModule,
    AvatarModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="p-4">
        <p-toast></p-toast>
        <!-- List Dietitians -->
        <p-card header="Dietitian List" subheader="View and manage current dietitians">
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
export class DietitianManagementComponent implements OnInit {
  dietitians: any[] = [];

  private appointmentService = inject(AppointmentService);
  private messageService = inject(MessageService);

  ngOnInit() {
    this.refreshList();
  }

  refreshList() {
    this.dietitians = this.appointmentService.getDietitians();
  }

  deleteDietitian(doc: any) {
    if (confirm(`Are you sure you want to remove ${doc.name}?`)) {
      this.appointmentService.removeDietitian(doc.id);
      this.messageService.add({ severity: 'success', summary: 'Removed', detail: 'Dietitian removed successfully' });
      this.refreshList();
    }
  }
}
