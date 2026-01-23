import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { PatientService } from '../../core/services/patient.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-diet-plan-view',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <div class="p-4">
        <p-card header="My Assigned Diet Plan" subheader="Follow these instructions from your Dietitian">
            <div *ngIf="dietPlan; else noPlan" class="white-space-pre-wrap text-lg line-height-3 surface-ground p-4 border-round">
                {{ dietPlan }}
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
  dietPlan = '';

  private patientService = inject(PatientService);
  private authService = inject(AuthService);

  ngOnInit() {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.dietPlan = this.patientService.getNote(currentUser.id);
    }
  }
}
