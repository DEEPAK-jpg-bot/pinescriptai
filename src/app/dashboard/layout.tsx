import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard | Active Strategies',
    description: 'Manage and generate your Pine Script strategies with AI.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
