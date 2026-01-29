# DMS Project Documentation & Workflows

This document outlines the key workflows of the Dietitian Management System (DMS) in a simple, easy-to-understand format.

## 1. User Roles

*   **Admin**: Enters Docresolvedtors into the system.
*   **Dietitian**: Manages Patients and creates Diet Plans.
*   **Patient**: Books appointments and tracks Diet progress.
*   **Frontdesk**: Registers new Patients.

## 2. Workflows

### A. Patient Registration & Login

```mermaid
graph TD
    Start((Start)) --> A[Frontdesk fills Registration Form]
    A --> B{Is Data Valid?}
    B -- No --> C[Show Error Message]
    B -- Yes --> D[System Creates Patient Account]
    D --> E[Patient gets ID & can Login]
    E --> End((End))
```

### B. Appointment Booking

```mermaid
graph TD
    Start((Start)) --> A[Patient selects Doctor]
    A --> B[Select Date & Time]
    B --> C{Is Slot Busy?}
    C -- Yes --> D[Block Selection / Show Error]
    C -- No --> E[Patient enters Reason]
    E --> F[Confirm Booking]
    F --> G[Appointment Saved as 'Pending']
    G --> End((End))
```

### C. Diet Plan & Tracking

```mermaid
graph TD
    Step1[Doctor creates Diet Plan] --> Step2[Patient logs in & views Plan]
    Step2 --> Step3[Patient eats Meal]
    Step3 --> Step4[Patient checks 'Done' box]
    Step4 --> Step5[Progress Bar increases]
    Step5 --> Step6[System saves Progress]
```

### D. Adding a New Doctor (Admin)

```mermaid
graph TD
    Start((Start)) --> A[Admin enters Name, Speciality]
    A --> B[Admin enters Username & Password]
    B --> C[Click 'Add Doctor']
    C --> D[System creates User Account]
    D --> E[System links Doctor Profile]
    E --> F[New Doctor can now Login]
    F --> End((End))
```

## 3. Data Storage (Technical Note)
*   **Local Storage**: All Diet Plans and Progress are saved in your browser, so they don't disappear when you refresh the page.
*   **Mock Data**: Default users and appointments are reset if you reload, but your new additions (like Diet Plans) stick around.
