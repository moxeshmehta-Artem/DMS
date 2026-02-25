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
}
