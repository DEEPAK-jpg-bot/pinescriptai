export default function Privacy() {
    return (
        <div className="min-h-screen bg-white p-8 md:p-24 font-sans text-slate-800 leading-relaxed">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-slate-900">Privacy Policy</h1>
                <p className="mb-6 italic text-slate-500">Last updated: February 13, 2026</p>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4 text-slate-900">1. Information We Collect</h2>
                    <p className="mb-4">We collect information to provide better services to all our users. This includes:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li><strong>Account Information:</strong> When you sign up, we collect your email address via Supabase Authentication.</li>
                        <li><strong>Usage Data:</strong> We log the prompts you send to our AI and the code it generates to improve our service and prevent abuse.</li>
                        <li><strong>Payment Data:</strong> Payment processing is handled by Lemon Squeezy. We do not store your credit card information on our servers.</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4 text-slate-900">2. How We Use Information</h2>
                    <p>We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect PineGen and our users.</p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4 text-slate-900">3. Data Security</h2>
                    <p>We work hard to protect PineGen and our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold.</p>
                </section>

                <div className="mt-12 pt-8 border-t border-slate-100">
                    <p className="text-sm text-slate-500">If you have any questions about this Privacy Policy, please contact us at support@pinegen.ai</p>
                </div>
            </div>
        </div>
    );
}
