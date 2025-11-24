/**
 * Rate Limiting Middleware for Edge Functions
 * Implements IP-based rate limiting with token bucket algorithm
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (Note: This resets on function cold starts)
const store: RateLimitStore = {};

export function checkRateLimit(
  request: Request,
  config: RateLimitConfig = {
    maxRequests: 100,
    windowMs: 60000,
    message: 'Too many requests, please try again later',
  }
): { allowed: boolean; response?: Response; headers: Record<string, string> } {
  const identifier = getIdentifier(request);
  const now = Date.now();
  const entry = store[identifier];

  // Clean up expired entries
  if (entry && now > entry.resetTime) {
    delete store[identifier];
  }

  if (!store[identifier]) {
    const resetTime = now + config.windowMs;
    store[identifier] = { count: 1, resetTime };
    
    return {
      allowed: true,
      headers: getRateLimitHeaders(config.maxRequests - 1, resetTime),
    };
  }

  const currentEntry = store[identifier];

  if (currentEntry.count >= config.maxRequests) {
    return {
      allowed: false,
      response: new Response(
        JSON.stringify({
          error: config.message,
          retryAfter: new Date(currentEntry.resetTime).toISOString(),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...getRateLimitHeaders(0, currentEntry.resetTime),
          },
        }
      ),
      headers: getRateLimitHeaders(0, currentEntry.resetTime),
    };
  }

  currentEntry.count++;
  const remaining = config.maxRequests - currentEntry.count;

  return {
    allowed: true,
    headers: getRateLimitHeaders(remaining, currentEntry.resetTime),
  };
}

function getIdentifier(request: Request): string {
  // Try to get IP from headers (Cloudflare, Vercel, etc.)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  const ip = cfConnectingIp || realIp || forwardedFor?.split(',')[0] || 'unknown';
  
  // Optionally include user agent for more granular control
  const userAgent = request.headers.get('user-agent') || '';
  
  return `${ip}-${userAgent.substring(0, 50)}`;
}

function getRateLimitHeaders(
  remaining: number,
  resetTime: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(resetTime).toISOString(),
    'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
  };
}
