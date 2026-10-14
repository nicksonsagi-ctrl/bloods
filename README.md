# LifeLink – Smart Blood Donation Management System (Sri Lanka)

> **"Every Drop Saves a Life"**
> Initial Regional Focus: Jaffna District & Island-Wide Network

LifeLink is a production-grade full-stack blood donation management application designed for Sri Lanka. It connects voluntary blood donors, emergency patients/requesters, hospitals (such as Teaching Hospital Jaffna), and donation campaigns through role-based workflows, strict identity privacy, and transactional automation.

---

## 1. System Architecture

```
                          ┌──────────────────────────────────────┐
                          │         React Frontend (Vite)         │
                          │   Tailwind CSS & Trilingual UI       │
                          └──────────────────┬───────────────────┘
                                             │ HTTP/JSON
                                             ▼
                          ┌──────────────────────────────────────┐
                          │      Express.js Backend API          │
                          │   Bcrypt, Zod, Session Guard         │
                          └──────┬────────────────────────┬──────┘
                                 │                        │
                                 ▼                        ▼
                      ┌──────────────────────┐  ┌──────────────────────┐
                      │    MySQL Database    │  │  Notification Outbox │
                      │  Prisma ORM Models   │  │   Idempotent Queue   │
                      └──────────────────────┘  └──────────┬───────────┘
                                                           │ POST Webhook
                                                           ▼
                                                ┌──────────────────────┐
                                                │    n8n Automation    │
                                                │  SMTP Email Provider │
                                                └──────────────────────┘
```

---

## 2. Technology Stack

- **Frontend**: React 19, JavaScript JSX/TSX, Vite, Tailwind CSS v4, Lucide React, Leaflet Maps, Plus Jakarta Sans typography.
- **Backend**: Node.js 22, Express.js, bcryptjs, Zod validation, HTTP-only session cookies.
- **Database**: MySQL 8 (`lifelink_db`) with Prisma ORM schema (`backend/prisma/schema.prisma`).
- **Automation**: n8n workflows (`n8n/workflows/`), notification outbox, HMAC secret validation.
- **Localization**: English, Sinhala (සිංහල), Tamil (தமிழ்) with Asia/Colombo timezone.

---

## 3. Exactly Three User Roles

1. **ADMIN**
   - Access to `/admin/dashboard`
   - Verified hospital blood requests
   - Approves voluntary donors before public search inclusion
   - Manages campaigns, audit logs, and notification workers
   - Exports registry reports as CSV
   - *Created strictly via secure CLI script (`node scripts/createAdmin.js`)*

2. **DONOR**
   - Access to `/donor/dashboard`
   - Dark red sidebar interface
   - Real-time availability toggle
   - Receives anonymous patient inquiries (Accept / Decline)
   - Responds to appointment booking requests
   - Views hospital-certified donation history

3. **REQUESTER**
   - Access to `/requester/dashboard`
   - Searches verified donors (without exposing donor phone or email)
   - Submits urgent blood requests with hospital and urgency levels
   - Proposes donation appointments at verified hospitals
   - Tracks response history

---

## 4. Local Execution & Ubuntu Setup Guide

### Prerequisites
- Node.js 22+ & npm
- MySQL 8.0 Server
- n8n (Optional for email dispatch)

### Step 1: Clone & Install Dependencies
```bash
git clone <repository_url> lifelink
cd lifelink
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set the database connection string:
```env
DATABASE_URL="mysql://root:password@localhost:3306/lifelink_db"
PORT=3000
N8N_WEBHOOK_URL="http://localhost:5678/webhook/lifelink-events"
N8N_WEBHOOK_SECRET="lifelink-secret-key-jaffna"
AUTOMATION_ENABLED="true"
```

### Step 3: MySQL Database Setup & Prisma Migrations
Create the MySQL database:
```sql
CREATE DATABASE lifelink_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Run Prisma migrations and seed Sri Lankan provinces, districts, and hospitals:
```bash
npx prisma migrate dev --name init --schema=backend/prisma/schema.prisma
node backend/prisma/seed.js
```

### Step 4: Create Secure Admin Account
```bash
node backend/scripts/createAdmin.js --email="admin@lifelink.lk" --password="YourSecurePassword123!" --name="Dr. Administrator" --phone="+94771234567"
```

### Step 5: Start Dev Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000`.

---

## 5. Verification & Testing Matrix

| Scenario | Feature Tested | Execution Status |
| :--- | :--- | :--- |
| **01** | Donor registration with Sri Lanka phone and blood group | **PASS** |
| **02** | Requester registration and profile creation | **PASS** |
| **03** | Bcrypt authentication and secure session cookie issuance | **PASS** |
| **04** | Rejection of unregistered email & invalid password | **PASS** |
| **05** | Rejection of duplicate email signup | **PASS** |
| **06** | Role-based redirect (DONOR &rarr; `/donor/dashboard`, REQUESTER &rarr; `/requester/dashboard`, ADMIN &rarr; `/admin/dashboard`) | **PASS** |
| **07** | Donor cannot access admin endpoints (403 Forbidden) | **PASS** |
| **08** | Pending donor hidden from public search until verified | **PASS** |
| **09** | Admin verifies donor profile; donor appears in search | **PASS** |
| **10** | Requester submits blood request (saved as PENDING_VERIFICATION) | **PASS** |
| **11** | Admin approves request to ACTIVE; public displays with patient privacy preserved | **PASS** |
| **12** | Requester sends contact request to donor | **PASS** |
| **13** | Donor accepts contact request; requester views response | **PASS** |
| **14** | Requester proposes hospital donation appointment | **PASS** |
| **15** | Donor accepts appointment; duplicate slot collision prevented | **PASS** |
| **16** | Admin certifies completed hospital donation; record stored in history | **PASS** |
| **17** | Contact form saves to database and queues outbox acknowledgment | **PASS** |
| **18** | Outbox event queued with idempotency key | **PASS** |
| **19** | Backend worker dispatches webhook with `X-LifeLink-Secret` header | **PASS** |
| **20** | Local image assets load (Hands holding heart, medical volunteer, Jaffna blood drive) | **PASS** |
| **21** | Trilingual language switching (English, Sinhala, Tamil) | **PASS** |
| **22** | Real-time dynamic stats display true zero counts on empty state | **PASS** |
| **23** | n8n end-to-end live SMTP email delivery | *NOT TESTED (Requires active local SMTP provider)* |

---

## 6. Security Standards

- **Bcrypt Hashing**: 10-12 salt rounds on all user passwords.
- **HTTP-Only Cookies**: Session tokens protected against cross-site scripting (XSS).
- **Zod Input Validation**: Validates Sri Lanka phone numbers (`+94` or `07x`), emails, and payloads.
- **Data Minimization**: Donor phone numbers and exact coordinates are strictly concealed until mutual consent.
- **Zero Hallucinated Metrics**: Statistics reflect actual database records.
