import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { Role } from '../../core/models/role.enum';
import { MENU_ITEMS } from '../../core/constants/permissions';
import { StatusSeverityPipe } from '../../shared/pipes/status-severity.pipe';
import { SharedUiModule } from '../../shared/modules/shared-ui.module';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        SharedUiModule,
        StatusSeverityPipe
    ],
    template: `
    <div class="min-h-screen surface-ground">
      <!-- Content -->
      <div class="p-5">
        <div class="grid">
            <div class="col-12 md:col-6 lg:col-4" *ngFor="let item of menuItems">
                <div class="surface-card shadow-2 p-3 border-round cursor-pointer hover:surface-100 transition-duration-200"
                     (click)="navigateTo(item.routerLink)">
                    <div class="flex align-items-center mb-3">
                        <i [class]="item.icon" class="text-xl text-primary mr-2"></i>
                        <span class="text-900 font-medium text-xl">{{ item.label }}</span>
                    </div>
                </div>
            </div>
        </div>

        

        <!-- FRONTDESK SPECIFIC: Stats & Charts -->
        <div class="grid mt-4" *ngIf="isFrontdesk">
            <!-- Stats Cards -->
            <div class="col-12 md:col-6 lg:col-3">
                <div class="surface-card shadow-2 p-3 border-round">
                    <div class="flex justify-content-between mb-3">
                        <div>
                            <span class="block text-500 font-medium mb-3">Total Patients</span>
                            <div class="text-900 font-medium text-xl">{{ stats.totalPatients }}</div>
                        </div>
                        <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width:2.5rem;height:2.5rem">
                            <i class="pi pi-users text-blue-500 text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 md:col-6 lg:col-3">
                <div class="surface-card shadow-2 p-3 border-round">
                    <div class="flex justify-content-between mb-3">
                        <div>
                            <span class="block text-500 font-medium mb-3">Appointments (All)</span>
                            <div class="text-900 font-medium text-xl">{{ stats.totalAppointments }}</div>
                        </div>
                        <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width:2.5rem;height:2.5rem">
                            <i class="pi pi-calendar text-orange-500 text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 md:col-6 lg:col-3">
                <div class="surface-card shadow-2 p-3 border-round">
                    <div class="flex justify-content-between mb-3">
                        <div>
                            <span class="block text-500 font-medium mb-3">Pending</span>
                            <div class="text-900 font-medium text-xl">{{ stats.pendingAppointments }}</div>
                        </div>
                        <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width:2.5rem;height:2.5rem">
                            <i class="pi pi-clock text-cyan-500 text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 md:col-6 lg:col-3">
                <div class="surface-card shadow-2 p-3 border-round">
                    <div class="flex justify-content-between mb-3">
                        <div>
                            <span class="block text-500 font-medium mb-3">Today's</span>
                            <div class="text-900 font-medium text-xl">{{ stats.todaysAppointments }}</div>
                        </div>
                        <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width:2.5rem;height:2.5rem">
                            <i class="pi pi-calendar-plus text-purple-500 text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-12">
            <div class="surface-card p-4 shadow-2 border-round mt-4" *ngIf="isFrontdesk">
            <div class="flex justify-content-between align-items-center mb-3">
                <div class="text-2xl font-medium text-900">Registered Patients</div>
                <button pButton icon="pi pi-user-plus" label="Register New" (click)="navigateTo('/registration')" class="p-button-sm"></button>
            </div>
            
            <p-table [value]="patientOverview" [paginator]="true" [rows]="5" responsiveLayout="stack" [breakpoint]="'960px'">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="firstName">Name <p-sortIcon field="firstName"></p-sortIcon></th>
                        <th pSortableColumn="dob">Age <p-sortIcon field="dob"></p-sortIcon></th>
                        <th>Gender</th>
                        <th>Contact</th>
                        <th>Vitals (Latest)</th>
                        <th>Latest Appointment</th>
                        <th>Status</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-patient>
                    <tr>
                        <td>
                            <span class="p-column-title font-bold mr-2">Name</span>
                            <div class="inline-block vertical-align-middle">
                                <div class="font-medium">{{ patient.firstName }} {{ patient.lastName }}</div>
                                <small class="text-500">{{ patient.username }}</small>
                            </div>
                        </td>
                        <td>
                            <span class="p-column-title font-bold mr-2">Age</span>
                            <!-- Simple age calculation for display -->
                            {{ getAge(patient.dob) }} yrs
                        </td>
                        <td>
                            <span class="p-column-title font-bold mr-2">Gender</span>
                            {{ patient.gender }}
                        </td>
                        <td>
                            <span class="p-column-title font-bold mr-2">Contact</span>
                            <div class="inline-block vertical-align-middle">
                                <div>{{ patient.phone }}</div>
                            </div>
                        </td>
                        <td>
                            <span class="p-column-title font-bold mr-2">Vitals</span>
                            <div *ngIf="patient.vitals" class="text-sm inline-flex gap-3 vertical-align-middle">
                                <div><i class="pi pi-arrows-v text-primary mr-1"></i> {{ patient.vitals.height }}cm</div>
                                <div><i class="pi pi-stop text-primary mr-1"></i> {{ patient.vitals.weight }}kg</div>
                            </div>
                        </td>
                        <td>
                            <span class="p-column-title font-bold mr-2">Latest Appt</span>
                            <div *ngIf="patient.latestAppointment" class="inline-block vertical-align-middle pl-6">
                                <div class="font-medium" >{{ patient.latestAppointment.date | date:'shortDate' }}</div>
                            </div>
                            <span *ngIf="!patient.latestAppointment" class="text-500">-</span>
                        </td>
                        <td>
                            <span class="p-column-title font-bold mr-2">Status</span>
                             <div class="flex align-items-center gap-2">
                                <p-tag *ngIf="patient.latestAppointment" [severity]="patient.latestAppointment.status | statusSeverity" [value]="patient.latestAppointment.status"></p-tag>
                             </div>
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="7" class="text-center p-4">No patients registered yet.</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
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

        <!-- FRONTDESK SPECIFIC: Registered Patients List -->
      

       

        <!-- PATIENT SPECIFIC: My Appointments -->
        <div class="mt-4" *ngIf="isPatient">
            <!-- Next Appointment Card -->
            <div class="grid mb-4" *ngIf="nextAppointment">
                <div class="col-12 md:col-6">
                    <div class="surface-card shadow-2 p-4 border-round border-left-3 border-primary-500">
                        <div class="text-xl font-medium text-900 mb-2">Next Appointment</div>
                        <div class="flex align-items-center gap-3">
                            <div class="text-4xl font-bold text-primary">{{ nextAppointment.date | date:'d' }}</div>
                            <div>
                                <div class="text-xl font-semibold">{{ nextAppointment.date | date:'MMMM y' }}</div>
                                <div class="text-600">{{ nextAppointment.timeSlot }}</div>
                            </div>
                            <div class="ml-auto">
                                <p-tag [severity]="nextAppointment.status === 'Confirmed' ? 'success' : 'warning'" [value]="nextAppointment.status"></p-tag>
                            </div>
                        </div>
                        <div class="mt-3 text-600">
                            with <span class="font-medium text-900">{{ nextAppointment.dietitianName }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="surface-card p-4 shadow-2 border-round">
                <div class="text-2xl font-medium text-900 mb-3">My Appointments</div>
            <p-table [value]="myAppointments" [tableStyle]="{'min-width': '50rem'}">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Dietitian</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Notes</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-appt>
                    <tr>
                        <td>{{ appt.date | date:'mediumDate' }}</td>
                        <td>{{ appt.timeSlot }}</td>
                        <td>{{ appt.dietitianName }}</td>
                        <td>{{ appt.description }}</td>
                        <td>
                            <p-tag [value]="appt.status" [severity]="appt.status | statusSeverity"></p-tag>
                        </td>
                        <td>
                            <span *ngIf="appt.notes">{{ appt.notes }}</span>
                            <span *ngIf="!appt.notes" class="text-500 font-italic">-</span>
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="6" class="text-center p-4">You have no scheduled appointments.</td>
                    </tr>
                </ng-template>
            </p-table>
            </div>
        </div>

        <div class="surface-card p-4 shadow-2 border-round mt-4" *ngIf="!isFrontdesk && !isPatient">
            <div class="text-2xl font-medium text-900 mb-3">Welcome to your Dashboard</div>
            <p class="text-600 line-height-3 mb-4">
                You are logged in as <strong>{{ currentUser()?.username }}</strong>. 
                Below are the features you have permission to access:
            </p>
            
            <div class="flex flex-wrap gap-2" *ngIf="userPermissions; else noPermissions">
                <p-chip *ngIf="userPermissions.includes('register_patient')" label="" icon="pi pi-check"></p-chip>
                <p-chip *ngIf="userPermissions.includes('manage_dietitians')" label="Manage Dietitians" icon="pi pi-check"></p-chip>
                <p-chip *ngIf="userPermissions.includes('manage_doctors')" label="Add Doctor" icon="pi pi-check"></p-chip>
                <p-chip *ngIf="userPermissions.includes('view_patients')" label="View Patients" icon="pi pi-check"></p-chip>
                <p-chip *ngIf="userPermissions.includes('schedule_appointment')" label="Schedule Appointment" icon="pi pi-check"></p-chip>
                <p-chip *ngIf="userPermissions.includes('add_diet_plan')" label="Add Diet Plan" icon="pi pi-check"></p-chip>
                <p-chip *ngIf="userPermissions.includes('view_doctors')" label="View Doctors" icon="pi pi-check"></p-chip>
                <p-chip *ngIf="userPermissions.includes('view_diet_plan')" label="View Diet Plan" icon="pi pi-check"></p-chip>
            </div>
            <ng-template #noPermissions>
                <p>No special permissions assigned.</p>
            </ng-template>
        </div>
      </div>
    </div>
    `
})
export class DashboardComponent implements OnInit {
    currentUser = this.authService.currentUser;
    menuItems: any[] = [];

