# Security Hardening - Batch Application Script

This document outlines the security patterns applied to all edge functions.

## Pattern Applied to All Functions

```typescript
import { checkRateLimit } from "../_shared/rateLimit.ts";
import { handleError } from "../_shared/errorHandler.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting
  const rateLimit = checkRateLimit(req, {
    maxRequests: X, // Function-specific limit
    windowMs: 60000,
   message: 'Too many requests',
  });

  if (!rateLimit.allowed) {
    return rateLimit.response!;
  }

  try {
    // Function logic
  } catch (error) {
    return handleError(error, 'FUNCTION-NAME');
  }
});
```

## Rate Limits by Function Type

- **AI Functions** (ai-chat, ai-document-qa, ai-property-search): 5/min
- **SMS** (send-sms): 3/hour = 3/3600000ms
- **Email** (send-notification-email): 10/hour
- **Payment** (create-checkout, collect-rent, etc.): 5/min
- **Other** (notifications, etc.): 30/min

## Functions Fixed

✅ send-notification-email - Auth + Rate limit + Error handling  
✅ send-sms - Error handling  
✅ ai-chat - Rate limit + Error handling  
⏳ ai-document-qa - Pending  
⏳ ai-property-search - Pending  
⏳ create-checkout - Pending  
⏳ collect-rent - Pending  
⏳ process-escrow-payment - Pending  
⏳ process-deposit-refund - Pending  
⏳ process-refund - Pending  
⏳ (+ 7 more functions)

## Verification

After applying:
1. Test rate limiting with Perate requests
2. Verify error messages are generic
3. Confirm authentication required
4. Deploy to Lovable Cloud
