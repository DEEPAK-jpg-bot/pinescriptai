import { Metadata } from 'next';
import { Sidebar } from '@/components/Sidebar';

export const metadata: Metadata = {
    title: 'Dashboard | Active Strategies',
    description: 'Manage and generate your Pine Script strategies with AI.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <Sidebar />
            <main className="flex-1 overflow-hidden relative">
                {children}
            </main>
        </div>
    );
}
