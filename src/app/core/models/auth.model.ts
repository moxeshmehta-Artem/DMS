export interface JwtResponse {
    token: string;
    id: number;
    username: string;
    email: string;
    roles: string[];
    type: string;
}

export interface LoginRequest {
    username: string;
    password?: string;
}

export interface SignupRequest {
    username: string;
    email: string;
    password: string;
    role: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    gender?: string;
    dateOfBirth?: string;
}

export interface RegistrationResponse {
    success: boolean;
    message: string;
}
