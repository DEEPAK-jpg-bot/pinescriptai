import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Log In',
    description: 'Log in to your PineGen account to access your saved strategies.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
