import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/auth/auth.service';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-doctor-selection',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DialogModule,
    CalendarModule,
    DropdownModule,
    InputTextareaModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="p-4">
        <p-toast></p-toast>
        <h2 class="text-primary mb-4">Find a Dietitian</h2>
        
        <div class="grid">
            <div class="col-12 md:col-4" *ngFor="let doc of dietitians">
                <p-card [header]="doc.name" [subheader]="doc.speciality" styleClass="h-full">
                    <ng-template pTemplate="content">
                        <div class="flex flex-column gap-2">
                            <span class="text-600"><i class="pi pi-check-circle mr-2"></i>Certified Expert</span>
                            <span class="text-600"><i class="pi pi-clock mr-2"></i>Mon - Fri, 9AM - 5PM</span>
                        </div>
                    </ng-template>
                    <ng-template pTemplate="footer">
                        <p-button label="Book Appointment" icon="pi pi-calendar-plus" styleClass="w-full" (onClick)="openBooking(doc)"></p-button>
                    </ng-template>
                </p-card>
            </div>
        </div>

        <!-- Booking Dialog -->
        <p-dialog [(visible)]="displayBookingDialog" [header]="'Book with ' + selectedDietitian?.name" [modal]="true" [style]="{width: '400px'}">
            <div class="flex flex-column gap-3 pt-2">
                <div class="flex flex-column gap-2">
                    <label class="font-bold">Select Date</label>
                    <p-calendar [(ngModel)]="bookingDate" [minDate]="minDate" [showOnFocus]="false" [showIcon]="true" appendTo="body"></p-calendar>
                </div>

                <div class="flex flex-column gap-2">
                    <label class="font-bold">Select Time Slot</label>
                    <p-dropdown [options]="timeSlots" [(ngModel)]="bookingTime" placeholder="Select a time" appendTo="body"></p-dropdown>
                </div>

                <div class="flex flex-column gap-2">
                    <label class="font-bold">Reason for Visit</label>
                    <textarea pInputTextarea [(ngModel)]="description" rows="3" placeholder="Briefly describe your goals..."></textarea>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Confirm Booking" icon="pi pi-check" (onClick)="confirmBooking()" [disabled]="!bookingDate || !bookingTime"></p-button>
            </ng-template>
        </p-dialog>
    </div>
    `
})
export class DoctorSelectionComponent implements OnInit {
  dietitians: any[] = [];
  selectedDietitian: any = null;
  displayBookingDialog = false;

  bookingDate: Date | undefined;
  bookingTime: string | undefined;
  description: string = '';

  minDate = new Date();
  timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];

  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  ngOnInit() {
    this.dietitians = this.appointmentService.getDietitians();
  }

  openBooking(doctor: any) {
    this.selectedDietitian = doctor;
    this.bookingDate = undefined;
    this.bookingTime = undefined;
    this.description = '';
    this.displayBookingDialog = true;
  }

  confirmBooking() {
    if (this.selectedDietitian && this.bookingDate && this.bookingTime) {
      const currentUser = this.authService.currentUser();
      if (!currentUser) return;

      const success = this.appointmentService.bookAppointment({
        patientId: currentUser.id,
        patientName: (currentUser.firstName || '') + ' ' + (currentUser.lastName || ''),
        dietitianId: this.selectedDietitian.id,
        dietitianName: this.selectedDietitian.name,
        date: this.bookingDate,
        timeSlot: this.bookingTime,
        description: this.description || 'Consultation'
      });

      if (success) {
        this.messageService.add({ severity: 'success', summary: 'Confirmed', detail: 'Appointment Request Sent!' });
        this.displayBookingDialog = false;
      } else {
        this.messageService.add({ severity: 'error', summary: 'Slot Unavailable', detail: 'This time slot is already booked. Please choose another.' });
      }
    }
  }
}
