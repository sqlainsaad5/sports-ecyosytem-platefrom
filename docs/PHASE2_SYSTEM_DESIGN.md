# Phase 2 — System Design

## Backend architecture (Node.js + Express.js)

- **Entry:** `server.js` loads environment, connects MongoDB, starts HTTP server.
- **App:** `app.js` registers **CORS**, **JSON body parser**, **rate limiting** (API gateway concern), **static uploads**, global **error handler**, mounts `/api`.
- **Layers:**
  - **Routes** — HTTP mapping only, attach validators and middleware.
  - **Middleware** — `authenticate` (JWT), `requireRole(...)`, `validate` (express-validator), `errorHandler`, optional `upload` (multer).
  - **Controllers** — orchestrate request/response, call services or models.
  - **Models** — Mongoose schemas (persistence rules, indexes).
- **Auth:** Register/login issue **JWT** (payload: `userId`, `role`). Passwords **bcrypt**-hashed. Refresh flows can be added later; SDD references password reset via notification service — structure allows extension.
- **Authorization:** Every protected route checks role; sensitive admin routes require `admin`. Resource-level checks ensure users only access own records unless admin/coach-student relationship applies.

## REST API design

- Resource-oriented URLs under `/api`.
- **GET** read, **POST** create/actions, **PUT/PATCH** update, **DELETE** remove where safe.
- Uniform JSON: `{ success, data?, message?, errors? }` on success/error.

## Frontend architecture (React.js + Vite + Tailwind CSS)

- **Pages** — route-level screens per role (dashboard, feature modules).
- **Components** — layout (sidebar/navbar), forms, tables, cards, guards.
- **Services** — Axios instance with JWT from `localStorage`, interceptors for 401.
- **Hooks** — `useAuth` for current user and role-based UI.
- **State:** React Context for auth session; local component state for forms/lists (no Redux required for MVP; scalable if needed).

## MongoDB schema design (collections)

| Collection | Purpose |
|------------|---------|
| `users` | Core account: email, passwordHash, role, verificationStatus, suspension, links to profile ids |
| `playerprofiles` | Sport preferences, skill level, location, user ref |
| `coachprofiles` | Specialties, academy location, availability, aggregates, bank meta, user ref |
| `businessprofiles` | Store info, subscription tier, **listingQuotaRemaining** counter pattern, user ref |
| `sportcategories` | Admin-managed categories (seed: cricket, badminton) |
| `indoorgrounds` | Facility metadata, sport, address, active flag |
| `groundbookings` | Player bookings: slot window, status (`held`/`confirmed`/`cancelled`), hold expiry, payment ref |
| `trainingrequests` | Player→coach requests |
| `trainingsessions` | Accepted training, schedule, optional ground link |
| `trainingplans` | Weekly plan text/goals per coach–player |
| `attendancerecords` | Per session attendance |
| `performanceevaluations` | Weekly points (technique, fitness, attitude) + notes |
| `products` | Catalog, price, stock, images, owner ref |
| `orders` | Order lines, status, payment snapshot |
| `payments` | Typed transactions (coach_fee, ground, product, subscription) |
| `notifications` | In-app notifications per user |
| `complaints` | Dispute workflow |
| `systemsettings` | Key-value settings (singleton-style keys) |
| `verificationdocuments` | File path + metadata + status |
| `coachfeedbacks` | Player ratings/comments to coach |
| `coachpartnershiprequests` | Business→coach partnership messages |

**Indexes:** `users.email` unique; `groundbookings` compound on ground + time range queries; `products.businessOwner`; `notifications.user` + `read`; `trainingsessions` by coach/player and date.

## Deployment notes

- Separate **JWT_SECRET**, **MONGODB_URI**, **CLIENT_URL**, **PORT**.
- Production: HTTPS termination at reverse proxy; restrict CORS to client origin; configure email SMTP for notifications when available.
