import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VitalsRequest {
    height: number;
    weight: number;
    bloodPressureSys?: number;
    bloodPressureDia?: number;
    heartRate?: number;
    temperature?: number;
}

export interface VitalsResponse extends VitalsRequest {
    id: number;
    patientId: number;
    bmi: number;
    recordedAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class VitalsService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/v1/patients';

    addVitals(patientId: number, vitals: VitalsRequest): Observable<VitalsResponse> {
        return this.http.post<VitalsResponse>(`${this.apiUrl}/${patientId}/vitals`, vitals);
    }

    getVitalsHistory(patientId: number): Observable<VitalsResponse[]> {
        return this.http.get<VitalsResponse[]>(`${this.apiUrl}/${patientId}/vitals`);
    }

    getLatestVitals(patientId: number): Observable<VitalsResponse> {
        return this.http.get<VitalsResponse>(`${this.apiUrl}/${patientId}/vitals/latest`);
    }

    updateVitals(vitalsId: number, vitals: VitalsRequest): Observable<VitalsResponse> {
        return this.http.put<VitalsResponse>(`http://localhost:8080/api/v1/patients/vitals/${vitalsId}`, vitals);
    }
}
