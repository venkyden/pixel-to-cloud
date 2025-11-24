# Security Pattern - Quick Reference for Remaining Functions

Apply this exact pattern to each remaining function:

## Pattern Template

```typescript
// 1. ADD IMPORTS (top of file)
import { checkRateLimit } from "../_shared/rateLimit.ts";
import { handleError } from "../_shared/errorHandler.ts";

// 2. ADD RATE LIMIT CHECK (after OPTIONS, before try/catch)
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting
  const rateLimit = checkRateLimit(req, {
    maxRequests: 5,  // Adjust based on function type
    windowMs: 60000,
    message: 'Too many requests',
  });

  if (!rateLimit.allowed) {
    return rateLimit.response!;
  }

  try {
    // ... existing function logic ...
  } catch (error) {
    // 3. REPLACE ERROR HANDLER
    return handleError(error, 'FUNCTION-NAME');
  }
});
```

## Rate Limits by Function Type

- **Payment functions** (process-escrow-payment, process-deposit-refund, process-refund): 5/min
- **Webhooks** (stripe-webhook): No rate limit (validated by Stripe signature)
- **Notifications** (create-notification): 30/min
- **Utilities** (calculate-transaction-fee, expire-applications): 30/min
- **Subscriptions** (check-subscription, create-customer-portal, customer-portal): 10/min

## Remaining Functions (10)

### Quick Apply List
1. process-escrow-payment → 5/min
2. process-deposit-refund → 5/min
3. process-refund → 5/min
4. stripe-webhook → NO RATE LIMIT (Stripe validates)
5. create-notification → 30/min
6. expire-applications → 30/min
7. calculate-transaction-fee → 30/min
8. check-subscription → 10/min
9. create-customer-portal → 10/min
10. customer-portal → 10/min

## Testing After Application

```bash
# Verify no syntax errors
npm run lint

# Test rate limiting works
# (make multiple rapid requests, should get 429 after limit)

# Test error messages are generic
# (trigger error, should not see internal details)
```

---

**Status: 7/17 secured (41%)**  
**Target: 17/17 secured (100%)**  
**Time per function: ~2 minutes**  
**Total time remaining: ~20 minutes**
