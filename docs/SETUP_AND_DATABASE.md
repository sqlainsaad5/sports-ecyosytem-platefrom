# Setup & database

## Installation

1. Clone or copy this project folder.
2. Install **MongoDB** and ensure `mongod` is reachable, or use **MongoDB Atlas** and copy the connection string.
3. **Backend**
   - `cd backend`
   - Copy `.env.example` to `.env`.
   - Set `MONGODB_URI` (e.g. `mongodb://127.0.0.1:27017/sports_ecosystem`).
   - Set a long random `JWT_SECRET`.
   - `npm install`
   - `npm run seed:admin` — creates the first admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
   - `npm run dev` or `npm start` — API on port `5000` by default.
4. **Frontend**
   - `cd frontend`
   - `npm install`
   - `npm run dev` — Vite on port `5173`, proxying `/api` and `/uploads` to the backend.

## Database schema (MongoDB collections)

| Collection | Purpose |
|------------|---------|
| `users` | Accounts: `email`, `passwordHash`, `role`, `verificationStatus`, `isSuspended`, profile refs |
| `playerprofiles` | Player sport preference, skill, city |
| `coachprofiles` | Specialties, availability, ratings |
| `businessprofiles` | Store, `subscriptionPackage`, **`listingSlotsRemaining`** (quota counter) |
| `sportcategories` | Admin-managed categories (seed: cricket, badminton) |
| `indoorgrounds` | Facilities; sample grounds auto-seeded if empty |
| `groundbookings` | `held` / `confirmed` / `cancelled`; `holdExpiresAt` for payment window |
| `trainingrequests` | Player → coach requests |
| `trainingsessions` | Scheduled sessions after acceptance |
| `trainingplans` | Weekly plans |
| `attendancerecords` | Per-session attendance |
| `performanceevaluations` | Technique / fitness / attitude scores |
| `products` | Catalog items per business owner |
| `orders` | Player purchases |
| `payments` | Coach fees, ground, product, subscription (mock gateway refs) |
| `notifications` | In-app notifications |
| `complaints` | Dispute records |
| `systemsettings` | Key-value admin configuration |
| `verificationdocuments` | Uploaded files for coach/business verification |
| `coachfeedbacks` | Player ratings |
| `coachpartnershiprequests` | Business → coach partnership messages |

Indexes: unique `users.email`; compound indexes on bookings and notifications as defined in models.

## Operational notes

- **Payments**: With `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLISHABLE_KEY` set, player shop, coach fees, ground holds, and business subscriptions use **Stripe PaymentIntents** (see `utils/stripePayments.js`). Without keys, the API keeps the previous mock card / last-4 flows for local development.
- **Email** notifications are stubbed; SDD describes SMTP — extend `utils/notify.js` and trigger from services.
- **Uploads** are stored under `backend/uploads/` and served statically at `/uploads/`.
- **CORS**: `CLIENT_URL` should match the frontend origin in production.

## Automated tests

From `backend/` with a valid `MONGODB_URI` in `.env`:

```bash
npm test
```

Covers health check, registration validation (coach specialties), player signup, and failed login. Extend `backend/tests/` for more flows.

## Production checklist

- Strong `JWT_SECRET`, HTTPS, restricted CORS.
- MongoDB backups (SRS §4 / §5.1).
- Rate limits already applied on `/api` and stricter on `/auth`.
- Move file storage to S3-compatible storage if scaling.
