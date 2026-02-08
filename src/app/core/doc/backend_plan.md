# Backend Implementation Plan (Spring Boot)

This document outlines the plan for implementing the backend for the Diet Management System (DMS).

## 1. Technology Stack
-   **Language**: Java 17+
-   **Framework**: Spring Boot 3.x
-   **Database**: PostgreSQL
-   **Security**: Spring Security + JWT
-   **Documentation**: Swagger / OpenAPI
-   **Build Tool**: Maven

## 2. Standardized Folder Structure

We will follow a clean architecture approach, separating concerns into layers.

```
src/
└── main/
    ├── java/
    │   └── com/
    │       └── dms/
    │           ├── config/           # App configuration (Security, Swagger, CORS)
    │           ├── controller/       # Rest Controllers (API endpoints)
    │           ├── dto/              # Data Transfer Objects (Request/Response models)
    │           │   ├── request/
    │           │   └── response/
    │           ├── entity/           # JPA Entities (Database tables)
    │           ├── exception/        # Global Exception Handling
    │           ├── repository/       # JPA Repositories (Data Access Layer)
    │           ├── service/          # Business Logic Layer
    │           │   └── impl/         # Service Implementations
    │           ├── util/             # Utility classes (Date utils, JWT utils)
    │           └── DmsApplication.java # Main Entry Point
    └── resources/
        ├── application.yml           # App Configuration (DB, Server Port)
        ├── db/
        │   └── migration/            # Flyway/Liquibase scripts (Optional)
        └── static/                   # Static assets (if any)
```

## 3. Implementation Todo List

### Phase 1: Project Setup & Configuration
- [ ] Initialize Spring Boot Project (Spring Web, JPA, Postgres, Lombok, Security, Validation)
- [ ] Configure `application.yml` (Database URL, Port, logging)
- [ ] Create `SecurityConfig` (Security Filter Chain, PasswordEncoder)
- [ ] Implement `JwtUtils` (Token generation, validation)
- [ ] Create Global Exception Handler (`@ControllerAdvice`)

### Phase 2: User Management & Authentication
- [ ] Implement [User](file:///home/artem/Desktop/Projects/DMS/src/app/core/models/user.model.ts#3-28) Entity (ID, Username, Password, Role)
- [ ] Implement [Role](file:///home/artem/Desktop/Projects/DMS/src/app/core/auth/auth.service.ts#105-108) Enum (Admin, Patient, Dietitian)
- [ ] Create `UserRepository` & `UserService`
- [ ] Implement `AuthController` (Login, Register endpoints)
- [ ] Verify JWT Authentication Flow

### Phase 3: Core Features (Patient & Dietitian)
- [ ] Implement `PatientProfile` Entity (Health data, demographics)
- [ ] Implement `DietitianProfile` Entity (Specialization, availability)
- [ ] Create CRUD APIs for Patients and Dietitians
- [ ] Implement Role-Based Access Control (RBAC) on endpoints

### Phase 4: Appointments & Scheduling
- [ ] Implement `Appointment` Entity (Date, Time, Status, Doctor, Patient)
- [ ] Create `AppointmentService` (Booking logic, overlap checks)
- [ ] Implement `AppointmentController` (Book, Cancel, View)

### Phase 5: AI & System Integration
- [ ] Create `GeminiService` (Backend integration for AI Chatbot)
- [ ] Expose Chatbot API endpoints (Secure proxy to Google API)
- [ ] Integrate File Uploads (for medical reports/meal photos)

### Phase 6: Testing & Deployment
- [ ] Write Unit Tests (JUnit, Mockito) for Services
- [ ] Write Integration Tests for Controllers
- [ ] Dockerize the application (`Dockerfile`, `docker-compose.yml`)
