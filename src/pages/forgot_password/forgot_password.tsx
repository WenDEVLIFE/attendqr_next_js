'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState(1); // 1: input, 2: success
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setStep(2);
        }, 1500);
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black text-white font-sans">
            {/* Background with focal point animation */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <Image
                    src="/assets/login-bg.png"
                    alt="Login Background"
                    fill
                    className="object-cover opacity-60 transition-transform duration-[20s] hover:scale-110"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-transparent to-black/80 backdrop-blur-[2px]" />
            </div>

            {/* Card Wrapper */}
            <div className="relative z-10 w-full max-w-md px-6">
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl transition-all duration-500 hover:shadow-indigo-500/20">
                    <Link
                        href="/admin/login"
                        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-8 group"
                    >
                        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to login
                    </Link>

                    {step === 1 ? (
                        <>
                            <div className="mb-10">
                                <h1 className="text-3xl font-bold tracking-tight mb-3 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                    Reset Password
                                </h1>
                                <p className="text-white/50 leading-relaxed font-medium">
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
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

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="relative w-full overflow-hidden rounded-2xl bg-white py-4 text-black font-bold transition-all duration-300 hover:bg-white/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    <div className="relative z-10 flex items-center justify-center gap-2">
                                        {isLoading ? (
                                            <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                        ) : (
                                            'Send Reset Link'
                                        )}
                                    </div>
                                    <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-xl shadow-indigo-500/10">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold mb-4">Check your email</h2>
                            <p className="text-white/50 leading-relaxed mb-8">
                                We've sent a password reset link to <span className="text-white font-semibold">{email}</span>. Please check your inbox and spam folder.
                            </p>
                            <button
                                onClick={() => setStep(1)}
                                className="text-sm font-semibold text-white/50 hover:text-white transition-colors underline decoration-white/20 underline-offset-4"
                            >
                                Didn't receive it? Try again
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer info */}
                <p className="mt-8 text-center text-white/30 text-xs tracking-wider uppercase font-semibold">
                    © 2026 ATTENDQR • ALL RIGHTS RESERVED
                </p>
            </div>
        </div>
    );
}
