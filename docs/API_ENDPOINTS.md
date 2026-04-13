# REST API Reference — Sports Ecosystem Platform

Base URL: `http://localhost:5000/api` (configurable).  
Auth: `Authorization: Bearer <JWT>` unless noted.

## Auth (UC-P1/C1/B1 — registration/login; UC-A1 admin login)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register player, coach, or business_owner (+ profile payload) |
| POST | `/auth/login` | Login; returns JWT |
| GET | `/auth/me` | Current user + profile |
| POST | `/auth/password-reset-request` | Placeholder — records intent (email integration optional per SDD) |

## Player (UC-P2–P11)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/players/me/profile` | Player profile |
| PUT | `/players/me/profile` | Update profile |
| GET | `/players/recommendations` | Automated coach recommendations |
| POST | `/players/training-requests` | Request training (UC-P4) |
| GET | `/players/training-requests` | List my requests |
| GET | `/players/training-sessions` | Schedule (UC-P5) |
| GET | `/players/training-plans` | Weekly plans visible to player |
| POST | `/players/ground-bookings/hold` | Hold slot ~5 min (UC-P6) |
| POST | `/players/ground-bookings/:id/confirm-payment` | Confirm after payment (UC-P6) |
| GET | `/players/ground-bookings` | My ground bookings |
| DELETE | `/players/ground-bookings/:id` | Cancel (with rules) |
| GET | `/players/performance` | Points & history (UC-P7) |
| GET | `/players/products` | Browse equipment |
| POST | `/players/orders` | Purchase equipment (UC-P8) |
| GET | `/players/orders` | My orders |
| POST | `/players/coaches/:coachId/feedback` | Rate coach (UC-P9) |
| POST | `/players/payments/coach` | Pay coach fees (UC-P10) |
| GET | `/players/notifications` | Notifications (UC-P11) |
| PATCH | `/players/notifications/:id/read` | Mark read |
| POST | `/players/complaints` | File complaint / dispute (feeds UC-A12) |

## Coach (UC-C1–C15)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/coaches/me/profile` | Coach profile |
| PUT | `/coaches/me/profile` | Update profile |
| PUT | `/coaches/me/availability` | Availability (UC-C3) |
| GET | `/coaches/training-requests` | Incoming requests (UC-C5) |
| PATCH | `/coaches/training-requests/:id` | Accept/reject |
| GET | `/coaches/training-sessions` | Sessions |
| POST | `/coaches/training-plans` | Create/modify weekly plan (UC-C13) |
| GET | `/coaches/training-plans` | List plans |
| PUT | `/coaches/training-plans/:id` | Update plan |
| POST | `/coaches/sessions/:sessionId/attendance` | Mark attendance (UC-C7) |
| POST | `/coaches/performance` | Weekly performance points (UC-C8) |
| GET | `/coaches/players/:playerId/progress` | Progress history (UC-C9) |
| GET | `/coaches/ground-bookings` | Grounds for my training (UC-C10) |
| GET | `/coaches/feedback` | Ratings & feedback (UC-C11) |
| POST | `/coaches/feedback/:id/reply` | Reply to feedback |
| GET | `/coaches/payments` | Received payments / balance view (UC-C12) |
| GET | `/coaches/notifications` | Notifications (UC-C14) |
| POST | `/coaches/documents` | Upload certifications (UC-C15) |
| GET | `/coaches/documents` | List documents |

## Business owner (UC-B1–B16)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/business/me/profile` | Profile + store |
| PUT | `/business/me/profile` | Update |
| POST | `/business/subscription` | Subscribe package (UC-B3) |
| POST | `/business/subscription/renew` | Renew (UC-B4) |
| PUT | `/business/store` | Configure store (UC-B5) |
| GET | `/business/products` | List own products |
| POST | `/business/products` | Add product — quota enforced (UC-B6) |
| PUT | `/business/products/:id` | Update (UC-B7) |
| DELETE | `/business/products/:id` | Delete — restores quota (UC-B8) |
| PATCH | `/business/products/:id/pricing` | Pricing (UC-B9) |
| PATCH | `/business/products/:id/stock` | Stock (UC-B10) |
| POST | `/business/products/:id/images` | Images (UC-B11) |
| GET | `/business/orders` | Orders (UC-B12) |
| PATCH | `/business/orders/:id` | Update order status |
| GET | `/business/reports/sales` | Basic sales report (UC-B13) |
| GET | `/business/coaches` | Coach directory (UC-B14) |
| POST | `/business/coaches/:coachId/partnership` | Partnership request (UC-B14) |
| GET | `/business/notifications` | Notifications (UC-B15) |
| POST | `/business/documents` | Verification docs (UC-B16) |
| GET | `/business/documents` | List documents |

## Admin (UC-A1–A15)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/dashboard` | Statistics (UC-A2) |
| GET | `/admin/verification/coaches` | Queue (UC-A3) |
| PATCH | `/admin/verification/coaches/:userId` | Approve/reject/more-info |
| GET | `/admin/verification/business` | Queue (UC-A4) |
| PATCH | `/admin/verification/business/:userId` | Approve/reject/more-info |
| GET | `/admin/users` | User list (UC-A5) |
| PATCH | `/admin/users/:id` | Update/suspend |
| DELETE | `/admin/users/:id` | Delete with safeguards |
| GET | `/admin/coaches` | Manage coaches (UC-A6) |
| GET | `/admin/business-owners` | Manage businesses (UC-A7) |
| CRUD | `/admin/sports` | Sport categories (UC-A8) |
| CRUD | `/admin/grounds` | Grounds & slots config (UC-A9) |
| GET | `/admin/monitor/bookings` | Bookings & sessions (UC-A10) |
| GET | `/admin/monitor/performance` | Performance & attendance (UC-A11) |
| GET | `/admin/complaints` | List (UC-A12) |
| PATCH | `/admin/complaints/:id` | Resolve |
| GET | `/admin/reports/summary` | Reports (UC-A13) |
| GET | `/admin/subscriptions` | Business subscription payments (UC-A14) |
| GET | `/admin/settings` | Settings (UC-A15) |
| PUT | `/admin/settings` | Update settings |

## Public (unauthenticated browse where appropriate)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/public/grounds` | Listed grounds |
| GET | `/public/products` | Listed products |

## Uploads
| Method | Path | Description |
|--------|------|-------------|
| POST | `/uploads/document` | Multipart document (coach/business) |
| POST | `/uploads/image` | Multipart image (product) |

---

### SRS use case index → API area
- **UC-C1–C15** → `/coaches/*`, `/auth`, `/uploads`
- **UC-B1–B16** → `/business/*`, `/auth`, `/uploads`
- **UC-P1–P11** → `/players/*`, `/auth`, `/public/*`
- **UC-A1–A15** → `/admin/*`, `/auth`
