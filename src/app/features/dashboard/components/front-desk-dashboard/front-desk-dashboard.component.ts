import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedUiModule } from '../../../../shared/modules/shared-ui.module';
import { RegisteredPatientsComponent } from '../registered-patients/registered-patients.component';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { VitalsService } from '../../../../core/services/vitals.service';
import { prepareChartData } from '../../utils/chart-utils';
import { MessageService } from 'primeng/api';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-front-desk-dashboard',
    standalone: true,
    imports: [CommonModule, SharedUiModule, RegisteredPatientsComponent, ReactiveFormsModule],
    providers: [MessageService],
    templateUrl: './front-desk-dashboard.component.html',
    styleUrls: ['./front-desk-dashboard.component.scss']
})
export class FrontDeskDashboardComponent implements OnInit {
    private appointmentService = inject(AppointmentService);
    private authService = inject(AuthService);
    private userService = inject(UserService);
    private vitalsService = inject(VitalsService);
    private messageService = inject(MessageService);
    private fb = inject(FormBuilder);
    private router = inject(Router);

    patientOverview: any[] = [];
    chartData: any;
    chartOptions: any;
    barChartData: any;
    barChartOptions: any;
    statsCards: any[] = [];

    displayVitalsDialog: boolean = false;
    selectedPatientId: number | null = null;
    selectedVitalsId: number | null = null;
    vitalsForm: FormGroup = this.fb.group({
        height: [null, [Validators.required, Validators.min(0), Validators.max(300)]],
        weight: [null, [Validators.required, Validators.min(0), Validators.max(500)]],
        bloodPressureSys: [null, [Validators.min(0), Validators.max(300)]],
        bloodPressureDia: [null, [Validators.min(0), Validators.max(300)]],
        heartRate: [null, [Validators.min(0), Validators.max(300)]],
        temperature: [null, [Validators.min(30), Validators.max(45)]]
    });

    ngOnInit() {
        this.loadPatientOverview();
    }

    loadPatientOverview() {
        this.userService.getAllPatients().subscribe({
            next: (patients) => {
                this.appointmentService.getAllAppointments().subscribe({
                    next: (allAppointments) => {
                        // Calculate Stats
                        const totalPatients = patients.length;
                        const totalAppointments = allAppointments.length;
                        const pendingAppointments = allAppointments.filter(a => a.status === 'PENDING').length;

                        const today = new Date().toISOString().split('T')[0];
                        const todaysAppointments = allAppointments.filter(a => a.appointmentDate === today).length;

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
                    },
                    error: (err) => console.error('Failed to load appointments', err)
                });
            },
            error: (err) => console.error('Failed to load patients', err)
        });
    }

    navigateTo(path: string) {
        this.router.navigate([path]);
    }

    onAddVitals(patientId: number) {
        this.selectedPatientId = patientId;
        this.selectedVitalsId = null;
        this.vitalsForm.reset();

        this.vitalsService.getLatestVitals(patientId).subscribe({
            next: (vitals) => {
                if (vitals) {
                    this.selectedVitalsId = vitals.id;
                    this.vitalsForm.patchValue(vitals);
                }
                this.displayVitalsDialog = true;
            },
            error: (err) => {
                console.error('Failed to fetch latest vitals', err);
                this.displayVitalsDialog = true;
            }
        });
    }

    saveVitals() {
        if (this.vitalsForm.valid && this.selectedPatientId) {
            const saveObs = this.selectedVitalsId
                ? this.vitalsService.updateVitals(this.selectedVitalsId, this.vitalsForm.value)
                : this.vitalsService.addVitals(this.selectedPatientId, this.vitalsForm.value);

            saveObs.subscribe({
                next: (savedVitals) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: `Vitals ${this.selectedVitalsId ? 'updated' : 'recorded'} successfully`
                    });

                    // Optimization: Update local state instead of full reload
                    const patient = this.patientOverview.find(p => p.id === this.selectedPatientId);
                    if (patient) {
                        patient.vitals = savedVitals;
                    }

                    this.displayVitalsDialog = false;
                },
                error: (err) => {
                    console.error('Failed to save vitals', err);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save vitals' });
                }
            });
        }
    }
}
