import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedUiModule } from '../../../../shared/modules/shared-ui.module';
import { RegisteredPatientsComponent } from '../registered-patients/registered-patients.component';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Role } from '../../../../core/models/role.enum';
import { prepareChartData } from '../../utils/chart-utils';

@Component({
    selector: 'app-front-desk-dashboard',
    standalone: true,
    imports: [CommonModule, SharedUiModule, RegisteredPatientsComponent],
    template: `
    <div class="grid mt-4">
        <!-- Stats Cards -->
        <div class="col-12 md:col-6 lg:col-3" *ngFor="let card of statsCards">
            <div class="surface-card shadow-2 p-3 border-round border-bottom-3 hover:shadow-4 hover:-translate-y-1 transition-all transition-duration-300"
                    [class]="'border-' + card.color + '-500'"
                    [style.background]="'linear-gradient(135deg, var(--' + card.color + '-50) 0%, #ffffff 50%)'">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">{{ card.label }}</span>
                        <div class="text-900 font-medium text-4xl">{{ card.value }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center border-round" 
                            [class]="'bg-' + card.color + '-100'"
                            style="width:3rem;height:3rem">
                        <i [class]="card.icon + ' text-' + card.color + '-500 text-xl'"></i>
                    </div>
                </div>
                <span [class]="'text-' + card.color + '-500 font-medium'">{{ card.subTextHighlight }} </span>
                <span class="text-500">{{ card.subText }}</span>
            </div>
        </div>

        <div class="col-12">
            <app-registered-patients 
                [patients]="patientOverview"
                (onRegister)="navigateTo('/registration')">
            </app-registered-patients>
        </div>

        <!-- Charts -->
        <div class="col-12 md:col-6">
            <div class="surface-card shadow-2 p-4 border-round flex flex-column align-items-center">
                <h5 class="text-xl font-bold mb-4 align-self-start">Appointment Status</h5>
                <div class="w-full relative" style="height: 300px;">
                    <p-chart type="doughnut" [data]="chartData" [options]="chartOptions" class=" w-full"></p-chart>
                </div>
            </div>
        </div>
        <div class="col-12 md:col-6">
            <div class="surface-card shadow-2 p-4 border-round h-full flex flex-column align-items-center">
                <h5 class="text-xl font-bold mb-4 align-self-start">Upcoming Schedule</h5>
                <div class="w-full relative" style="height: 300px;">
                    <p-chart type="bar" [data]="barChartData" [options]="barChartOptions" class="h-full w-full" height="300px"></p-chart>
                </div>
            </div>
        </div>
    </div>
  `
})
export class FrontDeskDashboardComponent implements OnInit {
    private appointmentService = inject(AppointmentService);
    private authService = inject(AuthService);
    private router = inject(Router);

    patientOverview: any[] = [];
    chartData: any;
    chartOptions: any;
    barChartData: any;
    barChartOptions: any;
    statsCards: any[] = [];

    ngOnInit() {
        this.loadPatientOverview();
    }

    loadPatientOverview() {
        const allUsers = this.authService.getAllUsers();
        const patients = allUsers.filter(u => u.role === Role.Patient);
        const allAppointments = this.appointmentService.getAllAppointments();

        // Calculate Stats
        const totalPatients = patients.length;
        const totalAppointments = allAppointments.length;
        const pendingAppointments = allAppointments.filter(a => a.status === 'Pending').length;

        const today = new Date().toDateString();
        const todaysAppointments = allAppointments.filter(a => new Date(a.date).toDateString() === today).length;

        // Populate Data-Driven Stats Cards
        this.statsCards = [
            {
                label: 'Total Patients',
                value: totalPatients,
                icon: 'pi pi-users',
                color: 'blue',
                subTextHighlight: 'Registered',
                subText: 'in system'
            },
            {
                label: 'Appointments',
                value: totalAppointments,
                icon: 'pi pi-calendar',
                color: 'orange',
                subTextHighlight: 'All time',
                subText: 'records'
            },
            {
                label: 'Pending',
                value: pendingAppointments,
                icon: 'pi pi-clock',
                color: 'cyan',
                subTextHighlight: 'Action',
                subText: 'required'
            },
            {
                label: 'Today\'s',
                value: todaysAppointments,
                icon: 'pi pi-calendar-plus',
                color: 'purple',
                subTextHighlight: 'Scheduled',
                subText: 'for today'
            }
        ];

        // Prepare Chart Data
        const charts = prepareChartData(allAppointments);
        this.chartData = charts.chartData;
        this.chartOptions = charts.chartOptions;
        this.barChartData = charts.barChartData;
        this.barChartOptions = charts.barChartOptions;

        this.patientOverview = patients.map((patient: any) => {
            // Find latest appointment
            const patientAppts = allAppointments.filter(a => a.patientId === patient.id);
            const latestAppt = patientAppts.length > 0 ? patientAppts[patientAppts.length - 1] : null;

            return {
                ...patient,
                latestAppointment: latestAppt
            };
        });
    }

    navigateTo(path: string) {
        this.router.navigate([path]);
    }
}
