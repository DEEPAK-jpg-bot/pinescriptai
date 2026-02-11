export const disposableDomains = [
    "yopmail.com",
    "temp-mail.org",
    "guerrillamail.com",
    "sharklasers.com",
    "mailinator.com",
    "dispostable.com",
    "getairmail.com",
    "10minutemail.com",
    "tempmail.com",
    "fake-mail.net",
    "trashmail.com",
    "mailnesia.com",
    "mailspout.com",
    "owlymail.com",
    "temp-mail.io",
    "minutemail.com",
    "tempmailaddress.com",
    "tempmailo.com",
    "dropmail.me",
    "moakt.com"
];

export function isDisposableEmail(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return true;
    return disposableDomains.some(d => domain === d || domain.endsWith('.' + d));
}
