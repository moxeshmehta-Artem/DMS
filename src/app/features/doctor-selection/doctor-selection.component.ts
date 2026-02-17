import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
import { TableModule } from 'primeng/table';
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
    ToastModule,
    TableModule,
    DatePipe
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
                    <p-calendar [(ngModel)]="bookingDate" [minDate]="minDate" [showOnFocus]="false" [showIcon]="true" appendTo="body" (onSelect)="updateAvailableSlots()"></p-calendar>
                </div>

                <div class="flex flex-column gap-2">
                    <label class="font-bold">Select Time Slot</label>
                    <p-dropdown [options]="availableTimeSlots" [(ngModel)]="bookingTime" placeholder="Select a time" appendTo="body" [disabled]="!bookingDate"></p-dropdown>
                    <small *ngIf="availableTimeSlots.length === 0 && bookingDate" class="text-red-500">No slots available for this date</small>
                </div>

                <!-- Availability Chart -->
                <div class="mt-2">
                    <label class="font-bold block mb-2 text-primary">Doctor's Schedule (Booked Slots)</label>
                    <p-table [value]="bookedAppointments" [scrollable]="true" scrollHeight="150px" styleClass="p-datatable-sm">
                        <ng-template pTemplate="header">
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="body" let-appt>
                            <tr>
                                <td>{{ appt.appointmentDate | date:'shortDate' }}</td>
                                <td>{{ appt.timeSlot }}</td>
                                <td><span class="text-red-500 font-bold">Busy</span></td>
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="emptymessage">
                            <tr>
                                <td colspan="3" class="text-center">No bookings yet. All slots available.</td>
                            </tr>
                        </ng-template>
                    </p-table>
                </div>

                <div class="flex flex-column gap-2">
                    <label class="font-bold">Reason for Visit <span class="text-red-500">*</span></label>
                    <textarea pInputTextarea [(ngModel)]="description" rows="3" placeholder="Briefly describe your goals..." [ngClass]="{'ng-invalid ng-dirty': !description && displayBookingDialog}"></textarea>
                    <small class="text-red-500" *ngIf="!description && displayBookingDialog">Reason is required</small>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Confirm Booking" icon="pi pi-check" (onClick)="confirmBooking()" [disabled]="!bookingDate || !bookingTime || !description || isLoading" [loading]="isLoading"></p-button>
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
  allTimeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];
  availableTimeSlots: string[] = [];
  bookedAppointments: any[] = [];
  isLoading = false;

  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  ngOnInit() {
    this.appointmentService.getDietitians().subscribe({
      next: (data: any[]) => {
        this.dietitians = data;
      },
      error: (err) => {
        console.error('Failed to load dietitians', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load dietitians' });
      }
    });
  }

  openBooking(doctor: any) {
    this.selectedDietitian = doctor;
    this.bookingDate = undefined;
    this.bookingTime = undefined;
    this.description = '';
    this.bookedAppointments = [];
    this.isLoading = false;

    this.loadDoctorSchedule(doctor.id);
    this.availableTimeSlots = [];

    this.displayBookingDialog = true;
  }

  loadDoctorSchedule(doctorId: number) {
    this.appointmentService.getAppointmentsForDietitian(doctorId).subscribe({
      next: (allAppts) => {
        this.bookedAppointments = allAppts.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING');
        this.updateAvailableSlots();
      }
    });
  }

  updateAvailableSlots() {
    if (!this.bookingDate || !this.selectedDietitian) return;

    const selectedDateStr = this.formatDate(this.bookingDate);

    this.availableTimeSlots = this.allTimeSlots.filter(slot => {
      const isBooked = this.bookedAppointments.some(appt =>
        appt.appointmentDate === selectedDateStr &&
        appt.timeSlot === slot
      );
      return !isBooked;
    });

    if (this.bookingTime && !this.availableTimeSlots.includes(this.bookingTime)) {
      this.bookingTime = undefined;
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  confirmBooking() {
    if (this.selectedDietitian && this.bookingDate && this.bookingTime && this.description) {
      const currentUser = this.authService.currentUser();
      if (!currentUser) return;

      this.isLoading = true;
      const dateStr = this.formatDate(this.bookingDate);

      this.appointmentService.bookAppointment({
        patientId: currentUser.id,
        providerId: this.selectedDietitian.id,
        appointmentDate: dateStr,
        timeSlot: this.bookingTime,
        description: this.description || 'Consultation'
      }).subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({ severity: 'success', summary: 'Confirmed', detail: 'Appointment Request Sent!' });
            this.displayBookingDialog = false;
          } else {
            this.messageService.add({ severity: 'error', summary: 'Unavailable', detail: res.message || 'Slot is already taken' });
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.messageService.add({ severity: 'error', summary: 'Booking Failed', detail: err.error?.message || 'Failed to book appointment' });
        }
      });
    }
  }
}
