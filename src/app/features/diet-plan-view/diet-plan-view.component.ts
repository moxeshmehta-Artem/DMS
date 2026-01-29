import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Added
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox'; // Added
import { ProgressBarModule } from 'primeng/progressbar'; // Added
import { PatientService } from '../../core/services/patient.service';
import { AuthService } from '../../core/auth/auth.service';
import { ButtonDirective, Button } from "primeng/button";
import jsPDF from 'jspdf';

@Component({
    selector: 'app-diet-plan-view',
    standalone: true,
    imports: [CommonModule, CardModule, Button, FormsModule, CheckboxModule, ProgressBarModule],
    template: `
    <div class="p-4">
        <p-card header="My Assigned Diet Plan" subheader="Follow these instructions from your Dietitian">
            
            <div class="mb-4" *ngIf="dietPlan">
                <label class="block font-bold mb-2">Daily Progress: {{ progress }}%</label>
                <p-progressBar [value]="progress"></p-progressBar>
            </div>

            <div *ngIf="dietPlan; else noPlan" class="grid">
                <div class="col-12 md:col-6">
                    <div class="surface-card p-3 shadow-2 border-round h-full border-left-3 border-blue-500 relative">
                        <div class="flex align-items-center justify-content-between mb-2">
                            <div class="text-xl font-bold text-blue-500">Breakfast</div>
                            <p-checkbox [(ngModel)]="completionStatus.breakfast" [binary]="true" (onChange)="onCheck()"></p-checkbox>
                        </div>
                        <p class="line-height-3 m-0">{{ dietPlan.breakfast }}</p>
                    </div>
                </div>
                <div class="col-12 md:col-6">
                    <div class="surface-card p-3 shadow-2 border-round h-full border-left-3 border-orange-500 relative">
                         <div class="flex align-items-center justify-content-between mb-2">
                            <div class="text-xl font-bold text-orange-500">Lunch</div>
                            <p-checkbox [(ngModel)]="completionStatus.lunch" [binary]="true" (onChange)="onCheck()"></p-checkbox>
                        </div>
                        <p class="line-height-3 m-0">{{ dietPlan.lunch }}</p>
                    </div>
                </div>
                <div class="col-12 md:col-6">
                    <div class="surface-card p-3 shadow-2 border-round h-full border-left-3 border-purple-500 relative">
                        <div class="flex align-items-center justify-content-between mb-2">
                            <div class="text-xl font-bold text-purple-500">Dinner</div>
                            <p-checkbox [(ngModel)]="completionStatus.dinner" [binary]="true" (onChange)="onCheck()"></p-checkbox>
                        </div>
                        <p class="line-height-3 m-0">{{ dietPlan.dinner }}</p>
                    </div>
                </div>
                <div class="col-12 md:col-6">
                    <div class="surface-card p-3 shadow-2 border-round h-full border-left-3 border-green-500 relative">
                        <div class="flex align-items-center justify-content-between mb-2">
                            <div class="text-xl font-bold text-green-500">Snacks</div>
                            <p-checkbox [(ngModel)]="completionStatus.snacks" [binary]="true" (onChange)="onCheck()"></p-checkbox>
                        </div>
                        <p class="line-height-3 m-0">{{ dietPlan.snacks }}</p>
                    </div>
                </div>
                <div class="col-12 md:col-6">
                    <p-button label="Download Plan" icon="pi pi-download" (onClick)="downloadPlan()"></p-button>
                </div>
            </div>
            <ng-template #noPlan>
                <div class="text-center p-5 surface-ground border-round">
                    <i class="pi pi-inbox text-4xl text-500 mb-3"></i>
                    <p class="text-600 m-0">No specific diet plan has been assigned yet.</p>
                </div>
            </ng-template>
        </p-card>
    </div>
    `
})
export class DietPlanViewComponent implements OnInit {
    downloadPlan() {
        // write logic of pdf generation
        const pdf = new jsPDF();
        pdf.text(this.dietPlan.breakfast, 10, 10);
        pdf.text(this.dietPlan.lunch, 10, 20);
        pdf.text(this.dietPlan.dinner, 10, 30);
        pdf.text(this.dietPlan.snacks, 10, 40);
        pdf.save('diet-plan.pdf');
    }
    dietPlan: any = null;
    completionStatus = { breakfast: false, lunch: false, dinner: false, snacks: false };
    progress = 0;

    private patientService = inject(PatientService);
    private authService = inject(AuthService);

    ngOnInit() {
        const currentUser = this.authService.currentUser();
        if (currentUser) {
            this.dietPlan = this.patientService.getDietPlan(currentUser.id);

            // Load saved progress
            const savedStatus = this.patientService.getDietProgress(currentUser.id);
            if (savedStatus) {
                this.completionStatus = savedStatus;
                this.calculateProgress();
            }
        }
    }

    onCheck() {
        this.calculateProgress();
        const currentUser = this.authService.currentUser();
        if (currentUser) {
            this.patientService.saveDietProgress(currentUser.id, this.completionStatus);
        }
    }

    calculateProgress() {
        let completed = 0;
        if (this.completionStatus.breakfast) completed++;
        if (this.completionStatus.lunch) completed++;
        if (this.completionStatus.dinner) completed++;
        if (this.completionStatus.snacks) completed++;

        this.progress = (completed / 4) * 100;
    }
}
