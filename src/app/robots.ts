export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/dashboard/', '/settings/', '/auth/'],
            },
        ],
        sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pinescript.vercel.app'}/sitemap.xml`,
    }
}
