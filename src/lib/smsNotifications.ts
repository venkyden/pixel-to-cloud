import { supabase } from "@/integrations/supabase/client";

interface SMSPayload {
  to: string;
  message: string;
  priority?: "urgent" | "normal";
}

/**
 * Send SMS notification via Twilio
 * @param payload - SMS details including recipient, message, and priority
 * @returns Promise with success status and message SID
 */
export async function sendSMS(payload: SMSPayload) {
  try {
    const { data, error } = await supabase.functions.invoke("send-sms", {
      body: payload,
    });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
}

/**
 * Send urgent notification SMS for lease termination
 */
export async function sendLeaseTerminationSMS(
  phoneNumber: string,
  propertyAddress: string,
  terminationDate: string
) {
  const message = `URGENT: Lease termination notice for ${propertyAddress}. Termination date: ${terminationDate}. Please log in to Roomivo for details.`;
  
  return sendSMS({
    to: phoneNumber,
    message,
    priority: "urgent",
  });
}

/**
 * Send urgent notification SMS for payment failure
 */
export async function sendPaymentFailureSMS(
  phoneNumber: string,
  amount: number,
  propertyAddress: string
) {
  const message = `URGENT: Rent payment of €${amount} failed for ${propertyAddress}. Please update your payment method on Roomivo immediately.`;
  
  return sendSMS({
    to: phoneNumber,
    message,
    priority: "urgent",
  });
}

/**
 * Send urgent notification SMS for critical maintenance
 */
export async function sendMaintenanceUrgentSMS(
  phoneNumber: string,
  issue: string,
  propertyAddress: string
) {
  const message = `URGENT: Critical maintenance issue at ${propertyAddress}: ${issue}. Immediate attention required. Check Roomivo for details.`;
  
  return sendSMS({
    to: phoneNumber,
    message,
    priority: "urgent",
  });
}

/**
 * Send SMS for dispute resolution scheduled
 */
export async function sendDisputeMediationSMS(
  phoneNumber: string,
  disputeTitle: string,
  scheduledDate: string
) {
  const message = `Mediation scheduled for: ${disputeTitle}. Date: ${scheduledDate}. Details available on Roomivo.`;
  
  return sendSMS({
    to: phoneNumber,
    message,
    priority: "normal",
  });
}