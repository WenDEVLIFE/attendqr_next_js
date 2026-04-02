import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './sidebar';
import { useAuth } from '@/src/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
    currentIndex: number;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentIndex }) => {
    const { isAuthenticated, isLoading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isLoading, isAuthenticated, router]);

    const handleNavigation = (index: number) => {
        switch (index) {
            case 0:
                router.push('/admin/admin_dashboard');
                break;
            case 1:
                router.push('/admin/admin_users');
                break;
            case 2:
                router.push('/admin/admin_activity_logs');
                break;
            case 3:
                // Handle logout through the hook
                logout();
                break;
            default:
                break;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                    <p className="text-zinc-500 font-medium">Verifying session...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect via useEffect
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans flex">
            {/* Sidebar Component */}
            <Sidebar currentIndex={currentIndex} onTap={handleNavigation} />
            
            {/* Main Content Area */}
            <main className="flex-1 ml-72 p-8 min-h-screen overflow-y-auto bg-black bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.1),rgba(255,255,255,0))]">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
