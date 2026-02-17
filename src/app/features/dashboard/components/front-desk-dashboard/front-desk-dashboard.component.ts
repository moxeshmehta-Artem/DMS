import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedUiModule } from '../../../../shared/modules/shared-ui.module';
import { RegisteredPatientsComponent } from '../registered-patients/registered-patients.component';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { VitalsService } from '../../../../core/services/vitals.service';
import { prepareChartData } from '../../utils/chart-utils';
import { MessageService } from 'primeng/api';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-front-desk-dashboard',
    standalone: true,
    imports: [CommonModule, SharedUiModule, RegisteredPatientsComponent, ReactiveFormsModule],
    providers: [MessageService],
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
                (onRegister)="navigateTo('/registration')"
                (onAddVitals)="onAddVitals($event)">
            </app-registered-patients>
        </div>

        <!-- Vitals Entry Dialog -->
        <p-dialog [(visible)]="displayVitalsDialog" [modal]="true" [header]="'Add Patient Vitals'" [style]="{width: '50vw'}" [draggable]="false" [resizable]="false">
            <div class="p-4">
                <form [formGroup]="vitalsForm" class="grid p-fluid">
                    <div class="col-12 md:col-6 mb-3">
                        <label class="block font-bold mb-2">Height (cm)</label>
                        <p-inputNumber formControlName="height" suffix=" cm" [min]="0" placeholder="e.g. 175"></p-inputNumber>
                    </div>
                    <div class="col-12 md:col-6 mb-3">
                        <label class="block font-bold mb-2">Weight (kg)</label>
                        <p-inputNumber formControlName="weight" suffix=" kg" [min]="0" [maxFractionDigits]="1" placeholder="e.g. 70.5"></p-inputNumber>
                    </div>
                    <div class="col-12 md:col-6 mb-3">
                        <label class="block font-bold mb-2">Blood Pressure (Sys/Dia)</label>
                        <div class="flex gap-2 align-items-center">
                            <p-inputNumber formControlName="bloodPressureSys" placeholder="Sys" [min]="0"></p-inputNumber>
                            <span>/</span>
                            <p-inputNumber formControlName="bloodPressureDia" placeholder="Dia" [min]="0"></p-inputNumber>
                        </div>
                    </div>
                    <div class="col-12 md:col-6 mb-3">
                        <label class="block font-bold mb-2">Heart Rate (bpm)</label>
                        <p-inputNumber formControlName="heartRate" placeholder="e.g. 72" [min]="0"></p-inputNumber>
                    </div>
                    <div class="col-12 md:col-6 mb-3">
                        <label class="block font-bold mb-2">Body Temp (°C)</label>
                        <p-inputNumber formControlName="temperature" placeholder="e.g. 36.6" [min]="30" [max]="45" [maxFractionDigits]="1"></p-inputNumber>
                    </div>
                </form>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancel" icon="pi pi-times" (onClick)="displayVitalsDialog=false" styleClass="p-button-text"></p-button>
                <p-button label="Save Vitals" icon="pi pi-check" (onClick)="saveVitals()" [disabled]="vitalsForm.invalid"></p-button>
            </ng-template>
        </p-dialog>
        
        <p-toast></p-toast>

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
        this.authService.getAllPatients().subscribe({
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
