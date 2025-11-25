import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { checkRateLimit } from "../_shared/rateLimit.ts";
import { handleError } from "../_shared/errorHandler.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fee structure - configurable percentages
const FEE_STRUCTURE = {
  application: 0.02, // 2% of monthly rent for application processing
  contract: 0.05, // 5% of monthly rent when contract is signed
  monthly_rent: 0.03, // 3% of each rent payment
  deposit_release: 0.02, // 2% of deposit when released
};

// Input validation schema
const feeRequestSchema = z.object({
  transactionType: z.enum(['application', 'contract', 'monthly_rent', 'deposit_release'], {
    errorMap: () => ({ message: "Invalid transaction type" })
  }),
  amount: z.number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount exceeds maximum (€1,000,000)')
    .finite('Amount must be a valid number'),
  contractId: z.string().uuid('Invalid contract ID').optional(),
  applicationId: z.string().uuid('Invalid application ID').optional()
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const rateLimit = checkRateLimit(req, { maxRequests: 30, windowMs: 60000, message: 'Too many fee calculation requests' });
  if (!rateLimit.allowed) return rateLimit.response!;

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized: Invalid or expired token");
    }

    // Parse and validate input
    const body = await req.json();
    const validation = feeRequestSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid input',
          details: validation.error.errors
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const { transactionType, amount, contractId, applicationId } = validation.data;

    // Verify ownership if contractId provided
    if (contractId) {
      const { data: contract, error: contractError } = await supabaseClient
        .from('contracts')
        .select('tenant_id, landlord_id')
        .eq('id', contractId)
        .single();

      if (contractError || !contract) {
        throw new Error('Contract not found');
      }

      if (contract.tenant_id !== user.id && contract.landlord_id !== user.id) {
        throw new Error('Unauthorized: You do not own this contract');
      }
    }

    // Verify ownership if applicationId provided
    if (applicationId) {
      const { data: application, error: appError } = await supabaseClient
        .from('tenant_applications')
        .select('user_id, property_id')
        .eq('id', applicationId)
        .single();

      if (appError || !application) {
        throw new Error('Application not found');
      }

      // Check if user is applicant or property owner
      const { data: property } = await supabaseClient
        .from('properties')
        .select('owner_id')
        .eq('id', application.property_id)
        .single();

      if (application.user_id !== user.id && property?.owner_id !== user.id) {
        throw new Error('Unauthorized: You do not own this application');
      }
    }

    // Calculate fee based on transaction type
    const feePercentage = FEE_STRUCTURE[transactionType];
    const description = {
      application: "Application processing fee",
      contract: "Contract signing fee",
      monthly_rent: "Monthly rent transaction fee",
      deposit_release: "Deposit release fee"
    }[transactionType];

    const feeAmount = amount * feePercentage;
    const netAmount = amount - feeAmount;

    console.log(
      `Transaction fee calculated: ${transactionType}, Amount: €${amount}, Fee: €${feeAmount.toFixed(
        2
      )} (${(feePercentage * 100).toFixed(1)}%)`
    );

    // Record the transaction fee
    const { data, error } = await supabaseClient.from("transaction_fees").insert({
      transaction_type: transactionType,
      gross_amount: amount,
      fee_amount: feeAmount,
      fee_percentage: feePercentage,
      net_amount: netAmount,
      description,
      contract_id: contractId || null,
      application_id: applicationId || null,
    }).select().single();

    if (error) throw error;

    // Create audit log with user tracking
    await supabaseClient.from("audit_logs").insert({
      user_id: user.id,
      action: "transaction_fee_calculated",
      table_name: "transaction_fees",
      record_id: data.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        feeAmount,
        feePercentage,
        netAmount,
        grossAmount: amount,
        description,
        feeId: data.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return handleError(error, 'CALCULATE-TRANSACTION-FEE');
  }
});
