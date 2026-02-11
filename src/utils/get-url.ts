/**
 * Dynamically determines the base URL for redirects.
 * Prioritizes window.location.origin in the browser for maximum accuracy.
 * Fallbacks to environment variables for server-side execution.
 */
export const getURL = () => {
    // 1. Client-side: use window.location.origin
    if (typeof window !== 'undefined') {
        const origin = window.location.origin;
        return origin.endsWith('/') ? origin : `${origin}/`;
    }

    // 2. Server-side: use environment variables
    let url =
        process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this in Vercel settings for Custom Domains
        process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel
        'http://localhost:3000/';

    // Ensure protocol is included
    url = url.includes('http') ? url : `https://${url}`;

    // Ensure trailing slash
    return url.endsWith('/') ? url : `${url}/`;
};
