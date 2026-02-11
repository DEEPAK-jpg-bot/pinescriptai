/**
 * Strictly allowed email domains. 
 * Any email not matching these will be rejected to prevent disposable/fake accounts.
 */
export const allowedDomains = [
    "gmail.com",
    "outlook.com",
    "hotmail.com",
    "live.com",
    "icloud.com",
    "yahoo.com",
    "protonmail.com",
    "proton.me",
    "me.com",
    "msn.com"
];

/**
 * Validates if an email is from a trusted provider.
 * This also prevents common disposable email patterns.
 */
export function isAllowedEmail(email: string): boolean {
    if (!email || !email.includes('@')) return false;

    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;

    // Check if domain is in whitelist
    const isWhitelisted = allowedDomains.some(d => domain === d);

    // Check for common 'temp' keywords in domain as a secondary safeguard
    const isSuspicious = domain.includes('temp') ||
        domain.includes('fake') ||
        domain.includes('trash') ||
        domain.includes('disposable') ||
        domain.includes('yopmail');

    return isWhitelisted && !isSuspicious;
}
