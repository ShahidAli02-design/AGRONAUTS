import twilio from 'twilio';
import { Resend } from 'resend';

export interface OrderNotificationInput {
  farmerName: string;
  farmerPhone?: string | null;
  farmerEmail?: string | null;
  buyerName: string;
  crop: string;
  variety?: string | null;
  quantityKg: number;
  pricePerKg: number;
  totalAmount: number;
  batchCode: string;
}

export type ChannelResult = 'sent' | 'simulated' | 'skipped' | 'failed';

export interface NotificationResult {
  sms: ChannelResult;
  whatsapp: ChannelResult;
  email: ChannelResult;
  errors: string[];
}

let twilioClient: ReturnType<typeof twilio> | null = null;
let twilioInitAttempted = false;

function getTwilioClient() {
  if (!twilioInitAttempted) {
    twilioInitAttempted = true;
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (sid && token && sid !== 'MY_TWILIO_ACCOUNT_SID') {
      try {
        twilioClient = twilio(sid, token);
      } catch (e) {
        console.warn('Failed to initialize Twilio client:', e);
      }
    }
  }
  return twilioClient;
}

let resendClient: Resend | null = null;
let resendInitAttempted = false;

function getResendClient() {
  if (!resendInitAttempted) {
    resendInitAttempted = true;
    const key = process.env.RESEND_API_KEY;
    if (key && key !== 'MY_RESEND_API_KEY') {
      try {
        resendClient = new Resend(key);
      } catch (e) {
        console.warn('Failed to initialize Resend client:', e);
      }
    }
  }
  return resendClient;
}

// Normalizes to E.164. Assumes Indian numbers when no country code is present,
// matching this app's +91-only phone validation on sign-up.
function toE164(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

function buildMessage(input: OrderNotificationInput): string {
  const total = input.totalAmount.toLocaleString('en-IN');
  return (
    `AGRONAUTS: ${input.buyerName} wants to buy ${input.quantityKg}kg of ${input.crop}` +
    `${input.variety ? ` (${input.variety})` : ''} from batch ${input.batchCode} ` +
    `at Rs ${input.pricePerKg}/kg (Rs ${total} total). ` +
    `Open your AGRONAUTS dashboard to confirm the order.`
  );
}

async function sendSms(input: OrderNotificationInput): Promise<ChannelResult> {
  if (!input.farmerPhone) return 'skipped';
  const client = getTwilioClient();
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!client || !fromNumber) return 'simulated';
  try {
    await client.messages.create({
      to: toE164(input.farmerPhone),
      from: fromNumber,
      body: buildMessage(input),
    });
    return 'sent';
  } catch (e) {
    console.warn('Twilio SMS send failed:', e instanceof Error ? e.message : e);
    return 'failed';
  }
}

async function sendWhatsapp(input: OrderNotificationInput): Promise<ChannelResult> {
  if (!input.farmerPhone) return 'skipped';
  const client = getTwilioClient();
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  if (!client || !fromNumber) return 'simulated';
  try {
    await client.messages.create({
      to: `whatsapp:${toE164(input.farmerPhone)}`,
      from: fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`,
      body: buildMessage(input),
    });
    return 'sent';
  } catch (e) {
    console.warn('Twilio WhatsApp send failed:', e instanceof Error ? e.message : e);
    return 'failed';
  }
}

async function sendEmail(input: OrderNotificationInput): Promise<ChannelResult> {
  if (!input.farmerEmail) return 'skipped';
  const client = getResendClient();
  const fromAddress = process.env.RESEND_FROM_EMAIL || 'AGRONAUTS <onboarding@resend.dev>';
  if (!client) return 'simulated';
  try {
    const total = input.totalAmount.toLocaleString('en-IN');
    await client.emails.send({
      from: fromAddress,
      to: input.farmerEmail,
      subject: `New order for ${input.crop} — Batch ${input.batchCode}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1a5f3f;">New Order Request</h2>
          <p>Hi ${input.farmerName},</p>
          <p><strong>${input.buyerName}</strong> wants to buy produce from your batch:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 4px 0; color: #666;">Batch</td><td><strong>${input.batchCode}</strong></td></tr>
            <tr><td style="padding: 4px 0; color: #666;">Crop</td><td>${input.crop}${input.variety ? ` (${input.variety})` : ''}</td></tr>
            <tr><td style="padding: 4px 0; color: #666;">Quantity</td><td>${input.quantityKg} kg</td></tr>
            <tr><td style="padding: 4px 0; color: #666;">Price</td><td>₹${input.pricePerKg}/kg</td></tr>
            <tr><td style="padding: 4px 0; color: #666;">Total</td><td><strong>₹${total}</strong></td></tr>
          </table>
          <p>Open your AGRONAUTS dashboard to confirm and track this order.</p>
        </div>
      `,
    });
    return 'sent';
  } catch (e) {
    console.warn('Resend email send failed:', e instanceof Error ? e.message : e);
    return 'failed';
  }
}

export async function sendFarmerOrderNotification(
  input: OrderNotificationInput
): Promise<NotificationResult> {
  const [sms, whatsapp, email] = await Promise.all([
    sendSms(input),
    sendWhatsapp(input),
    sendEmail(input),
  ]);

  const errors: string[] = [];
  if (sms === 'failed') errors.push('SMS delivery failed');
  if (whatsapp === 'failed') errors.push('WhatsApp delivery failed');
  if (email === 'failed') errors.push('Email delivery failed');

  return { sms, whatsapp, email, errors };
}
