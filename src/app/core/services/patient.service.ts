import { Injectable } from '@angular/core';
import { DietPlan } from '../models/diet-plan.model';

@Injectable({
    providedIn: 'root'
})
export class PatientService {
    // Map of Patient ID -> DietPlan
    private patientNotes = new Map<number, DietPlan>();
    // Progress Tracking
    private dietProgress = new Map<number, any>();

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage() {
        if (typeof localStorage !== 'undefined') {
            const storedPlans = localStorage.getItem('dms_diet_plans');
            if (storedPlans) {
                this.patientNotes = new Map(JSON.parse(storedPlans));
            }

            const storedProgress = localStorage.getItem('dms_diet_progress');
            if (storedProgress) {
                this.dietProgress = new Map(JSON.parse(storedProgress));
            }
        }
    }

    private saveToStorage() {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('dms_diet_plans', JSON.stringify(Array.from(this.patientNotes.entries())));
            localStorage.setItem('dms_diet_progress', JSON.stringify(Array.from(this.dietProgress.entries())));
        }
    }

    saveDietPlan(patientId: number, plan: DietPlan): void {
        this.patientNotes.set(patientId, plan);
        this.saveToStorage();
    }

    getDietPlan(patientId: number): DietPlan | undefined {
        return this.patientNotes.get(patientId);
    }

    saveDietProgress(patientId: number, status: any): void {
        this.dietProgress.set(patientId, status);
        this.saveToStorage();
    }

    getDietProgress(patientId: number): any {
        return this.dietProgress.get(patientId) || { breakfast: false, lunch: false, dinner: false, snacks: false };
    }
}
