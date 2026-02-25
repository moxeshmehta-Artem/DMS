import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { PatientService } from '../../core/services/patient.service';
import { AuthService } from '../../core/auth/auth.service';
import { ButtonDirective, Button } from "primeng/button";
import jsPDF from 'jspdf';

@Component({
    selector: 'app-diet-plan-view',
    standalone: true,
    imports: [CommonModule, CardModule, Button],
    templateUrl: './diet-plan-view.component.html'
})
export class DietPlanViewComponent implements OnInit {
    downloadPlan() {
        if (!this.dietPlan) return;

        const doc = new jsPDF();
        const patient = this.authService.currentUser();
        const date = new Date().toLocaleDateString();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(41, 128, 185); // Blue
        doc.text('Diet Management System', 105, 20, { align: 'center' });

        doc.setFontSize(16);
        doc.setTextColor(100);
        doc.text('Personalized Diet Plan', 105, 30, { align: 'center' });

        // horizontal line
        doc.setDrawColor(200);
        doc.line(20, 35, 190, 35);

        // Patient Info
        doc.setFontSize(12);
        doc.setTextColor(50);
        doc.text(`Patient: ${patient?.firstName} ${patient?.lastName}`, 20, 45);
        doc.text(`Date: ${date}`, 190, 45, { align: 'right' });

        // Meal Sections
        let yPos = 60;
        const meals = [
            { title: 'BREAKFAST', content: this.dietPlan.breakfast, color: [52, 152, 219] },
            { title: 'LUNCH', content: this.dietPlan.lunch, color: [230, 126, 34] },
            { title: 'DINNER', content: this.dietPlan.dinner, color: [155, 89, 182] },
            { title: 'SNACKS', content: this.dietPlan.snacks || 'No snacks assigned', color: [46, 204, 113] }
        ];

        meals.forEach(meal => {
            // Meal Header
            doc.setFontSize(14);
            doc.setTextColor(meal.color[0], meal.color[1], meal.color[2]);
            doc.text(meal.title, 20, yPos);

            // Content
            doc.setFontSize(11);
            doc.setTextColor(60);
            const lines = doc.splitTextToSize(meal.content || 'None', 160);
            doc.text(lines, 25, yPos + 7);

            yPos += (lines.length * 7) + 15;
        });

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('Stay healthy and follow the plan!', 105, 285, { align: 'center' });

        doc.save(`DietPlan_${patient?.lastName || 'Patient'}.pdf`);
    }
    dietPlan: any = null;

    private patientService = inject(PatientService);
    private authService = inject(AuthService);

    ngOnInit() {
        const currentUser = this.authService.currentUser();
        if (currentUser) {
            this.patientService.getDietPlan(currentUser.id).subscribe({
                next: (plan: any) => {
                    this.dietPlan = plan;
                },
                error: (err: any) => {
                    console.error('Failed to load diet plan', err);
                }
            });
        }
    }
}
