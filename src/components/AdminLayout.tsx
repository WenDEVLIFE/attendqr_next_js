import React from 'react';
import { useRouter } from 'next/router';
import Sidebar from './sidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
    currentIndex: number;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentIndex }) => {
    const router = useRouter();

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
                // Handle logout
                router.push('/auth/login');
                break;
            default:
                break;
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans flex">
            {/* Sidebar Component */}
            <Sidebar currentIndex={currentIndex} onTap={handleNavigation} />
            
            {/* Main Content Area */}
            <main className="flex-1 ml-72 p-8 min-h-screen overflow-y-auto bg-black bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
