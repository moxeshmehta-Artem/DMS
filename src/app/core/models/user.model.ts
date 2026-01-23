import { Role } from './role.enum';

export interface User {
    id: number;
    username: string;
    role: Role;
    permissions: string[];
    firstName?: string;
    lastName?: string;
    token?: string;

    // Patient Specific Fields
    email?: string;
    phone?: string;
    dob?: Date;
    gender?: 'Male' | 'Female' | 'Other';
    address?: string;
    vitals?: {
        height?: number; // cm
        weight?: number; // kg
        bmi?: number;
        bloodPressureSys?: number;
        bloodPressureDia?: number;
        heartRate?: number;
        temperature?: number;
    };
}
