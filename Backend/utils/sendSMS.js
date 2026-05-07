import twilio from "twilio";

/**
 * Send an SMS via Twilio Messaging.
 * @param {{ to: string, body: string }} options
 *   to   — recipient phone number (10 digits or E.164 e.g. +91XXXXXXXXXX)
 *   body — message text
 */
const sendSMS = async ({ to, body }) => {
  const sid   = process.env.TWILIO_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_SMS_NO;

  if (!sid || !token || !from) {
    throw new Error("Twilio SMS credentials not configured (TWILIO_SID / TWILIO_AUTH_TOKEN / TWILIO_SMS_NO)");
  }

  // Normalise to E.164 (+91 for India if 10 digits given)
  const mobile = String(to).replace(/\D/g, "");
  const e164 = mobile.startsWith("91") && mobile.length === 12
    ? `+${mobile}`
    : mobile.length === 10
    ? `+91${mobile}`
    : `+${mobile}`;

  const client = twilio(sid, token);
  const message = await client.messages.create({
    body,
    from,
    to: e164,
  });

  console.log(`[TwilioSMS] Sent to ${e164} — SID: ${message.sid}`);
  return message;
};

export default sendSMS;
