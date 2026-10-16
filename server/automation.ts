import { db } from './store.js';

export interface WebhookEventData {
  eventType: 'DONOR_CONTACT_REQUEST' | 'NEW_BLOOD_REQUEST' | 'APPOINTMENT_SCHEDULED' | 'USER_REGISTRATION';
  recipientEmail: string;
  recipientName: string;
  subject: string;
  payload: Record<string, any>;
}

/**
 * Dispatches an event directly to the configured n8n Webhook URL.
 * Automatically logs request & response into LifeLink Automation Outbox/Delivery Logs.
 */
export async function triggerN8nWebhook(eventData: WebhookEventData): Promise<{
  dispatched: boolean;
  status?: number;
  message?: string;
}> {
  const webhookUrl = db.settings.N8N_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL || '';
  const isEnabled = db.settings.AUTOMATION_ENABLED !== 'false';

  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    console.log(`[n8n Automation] Webhook URL not set. Event "${eventData.eventType}" queued in outbox for: ${eventData.recipientEmail}`);
    return { dispatched: false, message: 'No N8N_WEBHOOK_URL configured' };
  }

  // Detect localhost when server is running in the cloud
  if (webhookUrl.includes('localhost') || webhookUrl.includes('127.0.0.1')) {
    const localhostMsg = 'Localhost Detected: LifeLink is running on Cloud Run, while localhost:5678 is on your personal laptop. Cloud servers cannot reach your private computer directly. Run "n8n start --tunnel" or ngrok to get a public HTTPS URL, or click "Send Test from Browser" below.';
    console.error(`[n8n Automation] ${localhostMsg}`);
    return { dispatched: false, message: localhostMsg };
  }

  if (!isEnabled) {
    console.log(`[n8n Automation] Automation is disabled. Skipping webhook dispatch.`);
    return { dispatched: false, message: 'Automation disabled in settings' };
  }

  try {
    console.log(`[n8n Automation] Dispatching "${eventData.eventType}" to n8n: ${webhookUrl} for ${eventData.recipientEmail}`);
    const idempotencyKey = 'auto-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

    const bodyData = {
      event: eventData.eventType,
      eventType: eventData.eventType,
      timestamp: new Date().toISOString(),
      recipientEmail: eventData.recipientEmail,
      recipientName: eventData.recipientName,
      subject: eventData.subject,
      payload: eventData.payload,
      idempotencyKey,
      source: 'LifeLink Sri Lanka Blood Donation System'
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-LifeLink-Secret': db.settings.N8N_WEBHOOK_SECRET || 'lifelink-secret-key-jaffna',
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(bodyData)
    });

    const responseText = await res.text();
    console.log(`[n8n Automation] Webhook responded HTTP ${res.status}: ${responseText.slice(0, 150)}`);

    // Log to delivery logs
    db.deliveryLogs.unshift({
      id: 'del-' + Math.random().toString(36).substring(2, 9),
      outboxId: idempotencyKey,
      eventType: eventData.eventType,
      webhookUrl,
      requestPayload: JSON.stringify(eventData.payload),
      responseStatus: res.status,
      responseBody: responseText.slice(0, 500),
      deliveredAt: new Date().toISOString()
    });

    return {
      dispatched: res.ok,
      status: res.status,
      message: res.ok ? 'Delivered successfully to n8n' : `n8n returned HTTP ${res.status}`
    };
  } catch (err: any) {
    console.error(`[n8n Automation] Failed to reach webhook URL:`, err.message);
    db.deliveryLogs.unshift({
      id: 'del-' + Math.random().toString(36).substring(2, 9),
      outboxId: 'err-' + Date.now(),
      eventType: eventData.eventType,
      webhookUrl,
      requestPayload: JSON.stringify(eventData.payload),
      responseStatus: 0,
      responseBody: '',
      deliveredAt: new Date().toISOString(),
      error: err.message
    });
    return { dispatched: false, message: err.message };
  }
}
