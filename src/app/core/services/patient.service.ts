import { Injectable } from '@angular/core';
import { DietPlan } from '../models/diet-plan.model';

@Injectable({
    providedIn: 'root'
})
export class PatientService {
    // Map of Patient ID -> DietPlan
    private patientNotes = new Map<number, DietPlan>();

    saveDietPlan(patientId: number, plan: DietPlan): void {
        this.patientNotes.set(patientId, plan);
    }

    getDietPlan(patientId: number): DietPlan | undefined {
        return this.patientNotes.get(patientId);
    }
}
