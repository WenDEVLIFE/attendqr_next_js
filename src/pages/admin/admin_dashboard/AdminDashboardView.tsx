import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AdminLayout } from '../../../components/AdminLayout';
import { Users, Activity, AlertTriangle, CheckCircle, Loader2, Clock } from 'lucide-react';
import { getDashboardStats, getRecentDashboardActivities, DashboardStats } from '@/src/services/dashboard_service';
import { supabase } from '@/src/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface ActivityItem {
    report_id: number;
    activity_type: string;
    description: string;
    created_at: string;
}

interface ChartPoint {
    label: string;
    total: number;
    failed: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        activeScansToday: 0,
        successfulLoginsToday: 0,
        failedAttemptsToday: 0,
    });
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [chartData, setChartData] = useState<ChartPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const buildChartData = (allActivities: ActivityItem[]): ChartPoint[] => {
        const today = new Date();
        const startOfToday = new Date(today);
        startOfToday.setHours(0, 0, 0, 0);
        const buckets: ChartPoint[] = [];

        for (let i = 6; i >= 0; i -= 1) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            buckets.push({
                label: d.toLocaleDateString([], { weekday: 'short' }),
                total: 0,
                failed: 0,
            });
        }

        allActivities.forEach((activity) => {
            const activityDate = new Date(activity.created_at);
            const startOfActivityDay = new Date(activityDate);
            startOfActivityDay.setHours(0, 0, 0, 0);
            const dayDiff = Math.floor((startOfToday.getTime() - startOfActivityDay.getTime()) / 86400000);
            if (dayDiff < 0 || dayDiff > 6) return;

            const bucketIndex = 6 - dayDiff;
            buckets[bucketIndex].total += 1;
            if (
                activity.activity_type.includes('failed') ||
                activity.activity_type.includes('error') ||
                activity.activity_type.includes('delete')
            ) {
                buckets[bucketIndex].failed += 1;
            }
        });

        return buckets;
    };

    const fetchData = async (showLoader: boolean = true) => {
        if (showLoader) {
            setIsLoading(true);
        }

        try {
            const [statsData, activitiesData, chartActivitiesData] = await Promise.all([
                getDashboardStats(),
                getRecentDashboardActivities(5),
                getRecentDashboardActivities(300),
            ]);
            setStats(statsData);
            setActivities(activitiesData);
            setChartData(buildChartData(chartActivitiesData));
        } catch (error) {
            console.error('Dashboard: Error fetching data:', error);
        } finally {
            if (showLoader) {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchData();

        const channel = supabase
            .channel('dashboard-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, () => {
                fetchData(false);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
                fetchData(false);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const maxChartValue = Math.max(...chartData.map((point) => point.total), 1);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.45,
                ease: 'easeOut' as const,
            },
        },
    };

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Active Scans Today', value: stats.activeScansToday, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Successful Logins', value: stats.successfulLoginsToday, icon: CheckCircle, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { label: 'Failed Attempts', value: stats.failedAttemptsToday, icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    ];

    const formatTimeAgo = (dateString: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <AdminLayout currentIndex={0}>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="max-w-6xl mx-auto space-y-8"
            >
                <motion.header variants={itemVariants} className="flex justify-between items-end border-b border-white/10 pb-6">
                    <div className="flex items-center gap-5">
                        <motion.div
                            initial={{ rotate: -6, scale: 0.92, opacity: 0 }}
                            animate={{ rotate: 0, scale: 1, opacity: 1 }}
                            transition={{ duration: 0.55, ease: 'easeOut' }}
                            className="relative w-16 h-16 shrink-0"
                        >
                            <Image
                                src="/assets/logo.png"
                                alt="AttendQR Logo"
                                fill
                                sizes="64px"
                                className="object-contain rounded-2xl shadow-xl shadow-emerald-500/10"
                            />
                        </motion.div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent leading-tight">
                                Dashboard Overview
                            </h1>
                            <p className="text-zinc-400 mt-1 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Welcome back! Here's what's happening today.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => fetchData()}
                        className="p-2 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all"
                        title="Refresh data"
                    >
                        <Loader2 className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </motion.header>

                {/* Stats Grid */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: index * 0.06 }}
                                whileHover={{ y: -4, scale: 1.01 }}
                                className="relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl transition-all duration-300 hover:bg-white/10 hover:shadow-2xl hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-2xl ${stat.bg}`}>
                                        <Icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                    {isLoading && <Loader2 className="w-4 h-4 text-zinc-600 animate-spin" />}
                                </div>
                                <div>
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={`${stat.label}-${isLoading ? 'loading' : stat.value}`}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-3xl font-bold text-white mb-1"
                                        >
                                            {isLoading ? '---' : stat.value.toLocaleString()}
                                        </motion.p>
                                    </AnimatePresence>
                                    <p className="text-sm font-medium text-zinc-400">{stat.label}</p>
                                </div>
                                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Main Content Area */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.08 }}
                        className="lg:col-span-2 rounded-3xl bg-white/5 border border-white/10 p-5 md:p-8 min-h-[400px] backdrop-blur-xl group"
                    >
                        <h3 className="text-xl font-semibold mb-4 text-white/90">Activity Overview</h3>
                        <div className="bg-black/20 rounded-2xl border border-white/10 p-4 md:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                                <p className="text-xs uppercase tracking-widest text-zinc-500">Last 7 Days</p>
                                <div className="flex items-center gap-4 text-xs text-zinc-400">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                        Total
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                        Failed
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto pb-4 -mx-2 px-2">
                                <div className="min-w-[540px] h-[200px] flex items-end gap-3 md:gap-4">
                                    {chartData.map((point, index) => {
                                        const totalHeight = Math.max((point.total / maxChartValue) * 100, point.total > 0 ? 6 : 2);
                                        const failedHeight = point.total > 0 ? Math.max((point.failed / maxChartValue) * 100, point.failed > 0 ? 4 : 0) : 0;

                                        return (
                                            <motion.div
                                                key={point.label}
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.35, delay: 0.1 + (index * 0.04) }}
                                                className="flex-1 min-w-[60px] flex flex-col items-center gap-3"
                                            >
                                                <div className="w-full h-full bg-white/5 rounded-xl border border-white/5 p-1.5 flex items-end relative overflow-hidden group/bar">
                                                    <motion.div
                                                        className="w-full rounded-lg bg-gradient-to-t from-emerald-600 to-emerald-400/80 transition-all duration-500"
                                                        initial={{ height: '2%' }}
                                                        animate={{ height: `${totalHeight}%` }}
                                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                                    />
                                                    {failedHeight > 0 && (
                                                        <motion.div
                                                            className="absolute bottom-1.5 left-1.5 right-1.5 rounded-md bg-gradient-to-t from-rose-600 to-rose-400/90 transition-all duration-500"
                                                            initial={{ height: '0%' }}
                                                            animate={{ height: `${failedHeight}%` }}
                                                            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.12 }}
                                                        />
                                                    )}
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[11px] leading-none text-zinc-300 font-bold">{point.total}</p>
                                                    <p className="mt-1.5 text-[9px] md:text-[10px] leading-none uppercase tracking-widest text-zinc-500 font-medium">{point.label}</p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Real-time sync active</p>
                                <p className="text-[10px] text-zinc-600">Auto-updates on activity</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.14 }}
                        className="rounded-3xl bg-white/5 border border-white/10 p-8 min-h-[400px] backdrop-blur-xl"
                    >
                        <h3 className="text-xl font-semibold mb-4 text-white/90">Recent Alerts</h3>
                        <div className="space-y-4">
                            {isLoading ? (
                                [1, 2, 3].map((i) => (
                                    <div key={i} className="animate-pulse flex items-start gap-4 p-3 rounded-xl bg-white/5">
                                        <div className="w-2 h-2 rounded-full bg-zinc-700 mt-2" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 bg-zinc-700 rounded w-3/4" />
                                            <div className="h-2 bg-zinc-800 rounded w-1/4" />
                                        </div>
                                    </div>
                                ))
                            ) : activities.length > 0 ? (
                                <AnimatePresence initial={false}>
                                    {activities.map((activity) => (
                                        <motion.div
                                            key={activity.report_id}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.25 }}
                                            className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                                        >
                                            <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${activity.activity_type.includes('failed') || activity.activity_type.includes('error') || activity.activity_type.includes('delete')
                                                ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                                                : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                                                }`} />
                                            <div>
                                                <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                                                    {activity.description}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-zinc-500 uppercase tracking-widest font-bold">
                                                        {activity.activity_type.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                                                        <Clock className="w-2.5 h-2.5" />
                                                        {formatTimeAgo(activity.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            ) : (
                                <div className="py-20 text-center text-zinc-600">
                                    <p className="text-sm">No recent activity found.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </AdminLayout>
    );
}