    patientOverview: any[] = [];
    myAppointments: any[] = []; // for patients
    isFrontdesk = false;
    isPatient = false;

    // Frontdesk Charts & Stats
    chartData: any;
    chartOptions: any;
    barChartData: any;
    barChartOptions: any;
    stats = {
        totalPatients: 0,
        totalAppointments: 0,
        pendingAppointments: 0,
        todaysAppointments: 0
    };

    // Patient Stats
    nextAppointment: any = null;

    private appointmentService = inject(AppointmentService);

    constructor(private authService: AuthService, private router: Router) { }

    get userPermissions(): string[] {
        return this.currentUser()?.permissions || [];
    }

    ngOnInit() {
        const role = this.authService.getUserRole();
        if (role) {
            this.menuItems = MENU_ITEMS[role] || [];
            this.isFrontdesk = role === Role.Frontdesk;
            this.isPatient = role === Role.Patient;

            if (this.isFrontdesk) {
                this.loadPatientOverview();
                this.initCharts();
            } else if (this.isPatient) {
                this.loadMyAppointments();
            }
        }
    }

    loadMyAppointments() {
        const user = this.currentUser();
        if (user) {
            this.myAppointments = this.appointmentService.getAppointmentsForPatient(user.id);

            // Find next upcoming appointment
            const now = new Date();
            this.nextAppointment = this.myAppointments
                .filter(a => new Date(a.date) >= now && (a.status === 'Confirmed' || a.status === 'Pending'))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
        }
    }

