import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

export interface AdminUser {
    id: number;
    username: string;
    email: string;
    role: string;
}

export const useAuth = () => {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const checkSession = useCallback(() => {
        setIsLoading(true);
        try {
            const storedUser = localStorage.getItem('admin_user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('[useAuth] Error parsing stored user:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    const login = (userData: AdminUser) => {
        localStorage.setItem('admin_user', JSON.stringify(userData));
        setUser(userData);
        router.push('/admin/admin_dashboard');
    };

    const logout = () => {
        localStorage.removeItem('admin_user');
        setUser(null);
        router.push('/auth/login');
    };

    return {
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
        refreshSession: checkSession
    };
};
