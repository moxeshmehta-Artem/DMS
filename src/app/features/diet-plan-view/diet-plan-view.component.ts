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
    templateUrl: './diet-plan-view.component.html'
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
