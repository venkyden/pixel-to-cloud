/**
 * Generic Error Handler for Edge Functions
 * Prevents information leakage while maintaining server-side logs
 */

export function handleError(error: unknown, context: string): Response {
    // Log detailed error server-side for debugging
    console.error(`[${context}]`, error);

    // Determine generic client-facing error message
    let publicMessage = 'An error occurred processing your request';
    let statusCode = 500;

    if (error instanceof Error) {
        const message = error.message.toLowerCase();

        if (message.includes('auth') || message.includes('unauthorized')) {
            publicMessage = 'Authentication failed';
            statusCode = 401;
        } else if (message.includes('rate limit')) {
            publicMessage = 'Too many requests';
            statusCode = 429;
        } else if (message.includes('validation') || message.includes('invalid')) {
            publicMessage = 'Invalid request data';
            statusCode = 400;
        } else if (message.includes('not found')) {
            publicMessage = 'Resource not found';
            statusCode = 404;
        } else if (message.includes('forbidden') || message.includes('permission')) {
            publicMessage = 'Access denied';
            statusCode = 403;
        }
    }

    return new Response(
        JSON.stringify({ error: publicMessage }),
        {
            status: statusCode,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            },
        }
    );
}

/**
 * Success response helper
 */
export function successResponse(data: unknown, status = 200): Response {
    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            },
        }
    );
}
