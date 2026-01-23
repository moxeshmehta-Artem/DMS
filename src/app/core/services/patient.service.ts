import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PatientService {
    // Map of Patient ID -> Note String
    private patientNotes = new Map<number, string>();

    saveNote(patientId: number, note: string): void {
        this.patientNotes.set(patientId, note);
    }

    getNote(patientId: number): string {
        return this.patientNotes.get(patientId) || '';
    }
}
