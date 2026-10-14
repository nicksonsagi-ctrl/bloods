# LifeLink n8n Automation Workflows

This directory contains importable JSON workflow definitions for n8n to handle transactional emails, reminders, and alerts for **LifeLink – Smart Blood Donation Management System (Sri Lanka)**.

## Architecture

```
React Frontend
   │
   ▼
Express Backend (/api/*)
   │
   ▼
MySQL / In-Memory Store
   │
   ▼
Notification Outbox (Idempotency Key & Retry Count)
   │
   ▼
Backend Automation Worker (Triggered via Admin Console or Cron)
   │
   ▼ (POST with X-LifeLink-Secret & X-Idempotency-Key)
n8n Webhook Endpoint
   │
   ▼
SMTP Email Provider (e.g. Mailtrap, SendGrid, Amazon SES)
   │
   ▼
Delivery Status Recorded in AutomationDeliveryLog
```

## Security Requirements

1. **Server-Side Only**: The frontend never communicates directly with n8n. All webhook calls originate from the Express backend.
2. **Secret Header Validation**: Every incoming webhook verifies the `X-LifeLink-Secret` header against the server environment variable `N8N_WEBHOOK_SECRET`.
3. **Idempotency**: Every outbox event includes an `idempotencyKey` preventing duplicate email deliveries.

## Environment Variables

Configure these in `backend/.env` or in the LifeLink Admin Console -> System Settings:

```env
N8N_WEBHOOK_URL="http://localhost:5678/webhook/lifelink-events"
N8N_WEBHOOK_SECRET="lifelink-secret-key-jaffna"
AUTOMATION_ENABLED="true"
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_USER="your-smtp-user"
SMTP_PASSWORD="your-smtp-password"
EMAIL_FROM="no-reply@lifelink.lk"
```

## Included Workflows

1. `workflow_1_welcome_email.json` – Sends welcome email upon new user registration.
2. `workflow_2_new_blood_request.json` – Acknowledges blood request submission and alerts the medical admin.
3. `workflow_3_donor_contact_request.json` – Alerts a consenting verified donor of an inquiry.
4. `workflow_4_donor_response.json` – Notifies the requester when a donor accepts/declines.
5. `workflow_5_appointment_updates.json` – Notifies participants of scheduled, rescheduled, or cancelled donation appointments.
6. `workflow_6_campaign_registration.json` – Sends ticket/confirmation for community blood drives.
7. `workflow_7_appointment_reminder.json` – 24-hour appointment reminder scheduler.
8. `workflow_8_automation_failure.json` – Incident notification when webhooks exhaust retries.

## How to Import into n8n

1. Start n8n locally: `npx n8n` (runs on `http://localhost:5678`).
2. Go to **Workflows** -> **Import from File**.
3. Select any `.json` file from this folder.
4. Set credentials for your SMTP Email account in the Email Send node.
5. Activate the workflow!

*Note: In environments where an active n8n instance is not running, all events are safely preserved in the database Notification Outbox table.*
