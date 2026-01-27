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
  imports: [CommonModule, CardModule, ButtonDirective, Button],
  template: `
    <div class="p-4">
        <p-card header="My Assigned Diet Plan" subheader="Follow these instructions from your Dietitian">
            <div *ngIf="dietPlan; else noPlan" class="grid">
                <div class="col-12 md:col-6">
                    <div class="surface-card p-3 shadow-2 border-round h-full border-left-3 border-blue-500">
                        <div class="text-xl font-bold mb-2 text-blue-500">Breakfast</div>
                        <p class="line-height-3 m-0">{{ dietPlan.breakfast }}</p>
                    </div>
                </div>
                <div class="col-12 md:col-6">
                    <div class="surface-card p-3 shadow-2 border-round h-full border-left-3 border-orange-500">
                        <div class="text-xl font-bold mb-2 text-orange-500">Lunch</div>
                        <p class="line-height-3 m-0">{{ dietPlan.lunch }}</p>
                    </div>
                </div>
                <div class="col-12 md:col-6">
                    <div class="surface-card p-3 shadow-2 border-round h-full border-left-3 border-purple-500">
                        <div class="text-xl font-bold mb-2 text-purple-500">Dinner</div>
                        <p class="line-height-3 m-0">{{ dietPlan.dinner }}</p>
                    </div>
                </div>
                <div class="col-12 md:col-6">
                    <div class="surface-card p-3 shadow-2 border-round h-full border-left-3 border-green-500">
                        <div class="text-xl font-bold mb-2 text-green-500">Snacks</div>
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

  private patientService = inject(PatientService);
  private authService = inject(AuthService);

  ngOnInit() {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.dietPlan = this.patientService.getDietPlan(currentUser.id);
    }
  }
}
