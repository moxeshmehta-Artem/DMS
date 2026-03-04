# JWT Authentication Flow — From HTML to Database 🔐

> **Your complete guide to how a user's login journey works**, from the moment they type their password to the database query and back. Every piece of code is from the real DMS (Diet Management System) project.

---

## 🗺️ The Big Picture (Read This First!)

Think of JWT authentication like getting into an office building:

1. **You show your ID card** (username + password) at the **reception desk** (Login Page)
2. The receptionist **calls security** (Backend Server) to **verify your identity** (check the database)
3. Security gives you a **visitor badge** (JWT Token) that has your **name, role, and expiry time** stamped on it
4. Every time you enter a room (access a page), the security camera **reads your badge** (JWT Interceptor) to make sure you're allowed in
5. You **keep the badge in your pocket** (Browser's localStorage) so you don't have to go back to reception every time

```mermaid
sequenceDiagram
    participant U as 👤 User (Browser)
    participant HTML as 📄 Login Page (HTML)
    participant TS as ⚡ LoginComponent (TypeScript)
    participant AS as 🔧 AuthService (Angular)
    participant INT as 🔗 HTTP Interceptor
    participant API as 🌐 AuthController (Spring Boot)
    participant SVC as ⚙️ AuthServiceImpl (Java)
    participant JWT as 🔑 JwtUtils
    participant DB as 🗄️ Database (MySQL)

    U->>HTML: Types username & password
    HTML->>TS: Click "Sign In" → onLogin()
    TS->>AS: authService.login({username, password})
    AS->>API: POST /api/auth/login (JSON body)
    API->>SVC: authService.login(loginRequest)
    SVC->>DB: userRepository.findByUsername()
    DB-->>SVC: Returns User entity
    SVC->>SVC: passwordEncoder.matches() ✅
    SVC->>JWT: generateToken(username, role, id)
    JWT-->>SVC: "eyJhbGciOi..." (JWT string)
    SVC-->>API: JwtResponse (token + user info)
    API-->>AS: HTTP 200 + JSON response
    AS->>AS: Save token to localStorage
    AS-->>TS: Returns User object
    TS->>U: Navigate to /dashboard 🎉

    Note over U,DB: --- LATER: Accessing a Protected Page ---

    U->>INT: Clicks "My Appointments"
    INT->>INT: Reads token from AuthService
    INT->>API: GET /api/appointments + "Bearer eyJ..."
    API->>JWT: validateJwtToken() + extract username/role
    JWT-->>API: ✅ Valid → username="artem", role="ROLE_PATIENT"
    API->>DB: Fetch appointments
    DB-->>API: Appointment data
    API-->>U: JSON response → rendered on screen
```

---

## 📖 Step-by-Step Code Walkthrough

---

### STEP 1 — The Login Page (HTML)

> **What**: The form the user sees and fills out.
> **File**: [DMS/src/app/features/auth/login/login.component.html](file:///home/artem/Desktop/DMS-Main/DMS/src/app/features/auth/login/login.component.html)

```html
<div class="flex justify-content-center align-items-center surface-ground min-h-screen">
    <p-card header="Welcome Back" [style]="{ width: '360px' }" styleClass="shadow-4">
        <ng-template pTemplate="subtitle">
            Please sign in to continue
        </ng-template>

        <div class="flex flex-column gap-3 mt-3">
            <!-- Username Field -->
            <div class="flex flex-column gap-2">
                <label for="username">Username</label>
                <input pInputText id="username" [(ngModel)]="username"
                       #user="ngModel" required
                       placeholder="Enter your username" />
                <small class="text-red-500"
                       *ngIf="user.invalid && (user.dirty || user.touched)">
                    Username is required
                </small>
            </div>

            <!-- Password Field -->
            <div class="flex flex-column gap-2">
                <label for="password">Password</label>
                <p-password id="password" [(ngModel)]="password"
                            #pass="ngModel" required [feedback]="false"
                            [toggleMask]="true"
                            placeholder="Enter your password">
                </p-password>
                <small class="text-red-500"
                       *ngIf="pass.invalid && (pass.dirty || pass.touched)">
                    Password is required
                </small>
            </div>

            <!-- Error Message -->
            <div *ngIf="loginError" class="text-red-500 text-sm">
                Invalid username or password.
            </div>

            <!-- Submit Button -->
            <p-button label="Sign In" (onClick)="onLogin()"
                      [loading]="isLoading"
                      [disabled]="!username || !password"
                      styleClass="w-full mt-2">
            </p-button>
        </div>
    </p-card>
</div>
```

#### 🧠 Line-by-Line Explanation

| Code | What it does |
|------|-------------|
| `[(ngModel)]="username"` | **Two-way binding** — whatever the user types is instantly stored in the `username` variable in the TypeScript file, and vice-versa |
| `#user="ngModel"` | Creates a reference called `user` so we can check if the field is valid/invalid |
| `*ngIf="user.invalid && (user.dirty || user.touched)"` | Shows the error message **only if** the field is empty AND the user has interacted with it |
| [(onClick)="onLogin()"](file:///home/artem/Desktop/DMS-Main/DMS-Backend/src/main/java/com/example/DMS_Backend/security/jwt/JwtUtils.java#46-49) | When the button is clicked, it calls the [onLogin()](file:///home/artem/Desktop/DMS-Main/DMS/src/app/features/auth/login/login.component.ts#22-41) function in the TypeScript file |
| `[loading]="isLoading"` | Shows a spinning loader on the button while the login request is being processed |
| `[disabled]="!username || !password"` | **Disables** the button if either field is empty — prevents empty form submission |

> [!TIP]
> **Real-world analogy**: This HTML is like the **paper form** at a hotel reception desk. You fill in your name and a secret code, then press the bell (Sign In button).

---

### STEP 2 — The Login Component (TypeScript)

> **What**: The "brain" behind the login page. Handles what happens when the user clicks "Sign In".
> **File**: [DMS/src/app/features/auth/login/login.component.ts](file:///home/artem/Desktop/DMS-Main/DMS/src/app/features/auth/login/login.component.ts)

```typescript
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { SharedUiModule } from '../../../shared/modules/shared-ui.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ SharedUiModule ],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';        // Stores what the user types in the username field
  password = '';        // Stores what the user types in the password field
  isLoading = false;    // Controls the loading spinner on the button
  loginError = false;   // Controls whether the error message is shown

  constructor(
    private authService: AuthService,  // Injected service that talks to the backend
    private router: Router             // Used to navigate to different pages
  ) { }

  onLogin() {
    this.loginError = false;                    // 1. Reset any previous error
    if (this.username && this.password) {       // 2. Only proceed if both fields are filled
      this.isLoading = true;                    // 3. Show loading spinner

      //  4. Call the AuthService to send credentials to the backend
      this.authService.login({ username: this.username, password: this.password })
        .subscribe({
          next: () => {                          // 5. SUCCESS: Backend returned a token
            this.router.navigate(['/dashboard']); //    → Navigate to dashboard
            this.isLoading = false;               //    → Stop loading spinner
          },
          error: (err) => {                      // 6. FAILURE: Wrong credentials
            console.error('Login failed', err);
            this.loginError = true;               //    → Show error message
            this.isLoading = false;               //    → Stop loading spinner
          }
        });
    }
  }
}
```

#### 🧠 Key Concepts Explained

| Concept | Explanation |
|---------|------------|
| `@Component` | Tells Angular "this class is a UI component" — it has an HTML template and logic |
| [constructor(private authService: AuthService)](file:///home/artem/Desktop/DMS-Main/DMS/src/app/core/auth/auth.service.ts#22-25) | **Dependency Injection** — Angular automatically creates an [AuthService](file:///home/artem/Desktop/DMS-Main/DMS/src/app/core/auth/auth.service.ts#10-146) instance and gives it to this component |
| `.subscribe()` | Since the HTTP call is **asynchronous** (takes time), `.subscribe()` lets us wait for the result and handle success ([next](file:///home/artem/Desktop/DMS-Main/DMS/src/app/features/auth/login/login.component.ts#29-33)) or failure ([error](file:///home/artem/Desktop/DMS-Main/DMS/src/app/features/auth/login/login.component.ts#33-38)) |
| `this.router.navigate(['/dashboard'])` | After successful login, redirect the user to the dashboard page |

> [!TIP]
> **Real-world analogy**: This component is like the **receptionist** — they take your form, hand it to the security office (AuthService), and based on the response, either let you in or tell you something is wrong.

---

### STEP 3 — The Auth Service (Frontend "Brain")

> **What**: The central hub that manages login, token storage, and user session.
> **File**: [DMS/src/app/core/auth/auth.service.ts](file:///home/artem/Desktop/DMS-Main/DMS/src/app/core/auth/auth.service.ts)

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly TOKEN_KEY = 'auth_token';
    private readonly API_URL = 'http://localhost:8080/api/auth';

    private http = inject(HttpClient);
    private router = inject(Router);
    currentUser = signal<User | null>(null);  // Reactive state — who is currently logged in

    constructor() {
        this.restoreSession();  // On app start, check if user was already logged in
    }
```

#### 3a. The [login()](file:///home/artem/Desktop/DMS-Main/DMS-Backend/src/main/java/com/example/DMS_Backend/service/impl/AuthServiceImpl.java#35-56) method — Sends credentials to the backend

```typescript
    login(credentials: LoginRequest): Observable<User> {
        return this.http.post<JwtResponse>(`${this.API_URL}/login`, credentials).pipe(
            map(response => {
                // Build a User object from the backend's response
                const user: User = {
                    id: response.id,
                    username: response.username,
                    role: this.mapBackendRoleToEnum(response.roles),
                    firstName: response.username,
                    lastName: '',
                    email: response.email,
                    token: response.token,       //  ← THE JWT TOKEN!
                    permissions: []
                };

                this.saveToken(response.token, user);  // Save token to localStorage
                return user;
            })
        );
    }
```

**What happens here:**
1. `this.http.post(...)` sends a `POST` request to `http://localhost:8080/api/auth/login` with `{ username, password }` as JSON
2. The backend responds with a [JwtResponse](file:///home/artem/Desktop/DMS-Main/DMS-Backend/src/main/java/com/example/DMS_Backend/dto/response/JwtResponse.java#9-22) (token + user info)
3. We build a [User](file:///home/artem/Desktop/DMS-Main/DMS/src/app/core/models/user.model.ts#3-34) object and **save the token** to `localStorage`

#### 3b. Saving and restoring the token

```typescript
    // Save token so user stays logged in even after refreshing the browser
    private saveToken(token: string, user: User) {
        this.currentUser.set(user);
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.TOKEN_KEY, token);  // 💾 Stored in browser!
        }
    }

    // Called on app startup — checks if a token exists in localStorage
    private restoreSession() {
        if (typeof localStorage !== 'undefined') {
            const token = localStorage.getItem(this.TOKEN_KEY);
            if (token) {
                const user = this.decodeToken(token);
                if (user) {
                    this.currentUser.set(user);   // Restore the session
                } else {
                    this.logout();                 // Token is invalid/expired
                }
            }
        }
    }
```

#### 3c. Decoding the JWT token (reading the visitor badge)

```typescript
    private decodeToken(token: string): User | null {
        try {
            // JWT has 3 parts separated by dots: HEADER.PAYLOAD.SIGNATURE
            // atob() decodes the base64-encoded PAYLOAD (middle part)
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                id: payload.id,
                username: payload.sub,       // "sub" = subject (standard JWT field)
                role: this.mapBackendRoleToEnum([payload.role]),
                token: token,
                permissions: [],
                firstName: payload.sub,
                lastName: ''
            };
        } catch (e) {
            console.error('Error decoding token', e);
            return null;
        }
    }
```

> [!IMPORTANT]
> **JWT Token Structure** — A JWT looks like this:
> ```
> eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiUk9MRV9QQVRJRU5UIiwiaWQiOjEsInN1YiI6ImFydGVtIiwiaWF0IjoxNzA5MTIzNDU2LCJleHAiOjE3MDkxMjcwNTZ9.abc123signature
> │                    │  │                                                                                                    │  │                │
> └──── HEADER ────────┘  └──────────────────────────── PAYLOAD (your data) ────────────────────────────────────────────────────┘  └── SIGNATURE ───┘
> ```
> - **Header**: Algorithm used (HS256)
> - **Payload**: Your data (username, role, id, expiry time) — this is what `atob()` decodes
> - **Signature**: A cryptographic stamp that proves the token hasn't been tampered with

#### 3d. Logout — Destroying the session

```typescript
    logout() {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(this.TOKEN_KEY);  // Delete from browser storage
        }
        this.currentUser.set(null);                    // Clear the user state
        this.router.navigate(['/auth/login']);          // Redirect to login page
    }
```

> [!TIP]
> **Real-world analogy**: The AuthService is like the **security office** in your building. It:
> - Issues badges (saves tokens)
> - Checks if your badge is still valid (restoreSession)
> - Can read the info on your badge (decodeToken)
> - Takes your badge away when you leave (logout)

---

### STEP 4 — The HTTP Interceptor (Automatic Badge Showing)

> **What**: Automatically attaches the JWT token to **every** HTTP request so the backend knows who you are.
> **File**: [DMS/src/app/core/auth/auth.interceptor.ts](file:///home/artem/Desktop/DMS-Main/DMS/src/app/core/auth/auth.interceptor.ts)

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();     // Get the stored JWT token

    if (token) {
        // Clone the request and add the Authorization header
        const cloned = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        return next(cloned);   // Send the modified request
    }

    return next(req);  // No token? Send the original request as-is
};
```

#### 🧠 What's happening?

Every time Angular makes **any** HTTP request (e.g., fetching appointments, loading patient data), this interceptor **automatically**:

1. Grabs the JWT token from the [AuthService](file:///home/artem/Desktop/DMS-Main/DMS/src/app/core/auth/auth.service.ts#10-146)
2. Adds it as a header: `Authorization: Bearer eyJhbGciOi...`
3. Sends the request with this header

**The developer doesn't need to manually add the token to every request!**

> [!TIP]
> **Real-world analogy**: This is like having a **smart lanyard** on your visitor badge. Every time you approach a door (make a request), the lanyard **automatically** holds up your badge so the camera can read it. You don't have to manually show it each time.

---

### STEP 5 — The Auth Guard (Page Access Control)

> **What**: Prevents unauthenticated users from accessing protected pages.
> **File**: [DMS/src/app/core/auth/auth.guard.ts](file:///home/artem/Desktop/DMS-Main/DMS/src/app/core/auth/auth.guard.ts)

```typescript
export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // CHECK 1: Is the user logged in at all?
    if (!authService.isAuthenticated()) {
        return router.createUrlTree(['/auth/login']);  // No → redirect to login
    }

    // CHECK 2: Does the user have the required role for this page?
    const expectedRoles = route.data['roles'] as Role[];
    const userRole = authService.getUserRole();

    if (expectedRoles && userRole && !expectedRoles.includes(userRole)) {
        return router.createUrlTree(['/dashboard']);  // Wrong role → redirect to dashboard
    }

    return true;  // ✅ All checks passed — allow access
};
```

> [!TIP]
> **Real-world analogy**: The guard is like a **security checkpoint** at a restricted floor. It checks:
> 1. Do you have a badge at all? (authenticated?)
> 2. Does your badge allow access to **this** floor? (correct role?)

---

## 🌐 CROSSING THE NETWORK — Now We Enter the Backend (Java / Spring Boot)

---

### STEP 6 — The Data Models (DTOs — Data Transfer Objects)

> **What**: These define the **shape** of the data being sent between frontend and backend.

#### 6a. LoginRequest — What the frontend sends

**File**: `DMS-Backend/.../dto/request/LoginRequest.java`

```java
@Data                              // Lombok: auto-generates getters, setters, toString
public class LoginRequest {
    @NotBlank                      // Validation: username cannot be empty/null
    private String username;
    @NotBlank                      // Validation: password cannot be empty/null
    private String password;
}
```

#### 6b. JwtResponse — What the backend sends back

**File**: `DMS-Backend/.../dto/response/JwtResponse.java`

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder                                       // Allows building objects step by step
public class JwtResponse {
    private String token;                      // The JWT token string
    private Long id;                           // User's database ID
    private String username;                   // Username
    private String email;                      // Email
    private List<String> roles;                // List of roles (e.g., ["ROLE_PATIENT"])
    @Builder.Default
    private String type = "Bearer";            // Token type (always "Bearer")
}
```

**Example JSON that travels over the network:**

```json
// Frontend SENDS (LoginRequest):
{
  "username": "artem",
  "password": "mySecretPass123"
}

// Backend RESPONDS (JwtResponse):
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiUk9MRV9QQVRJRU5UIi...",
  "id": 1,
  "username": "artem",
  "email": "artem@example.com",
  "roles": ["ROLE_PATIENT"],
  "type": "Bearer"
}
```

---

### STEP 7 — The Auth Controller (The Backend "Reception Desk")

> **What**: Receives the HTTP request from the frontend and routes it to the right service.
> **File**: `DMS-Backend/.../controllers/AuthController.java`

```java
@RestController                    // This class handles HTTP requests and returns JSON
@RequestMapping("/api/auth")       // All URLs here start with /api/auth
@RequiredArgsConstructor           // Auto-injects dependencies via constructor
public class AuthController {

    private final AuthService authService;   // The service that does the actual work

    @PostMapping("/login")         // Handles POST requests to /api/auth/login
    public ResponseEntity<?> authenticateUser(
            @Valid @RequestBody LoginRequest loginRequest) {
        //  ↑ @Valid = validate the input   ↑ @RequestBody = parse JSON body into Java object

        // Delegate to the service layer
        Optional<JwtResponse> jwtResponse = authService.login(loginRequest);

        if (jwtResponse.isEmpty()) {       // Login failed
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Invalid username or password!"));
        }

        return ResponseEntity.ok(jwtResponse.get());   // Login succeeded → return JWT
    }
}
```

#### 🧠 Key Concepts Explained

| Annotation | What it does |
|-----------|-------------|
| `@RestController` | Tells Spring "this class handles web requests and returns JSON" |
| `@RequestMapping("/api/auth")` | Base URL path — all endpoints in this class start with `/api/auth` |
| `@PostMapping("/login")` | This method handles `POST /api/auth/login` |
| `@Valid` | Triggers validation rules (like `@NotBlank` on [LoginRequest](file:///home/artem/Desktop/DMS-Main/DMS-Backend/src/main/java/com/example/DMS_Backend/dto/request/LoginRequest.java#6-13)) before the method runs |
| `@RequestBody` | Takes the raw JSON from the HTTP request body and converts it into a [LoginRequest](file:///home/artem/Desktop/DMS-Main/DMS-Backend/src/main/java/com/example/DMS_Backend/dto/request/LoginRequest.java#6-13) Java object |
| `ResponseEntity` | A wrapper that lets you control the HTTP status code (200 OK, 400 Bad Request, etc.) |

---

### STEP 8 — The Auth Service Implementation (The Real Work!!)

> **What**: Contains the actual business logic — database lookup, password verification, and token generation.
> **File**: `DMS-Backend/.../service/impl/AuthServiceImpl.java`

```java
@Service                          // Marks this as a Spring service (business logic layer)
@RequiredArgsConstructor          // Constructor injection for all final fields
@Slf4j                            // Adds a logger
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;         // Talks to the database
    private final PasswordEncoder passwordEncoder;       // BCrypt password hasher
    private final JwtUtils jwtUtils;                     // JWT token generator

    @Override
    public Optional<JwtResponse> login(LoginRequest loginRequest) {

        // ╔══════════════════════════════════════════════════════════╗
        // ║  STEP 8a: LOOK UP THE USER IN THE DATABASE             ║
        // ╚══════════════════════════════════════════════════════════╝
        Optional<User> userOptional = userRepository.findByUsername(loginRequest.getUsername());
        //              ↑ This generates: SELECT * FROM users WHERE username = 'artem'

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // ╔══════════════════════════════════════════════════════╗
            // ║  STEP 8b: VERIFY THE PASSWORD                      ║
            // ╚══════════════════════════════════════════════════════╝
            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                // passwordEncoder.matches("mySecretPass123", "$2a$10$hashed...")
                // BCrypt compares the plain password with the hashed version from DB

                // ╔══════════════════════════════════════════════════╗
                // ║  STEP 8c: GENERATE THE JWT TOKEN                ║
                // ╚══════════════════════════════════════════════════╝
                String roleString = user.getRole().name();  // e.g., "ROLE_PATIENT"
                String jwt = jwtUtils.generateToken(
                    user.getUsername(),  // "artem"
                    roleString,         // "ROLE_PATIENT"
                    user.getId()        // 1
                );

                // ╔══════════════════════════════════════════════════╗
                // ║  STEP 8d: BUILD THE RESPONSE                   ║
                // ╚══════════════════════════════════════════════════╝
                return Optional.of(JwtResponse.builder()
                        .token(jwt)                                    // The JWT string
                        .id(user.getId())                              // User ID
                        .username(user.getUsername())                   // Username
                        .email(user.getEmail())                        // Email
                        .roles(Collections.singletonList(roleString))  // ["ROLE_PATIENT"]
                        .build());
            }
        }

        // If we get here, either the username doesn't exist or the password was wrong
        return Optional.empty();  // → Controller will return 400 Bad Request
    }
}
```

> [!IMPORTANT]
> **Password Security**: The real password is **never** stored in the database! Only a `BCrypt` hash like `$2a$10$xJ9k...` is stored. `passwordEncoder.matches()` hashes the input and compares it with the stored hash.

---

### STEP 9 — The User Entity & Database (Where Data Lives)

> **What**: The Java class that maps directly to the `users` table in MySQL.
> **File**: `DMS-Backend/.../entities/User.java`

```java
@Entity                                            // This class maps to a database table
@Table(name = "users", uniqueConstraints = {       // Table name is "users"
        @UniqueConstraint(columnNames = "username"),
        @UniqueConstraint(columnNames = "email")
})
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class User extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // Auto-increment ID
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;       // ← Stored as BCrypt hash, NOT plain text!

    @Enumerated(EnumType.STRING)   // Store role as string ("ROLE_PATIENT"), not number
    @Column(nullable = false)
    private Role role;

    private String firstName;
    private String lastName;
    private String phone;
    private String gender;
    private int age;
    private java.time.LocalDate dateOfBirth;
}
```

#### The Role Enum

```java
public enum Role {
    ROLE_USER,
    ROLE_ADMIN,
    ROLE_DIETITIAN,
    ROLE_PATIENT,
    ROLE_FRONTDESK
}
```

#### The Repository (Database Query Layer)

```java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);   // → SELECT * FROM users WHERE username = ?
    Boolean existsByUsername(String username);         // → SELECT COUNT(*) > 0 ...
    Boolean existsByEmail(String email);              // → SELECT COUNT(*) > 0 ...
}
```

> [!NOTE]
> **Spring Data JPA Magic**: You don't write SQL queries! Just by naming a method [findByUsername](file:///home/artem/Desktop/DMS-Main/DMS-Backend/src/main/java/com/example/DMS_Backend/repositories/UserRepository.java#11-12), Spring **automatically** generates the SQL query `SELECT * FROM users WHERE username = ?`. This is called **query derivation**.

#### What the `users` table looks like in MySQL:

```
+----+----------+-------------------+--------------------------------------------------------------+---------------+--------+----------+-------+
| id | username | email             | password                                                     | role          | first_ | last_    | phone |
|    |          |                   |                                                              |               | name   | name     |       |
+----+----------+-------------------+--------------------------------------------------------------+---------------+--------+----------+-------+
| 1  | artem    | artem@example.com | $2a$10$xJ9kLq5hVpNmT3RwGnJF1e4X8ZKb4jC1pL2qRsT7mNvWxYzAbC  | ROLE_PATIENT  | Artem  | Kumar    | 99... |
| 2  | drsmith  | smith@clinic.com  | $2a$10$aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5aB6cD7eF8gH  | ROLE_DIETITIAN| Dr.    | Smith    | 88... |
| 3  | admin01  | admin@dms.com     | $2a$10$pQ9rS0tU1vW2xY3zA4bC5dE6fG7hI8jK9lM0nO1pQ2rS3tU4vW  | ROLE_ADMIN    | Admin  | System   | null  |
+----+----------+-------------------+--------------------------------------------------------------+---------------+--------+----------+-------+
```

---

### STEP 10 — JWT Token Generation (Creating the Badge)

> **What**: Creates the cryptographically signed token that proves your identity.
> **File**: `DMS-Backend/.../security/jwt/JwtUtils.java`

```java
@Component
public class JwtUtils {

    @Value("${dms.app.jwtSecret}")          // Read from application.properties
    private String jwtSecret;               // The secret key used to sign tokens

    @Value("${dms.app.jwtExpirationMs}")    // Read from application.properties
    private int jwtExpirationMs;            // How long the token is valid (milliseconds)

    /**
     * GENERATE a new JWT token
     */
    public String generateToken(String username, String role, Long id) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);    // e.g., "ROLE_PATIENT"
        claims.put("id", id);       // e.g., 1

        return Jwts.builder()
                .claims(claims)                              // Custom data (role, id)
                .subject(username)                           // Standard field: who this token is for
                .issuedAt(new Date())                        // When the token was created
                .expiration(new Date(                        // When it expires
                    (new Date()).getTime() + jwtExpirationMs
                ))
                .signWith(key(), Jwts.SIG.HS256)            // Sign with HMAC-SHA256
                .compact();                                  // Build the final string
    }

    /**
     * The secret key used for signing
     */
    private SecretKey key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    /**
     * VALIDATE a token — is it real and not expired?
     */
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser().verifyWith(key()).build().parseSignedClaims(authToken);
            return true;                      // ✅ Token is valid
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        }
        return false;                          // ❌ Token is invalid
    }

    /**
     * EXTRACT data from a token
     */
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parser()
                .verifyWith(key()).build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();                // Gets the "sub" field (username)
    }

    public String getRoleFromJwtToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key()).build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.get("role", String.class);   // Gets our custom "role" field
    }
}
```

#### Configuration ([application.properties](file:///home/artem/Desktop/DMS-Main/DMS-Backend/src/main/resources/application.properties)):

```properties
dms.app.jwtSecret=DMSSecretKeyForJWTTokenGenerationWhichShouldBeLongEnoughToMeetRequirements
dms.app.jwtExpirationMs=86400000    # 24 hours in milliseconds
```

> [!CAUTION]
> The **secret key** is the most important thing to protect! Anyone who has this key can create fake tokens and impersonate any user. In production, this should come from **environment variables**, never hardcoded.

---

### STEP 11 — The Backend Interceptor (Badge Checker for Every Request)

> **What**: Checks the JWT token on **every** incoming API request to verify identity and role.
> **File**: `DMS-Backend/.../config/JwtInterceptor.java`

```java
@Component
@RequiredArgsConstructor
public class JwtInterceptor implements HandlerInterceptor {

    private final JwtUtils jwtUtils;

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        // Skip non-controller methods (static files, etc.)
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;

        // Check if this endpoint has @RequireRole annotation
        RequireRole methodAnnotation = handlerMethod.getMethodAnnotation(RequireRole.class);
        RequireRole classAnnotation = handlerMethod.getBeanType().getAnnotation(RequireRole.class);
        boolean isAuthRequired = (methodAnnotation != null || classAnnotation != null);

        // ╔══════════════════════════════════════════════════════════════╗
        // ║  EXTRACT THE TOKEN FROM THE "Authorization" HEADER          ║
        // ╚══════════════════════════════════════════════════════════════╝
        String authHeader = request.getHeader("Authorization");
        // authHeader = "Bearer eyJhbGciOi..."

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);  // Remove "Bearer " prefix

            // ╔═══════════════════════════════════════════════════════╗
            // ║  VALIDATE THE TOKEN                                   ║
            // ╚═══════════════════════════════════════════════════════╝
            if (jwtUtils.validateJwtToken(token)) {
                // Extract data from the token
                String username = jwtUtils.getUserNameFromJwtToken(token);
                String role = jwtUtils.getRoleFromJwtToken(token);

                // Store in request for controllers to use
                request.setAttribute("username", username);
                request.setAttribute("role", role);

                // Set Spring Security context (for audit logging)
                UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                        username, null,
                        Collections.singletonList(new SimpleGrantedAuthority(role))
                    );
                SecurityContextHolder.getContext().setAuthentication(authToken);

                // ╔═══════════════════════════════════════════════════╗
                // ║  CHECK ROLE ACCESS (if endpoint requires it)      ║
                // ╚═══════════════════════════════════════════════════╝
                if (isAuthRequired) {
                    RequireRole roleAnnotation = methodAnnotation != null
                            ? methodAnnotation : classAnnotation;
                    String[] requiredRoles = roleAnnotation.value();

                    if (requiredRoles.length > 0) {
                        boolean hasAccess = Arrays.asList(requiredRoles).contains(role);
                        if (!hasAccess) {
                            response.setStatus(403);  // FORBIDDEN
                            response.getWriter().write("{\"error\":\"Access denied\"}");
                            return false;   // ❌ BLOCK the request
                        }
                    }
                }
            } else if (isAuthRequired) {
                response.setStatus(401);  // UNAUTHORIZED
                response.getWriter().write("{\"error\":\"Invalid or expired token\"}");
                return false;   // ❌ BLOCK the request
            }
        } else if (isAuthRequired) {
            response.setStatus(401);  // UNAUTHORIZED
            response.getWriter().write("{\"error\":\"Missing Authorization header\"}");
            return false;   // ❌ BLOCK the request
        }

        return true;  // ✅ ALLOW the request to proceed
    }
}
```

#### The `@RequireRole` custom annotation:

```java
@Target({ ElementType.METHOD, ElementType.TYPE })    // Can be placed on methods or classes
@Retention(RetentionPolicy.RUNTIME)                   // Available at runtime
public @interface RequireRole {
    String[] value() default {};                      // List of allowed roles
}
```

**Usage example on any controller:**
```java
@RequireRole({"ROLE_ADMIN"})
@GetMapping("/admin/users")
public ResponseEntity<?> getAllUsers() { ... }    // Only admins can access this!
```

---

### STEP 12 — Security Configuration (Wiring It All Together)

> **What**: Configures Spring Security and registers the JWT interceptor.
> **File**: `DMS-Backend/.../config/WebSecurityConfig.java`

```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class WebSecurityConfig implements WebMvcConfigurer {

    private final JwtInterceptor jwtInterceptor;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();    // BCrypt for password hashing
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())              // Disable CSRF (using JWT instead)
            .httpBasic(h -> h.disable())               // No browser popup login
            .formLogin(f -> f.disable())               // No Spring's default login page
            .authorizeHttpRequests(auth ->
                auth.anyRequest().permitAll()           // Let all requests through Spring Security
            );                                         // (JWT interceptor handles auth instead)
        return http.build();
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtInterceptor)
                .addPathPatterns("/api/**");            // Apply JWT check to all /api/* URLs
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:4200")   // Allow Angular dev server
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type", "Accept",
                                "Origin", "X-Requested-With")
                .maxAge(3600);
    }
}
```

---

## 🔄 Complete Flow Summary (The Whole Journey)

```mermaid
flowchart TD
    A["👤 User types username + password<br/>in login.component.html"] --> B["⚡ LoginComponent.onLogin()<br/>calls authService.login()"]
    B --> C["🔧 AuthService sends<br/>POST /api/auth/login<br/>{username, password}"]
    C --> D["🌐 AuthController.authenticateUser()<br/>receives the request"]
    D --> E["⚙️ AuthServiceImpl.login()<br/>starts processing"]
    E --> F["🗄️ UserRepository.findByUsername()<br/>SQL: SELECT * FROM users<br/>WHERE username = 'artem'"]
    F --> G{"User found?"}
    G -- No --> H["❌ Return Optional.empty()<br/>→ 400 Bad Request"]
    G -- Yes --> I["🔐 BCrypt.matches()<br/>Compare passwords"]
    I --> J{"Password correct?"}
    J -- No --> H
    J -- Yes --> K["🔑 JwtUtils.generateToken()<br/>Create signed JWT with<br/>username + role + id + expiry"]
    K --> L["📦 Build JwtResponse<br/>{token, id, username, email, roles}"]
    L --> M["📡 HTTP 200 OK<br/>JSON sent to frontend"]
    M --> N["💾 AuthService saves token<br/>to localStorage"]
    N --> O["🏠 Router navigates<br/>to /dashboard"]
    O --> P["🔒 AuthGuard checks:<br/>1. Has token? 2. Correct role?"]
    P --> Q["🔗 AuthInterceptor adds<br/>Authorization: Bearer eyJ...<br/>to every API request"]
    Q --> R["🛡️ JwtInterceptor validates token<br/>extracts username + role<br/>checks @RequireRole"]
    R --> S["✅ Request proceeds<br/>Data returned to user"]

    style A fill:#4CAF50,color:#fff
    style K fill:#FF9800,color:#fff
    style H fill:#F44336,color:#fff
    style S fill:#2196F3,color:#fff
```

---

## 🆚 Why JWT Instead of Sessions?

| Feature | Session-Based (Old Way) | JWT-Based (Our Way) |
|---------|------------------------|---------------------|
| **Storage** | Server stores session data | Server stores **nothing** — all info is in the token |
| **Scalability** | Hard — sessions are on one server | Easy — any server can validate the token |
| **Speed** | Needs database lookup every request | No database lookup — just verify the signature |
| **Mobile-friendly** | No — cookies don't work well on mobile | Yes — works everywhere with HTTP headers |
| **Stateless** | No — server must remember sessions | Yes — server is completely stateless |

---

## 📁 File Reference Map

| Layer | File | Purpose |
|-------|------|---------|
| **Frontend HTML** | [login.component.html](file:///home/artem/Desktop/DMS-Main/DMS/src/app/features/auth/login/login.component.html) | The login form the user sees |
| **Frontend Logic** | [login.component.ts](file:///home/artem/Desktop/DMS-Main/DMS/src/app/features/auth/login/login.component.ts) | Handles button click → calls AuthService |
| **Auth Service** | [auth.service.ts](file:///home/artem/Desktop/DMS-Main/DMS/src/app/core/auth/auth.service.ts) | Central auth hub: login, logout, token storage |
| **HTTP Interceptor** | [auth.interceptor.ts](file:///home/artem/Desktop/DMS-Main/DMS/src/app/core/auth/auth.interceptor.ts) | Auto-attaches token to every request |
| **Route Guard** | [auth.guard.ts](file:///home/artem/Desktop/DMS-Main/DMS/src/app/core/auth/auth.guard.ts) | Blocks unauthorized page access |
| **Models** | [auth.model.ts](file:///home/artem/Desktop/DMS-Main/DMS/src/app/core/models/auth.model.ts), [user.model.ts](file:///home/artem/Desktop/DMS-Main/DMS/src/app/core/models/user.model.ts) | TypeScript interfaces for data shapes |
| **Backend Controller** | [AuthController.java](file:///home/artem/Desktop/DMS-Main/DMS-Backend/src/main/java/com/example/DMS_Backend/controllers/AuthController.java) | Receives HTTP requests, routes to service |
| **Backend Service** | [AuthServiceImpl.java](file:///home/artem/Desktop/DMS-Main/DMS-Backend/src/main/java/com/example/DMS_Backend/service/impl/AuthServiceImpl.java) | Business logic: DB lookup, password check, token gen |
| **JWT Utility** | [JwtUtils.java](file:///home/artem/Desktop/DMS-Main/DMS-Backend/src/main/java/com/example/DMS_Backend/security/jwt/JwtUtils.java) | Creates, validates, and reads JWT tokens |
| **Backend Interceptor** | [JwtInterceptor.java](file:///home/artem/Desktop/DMS-Main/DMS-Backend/src/main/java/com/example/DMS_Backend/config/JwtInterceptor.java) | Validates token on every protected request |
| **Security Config** | [WebSecurityConfig.java](file:///home/artem/Desktop/DMS-Main/DMS-Backend/src/main/java/com/example/DMS_Backend/config/WebSecurityConfig.java) | Wires everything together, CORS, BCrypt |
| **Custom Annotation** | [RequireRole.java](file:///home/artem/Desktop/DMS-Main/DMS-Backend/src/main/java/com/example/DMS_Backend/config/RequireRole.java) | `@RequireRole({"ROLE_ADMIN"})` for access control |
| **User Entity** | [User.java](file:///home/artem/Desktop/DMS-Main/DMS-Backend/src/main/java/com/example/DMS_Backend/entities/User.java) | Maps to `users` table in MySQL |
| **Repository** | [UserRepository.java](file:///home/artem/Desktop/DMS-Main/DMS-Backend/src/main/java/com/example/DMS_Backend/repositories/UserRepository.java) | Auto-generates SQL queries |
| **Database** | MySQL `users` table | Stores usernames, hashed passwords, roles |
