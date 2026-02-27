import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/auth/auth.service';
import { SharedUiModule } from '../../shared/modules/shared-ui.module';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-doctor-selection',
  standalone: true,
  imports: [
    SharedUiModule,
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
  availableTimeSlots: string[] = [];
  isLoading = false;

  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  ngOnInit() {
    this.appointmentService.getDietitianSelection().subscribe({
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
    this.isLoading = false;
    this.availableTimeSlots = [];
    this.displayBookingDialog = true;
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
