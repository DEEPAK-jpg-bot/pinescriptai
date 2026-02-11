import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Create Your Account',
    description: 'Sign up for PineGen and start generating TradingView strategies in seconds.',
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
