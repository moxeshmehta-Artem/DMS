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
  templateUrl: './doctor-selection.component.html',
  styleUrls: ['./doctor-selection.component.scss']
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

    // this.loadDoctorSchedule(doctor.id); // Optimized: No longer fetching all history
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

    this.isLoading = true;
    const selectedDateStr = this.formatDate(this.bookingDate);

    this.appointmentService.getAvailableSlots(this.selectedDietitian.id, selectedDateStr).subscribe({
      next: (slots) => {
        this.availableTimeSlots = slots;
        this.isLoading = false;

        // Reset selected time if it's no longer available
        if (this.bookingTime && !this.availableTimeSlots.includes(this.bookingTime)) {
          this.bookingTime = undefined;
        }
      },
      error: (err) => {
        console.error('Failed to load available slots', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load time slots' });
        this.isLoading = false;
      }
    });
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
            this.messageService.add({ severity: 'info', summary: 'Unavailable', detail: res.message || 'Slot is already taken' });
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