    loadPatientOverview() {
        const allUsers = this.authService.getAllUsers();
        const patients = allUsers.filter(u => u.role === Role.Patient);
        const allAppointments = this.appointmentService.getAllAppointments();

        // Calculate Stats
        this.stats.totalPatients = patients.length;
        this.stats.totalAppointments = allAppointments.length;
        this.stats.pendingAppointments = allAppointments.filter(a => a.status === 'Pending').length;

        const today = new Date().toDateString();
        this.stats.todaysAppointments = allAppointments.filter(a => new Date(a.date).toDateString() === today).length;

        // Prepare Chart Data
        this.prepareCharts(allAppointments);

        this.patientOverview = patients.map(patient => {
            // Find latest appointment
            const patientAppts = allAppointments.filter(a => a.patientId === patient.id);
            const latestAppt = patientAppts.length > 0 ? patientAppts[patientAppts.length - 1] : null;

            return {
                ...patient,
                latestAppointment: latestAppt
            };
        });
    }

    prepareCharts(appointments: any[]) {
        // Doughnut Chart: Status Distribution
        const statuses = ['Confirmed', 'Pending', 'Completed', 'Rejected'];
        const statusCounts = statuses.map(status => appointments.filter(a => a.status === status).length);

        this.chartData = {
            labels: statuses,
            datasets: [
                {
                    data: statusCounts,
                    backgroundColor: ['#22C55E', '#F59E0B', '#3B82F6', '#EF4444'],
                    hoverBackgroundColor: ['#16A34A', '#D97706', '#2563EB', '#DC2626']
                }
            ]
        };

        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: '#495057'
                    }
                }
            }
        };

        // Bar Chart: Upcoming vs Past (Simple week view)
        // For simplicity, let's show appointments per day for the next 5 days
        const labels = [];
        const data = [];
        const today = new Date();

        for (let i = 0; i < 5; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

            const count = appointments.filter(a => new Date(a.date).toDateString() === date.toDateString()).length;
            data.push(count);
        }

        this.barChartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Appointments',
                    data: data,
                    backgroundColor: '#6366f1',
                    borderColor: '#4f46e5',
                    borderWidth: 1,
                    barThickness: 40 // Fixed thickness
                }
            ]
        };

        this.barChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#495057'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,

                    ticks: {
                        color: '#495057',
                        stepSize: 5
                    },
                    grid: {
                        color: '#ebedef'
                    }
                },
                x: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef'
                    }
                }
            }
        };
    }

    initCharts() {
        // Helper if needed, but logic is in prepareCharts called by loadPatientOverview
    }

    navigateTo(path: string) {
        this.router.navigate([path]);
    }

    getAge(dob: any): number {
        if (!dob) return 0;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    logout() {
        this.authService.logout();
    }
}
