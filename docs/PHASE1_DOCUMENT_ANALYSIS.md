# Phase 1 — Full Document Analysis (SRS + SDD)

Source documents: **FYP26-CS-G22_SRS[1]** (Software Requirements Specification, Phase I), **FYP26_CS_G22-SDD (1)** (Software Design Specification, Phase II), University of Central Punjab, **FYP26-CS-G22**, Sports Ecosystem Platform.

---

## 1. System Overview

### What the project is
A **centralized web-based Sports Ecosystem Platform** that connects **Players**, **Coaches**, **Business Owners**, and **Administrators** in one environment. It digitizes **coaching**, **indoor ground booking** (initially **cricket** and **badminton** only), **training session management**, **attendance and weekly performance tracking**, **equipment e‑commerce** with **subscription-based listing quotas**, **payments** (coaching fees, ground booking, purchases, business subscriptions), **verification workflows**, **notifications**, **complaints/disputes**, and **admin reporting**.

### Main purpose and goal
Remove fragmentation between informal coach search, manual facility booking, disconnected performance records, and separate retail channels. Provide **role-based modules**, **automated coach recommendation** (sport, skill, location), **real-time ground availability** (no double booking), **transparent performance history**, **secure authentication (JWT)** and **RBAC**, and **admin governance** (verification, monitoring, configuration).

---

## 2. Requirements Extraction

### 2.1 Functional requirements (from SRS use cases)

**Coach (UC-C1–C15)**  
Registration/login; profile management; availability and training schedule; visibility in recommendation engine; training session requests (accept/reject); review/approve training plans; attendance; weekly performance points; view player progress/history; view/manage ground bookings tied to training; ratings/feedback view (and response); receive player payments; weekly training plans CRUD; notifications; certification documents upload/update.

**Business owner (UC-B1–B16)**  
Registration/login; profile; subscribe to listing package (Basic/Pro/Premium quotas per SRS: **20 / 40 / 60** listings per month); manage/renew subscription; configure online store; product CRUD; pricing; stock/inventory; product images; orders; basic sales reports; **coach directory** and **partnership/sponsorship requests** to coaches; notifications; verification documents.

**Player (UC-P1–P11)**  
Registration/login; profile; automated coach recommendations; request training; view schedule and weekly plans; indoor ground booking; performance/progress; purchase equipment; rate/feedback coach; pay coach; notifications.

**Admin (UC-A1–A15)**  
Login; dashboard/statistics; verify coach; verify business owner; user CRUD; coach CRUD; business owner CRUD; manage **sport categories**; manage **indoor grounds and time slots**; monitor bookings and sessions; monitor performance/attendance; complaints/disputes; reports; monitor business subscription payments; **system settings**.

### 2.2 Non-functional requirements (SRS §4)

- **Performance:** Typical actions (e.g. sign-in, booking) **2–3 s** under normal load; coach recommendations **within ~5 s**; ground availability checks **real-time**; concurrent users without major slowdown; efficient DB reads/writes for profiles, coaches, bookings.
- **Safety:** Avoid accidental loss of critical data; confirmations for destructive actions (e.g. account deletion, cancellations); backups; unauthorized users cannot harm others’ data or integrity.
- **Security:** Secure authentication for all roles; **RBAC**; **passwords stored hashed**; protect personal/contact/location data; only authorized admins for admin functions; no unauthorized DB/backend access.
- **Quality:** Usability for non-technical users; consistent navigation across panels; reliability and recovery; **modular/maintainable** code; scalability (e.g. more sports later); browser-based portability; high availability except maintenance.

### 2.3 User roles and permissions
**Player, Coach, Business Owner, Admin** — each sees only role-appropriate features (SRS + SDD **defense in depth**: UI, gateway, services, data scoping).

### 2.4 System modules / components (SDD)
**Presentation:** React.js, Tailwind CSS, responsive layout, HTTPS, JWT in requests.  
**Application:** **API Gateway pattern** (single entry), **JWT validation**, **role checks**, **rate limiting**; services described in SDD include **Auth**, **User management**, **Recommendation**, **Training management**, **Attendance & performance**, **Ground reservation**, **Product & order** (with listing quotas), **Payment** (multiple payment types, gateway adapter), **Notification** (in-app + email hooks), **Verification** (documents, audit).  
**Data:** MongoDB (with Mongoose per SDD), **file storage** for binaries; logical separation of transactional areas (implemented here as **collections** with clear boundaries).  
**Cross-cutting:** RBAC, validation, error handling, audit where specified (e.g. verification decisions).

---

## 3. Technical Requirements

### 3.1 Database (SRS §5.1 + SDD)
Centralized datastore; unique identifiers per role; referential consistency between users, sessions, bookings, products, orders; CRUD on key entities; backup expectation (operational concern — document for deployment).

### 3.2 API (SDD)
REST over HTTPS; JSON; authenticated requests carry **JWT**; gateway-style centralized routing with **authn/authz** and **rate limits**.

### 3.3 UI/UX (SRS + SDD)
Dedicated panels per role; dashboards; forms and tables; reports; labeled, user-friendly, **responsive** (mobile + desktop); consistent navigation patterns.

### 3.4 Constraints
- **Sports scope:** **Cricket and badminton only** (SRS).  
- **Web browsers** (Chrome, Edge, Firefox); **internet required**.  
- **No native mobile app**, no live video coaching, no third-party logistics tracking, no full social network (SDD explicit out-of-scope list).

### 3.5 Design mechanisms called out in SDD (implemented or reflected in code/docs)
- **Ground booking:** short **hold** (~5 minutes) while paying; release on timeout/failure.  
- **Listing quota:** **counter** on subscription to enforce package limits without full scans.  
- **Account suspension:** login blocked; related records retained for referential integrity.  
- **Verification:** admin audit trail on approve/reject/more-info.

---

## Traceability note
Every SRS use case ID above is mapped in `docs/API_ENDPOINTS.md` to concrete REST routes implemented under `/api/...`.
