import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DietPlan } from '../models/diet-plan.model';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class PatientService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private readonly API_URL = 'http://localhost:8080/api/patients';

    saveDietPlan(patientId: number, plan: DietPlan): Observable<any> {
        const currentUser = this.authService.currentUser();
        const request = {
            ...plan,
            dietitianId: currentUser?.id
        };
        return this.http.post(`${this.API_URL}/${patientId}/diet-plans`, request);
    }

    getDietPlan(patientId: number): Observable<DietPlan> {
        return this.http.get<DietPlan>(`${this.API_URL}/${patientId}/diet-plans/latest`);
    }

    getPatientById(patientId: number): Observable<any> {
        return this.http.get<any>(`http://localhost:8080/api/patients/${patientId}`);
    }

    getVitalsHistory(patientId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.API_URL}/${patientId}/vitals`);
    }

    // Progress Tracking (Keep for now, but these could also be moved to backend)
    private dietProgress = new Map<number, any>();

    constructor() {
        this.loadProgress();
    }

    private loadProgress() {
        if (typeof localStorage !== 'undefined') {
            const storedProgress = localStorage.getItem('dms_diet_progress');
            if (storedProgress) {
                this.dietProgress = new Map(JSON.parse(storedProgress));
            }
        }
    }

    private saveProgress() {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('dms_diet_progress', JSON.stringify(Array.from(this.dietProgress.entries())));
        }
    }

    saveDietProgress(patientId: number, status: any): void {
        this.dietProgress.set(patientId, status);
        this.saveProgress();
    }

    getDietProgress(patientId: number): any {
        return this.dietProgress.get(patientId) || { breakfast: false, lunch: false, dinner: false, snacks: false };
    }
}
