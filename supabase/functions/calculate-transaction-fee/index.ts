import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { transactionType, amount, contractId, applicationId } = await req.json();

    if (!transactionType || !amount) {
      throw new Error("Transaction type and amount are required");
    }

    // Calculate fee based on transaction type
    let feePercentage = 0;
    let description = "";

    switch (transactionType) {
      case "application":
        feePercentage = FEE_STRUCTURE.application;
        description = "Application processing fee";
        break;
      case "contract":
        feePercentage = FEE_STRUCTURE.contract;
        description = "Contract signing fee";
        break;
      case "monthly_rent":
        feePercentage = FEE_STRUCTURE.monthly_rent;
        description = "Monthly rent transaction fee";
        break;
      case "deposit_release":
        feePercentage = FEE_STRUCTURE.deposit_release;
        description = "Deposit release fee";
        break;
      default:
        throw new Error("Invalid transaction type");
    }

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

    // Create audit log
    await supabaseClient.from("audit_logs").insert({
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
  } catch (error: any) {
    console.error("Error calculating transaction fee:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
