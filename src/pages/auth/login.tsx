'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import router from 'next/router';
import { supabase } from '@/src/lib/supabase/client';
import { verifyPassword } from '@/src/lib/supabase/hash';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            console.log('[login] Attempting login for:', email.trim().toLowerCase());

            // 1. Look up user by email in the custom users table
            const { data: user, error: dbError } = await supabase
                .from('users')
                .select('id, username, email, role, password')
                .eq('email', email.trim().toLowerCase())
                .single();

            if (dbError || !user) {
                console.error('[login] User lookup failed or not found:');
                if (dbError) console.error('[login] Database error:', dbError);
                if (!user) console.error('[login] No user matches this email:', email.trim().toLowerCase());

                setError('Invalid email or password.');
                setIsLoading(false);
                return;
            }

            console.log('[login] User found:', { id: user.id, email: user.email, role: user.role });
            console.log('[login] Stored password string (prefix):', user.password ? user.password.substring(0, 10) + '...' : 'null');

            // 2. Verify password against stored bcrypt hash
            let passwordMatch = await verifyPassword(password, user.password);
            console.log('[login] Bcrypt match result:', passwordMatch);

            // Fallback: If bcrypt fails, check if it's stored plain (e.g. if trigger wasn't run yet)
            if (!passwordMatch && password === user.password) {
                console.warn('[login] Plain-text password fallback used!');
                passwordMatch = true;
            }

            if (!passwordMatch) {
                console.error('[login] Password verification failed.');
                setError('Invalid email or password.');
                setIsLoading(false);
                return;
            }

            // 3. Check the user has admin role
            if (user.role !== 'admin') {
                console.error('[login] Role mismatch. Expected admin, got:', user.role);
                setError('Access denied. You do not have admin privileges.');
                setIsLoading(false);
                return;
            }

            console.log('[login] Login successful! Redirecting...');

            // 4. Store session info and redirect
            localStorage.setItem('admin_user', JSON.stringify({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            }));

            router.push('/admin/admin_dashboard');
        } catch (err) {
            console.error('[login] Unexpected error:', err);
            setError('An unexpected error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black text-white font-sans">
            {/* Background with subtle animation */}
            <div className=" inset-0 z-0 overflow-hidden">
                <Image
                    src="/assets/login-bg.png"
                    alt="Login Background"
                    fill
                    className="object-cover opacity-60 transition-transform duration-[20s] hover:scale-110"
                    priority
                />
                <div className=" inset-0 bg-gradient-to-br from-black/80 via-transparent to-black/80" />
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md px-6">
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl transition-all duration-500 hover:shadow-indigo-500/20">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                            AttendQR Admin
                        </h1>
                        <p className="text-white/50 font-medium">Welcome back, please login to continue.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            {/* Email Input */}
                            <div className="relative group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder=" "
                                    required
                                    className="peer w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none transition-all duration-300 focus:bg-white/10 focus:border-white/30 focus:ring-4 focus:ring-white/5 placeholder-transparent"
                                />
                                <label className="absolute left-5 top-4 text-white/40 pointer-events-none transition-all duration-300 peer-focus:-top-2.5 peer-focus:left-4 peer-focus:text-xs peer-focus:text-white/60 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-white/60 bg-black/40 px-2 rounded backdrop-blur-sm">
                                    Email Address
                                </label>
                            </div>

                            {/* Password Input */}
                            <div className="relative group">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder=" "
                                    required
                                    className="peer w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none transition-all duration-300 focus:bg-white/10 focus:border-white/30 focus:ring-4 focus:ring-white/5 placeholder-transparent"
                                />
                                <label className="absolute left-5 top-4 text-white/40 pointer-events-none transition-all duration-300 peer-focus:-top-2.5 peer-focus:left-4 peer-focus:text-xs peer-focus:text-white/60 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-white/60 bg-black/40 px-2 rounded backdrop-blur-sm">
                                    Password
                                </label>
                            </div>
                        </div>

                        {/* Inline error message */}
                        {error && (
                            <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <Link
                            href="/admin/forgot_password"
                            className="text-sm font-medium text-white/50 hover:text-white transition-colors"
                        >
                            Forgot password?
                        </Link>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="relative w-full overflow-hidden rounded-2xl bg-white py-4 text-black font-bold transition-all duration-300 hover:bg-white/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <div className="relative z-10 flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    'Sign In'
                                )}
                            </div>
                            <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                        </button>
                    </form>
                </div>

                {/* Footer info */}
                <p className="mt-8 text-center text-white/30 text-xs tracking-wider uppercase font-semibold">
                    © 2026 ATTENDQR • ALL RIGHTS RESERVED
                </p>
            </div>
        </div>
    );
}
