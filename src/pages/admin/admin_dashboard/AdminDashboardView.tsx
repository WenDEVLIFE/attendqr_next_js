import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import { Users, Activity, AlertTriangle, CheckCircle, Loader2, Clock } from 'lucide-react';
import { getDashboardStats, getRecentDashboardActivities, DashboardStats } from '@/src/services/dashboard_service';

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        activeScansToday: 0,
        successfulLoginsToday: 0,
        failedAttemptsToday: 0,
    });
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [statsData, activitiesData] = await Promise.all([
                getDashboardStats(),
                getRecentDashboardActivities(5)
            ]);
            setStats(statsData);
            setActivities(activitiesData);
        } catch (error) {
            console.error('Dashboard: Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
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
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <header className="flex justify-between items-end border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                            Dashboard Overview
                        </h1>
                        <p className="text-zinc-400 mt-2">Welcome back! Here's what's happening today.</p>
                    </div>
                    <button 
                        onClick={fetchData}
                        className="p-2 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all"
                        title="Refresh data"
                    >
                        <Loader2 className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={index}
                                className="relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl transition-all duration-300 hover:bg-white/10 hover:shadow-2xl hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-2xl ${stat.bg}`}>
                                        <Icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                    {isLoading && <Loader2 className="w-4 h-4 text-zinc-600 animate-spin" />}
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-white mb-1">
                                        {isLoading ? '---' : stat.value.toLocaleString()}
                                    </p>
                                    <p className="text-sm font-medium text-zinc-400">{stat.label}</p>
                                </div>
                                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                            </div>
                        );
                    })}
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    <div className="lg:col-span-2 rounded-3xl bg-white/5 border border-white/10 p-8 min-h-[400px] backdrop-blur-xl group">
                        <h3 className="text-xl font-semibold mb-4 text-white/90">Activity Overview</h3>
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500 bg-black/20 rounded-2xl border border-dashed border-white/5 group-hover:border-white/10 transition-colors">
                            <Activity className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-sm">Real-time charts coming soon</p>
                        </div>
                    </div>
                    <div className="rounded-3xl bg-white/5 border border-white/10 p-8 min-h-[400px] backdrop-blur-xl">
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
                                activities.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                                        <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                                            activity.activity_type.includes('failed') || activity.activity_type.includes('error') || activity.activity_type.includes('delete')
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
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center text-zinc-600">
                                    <p className="text-sm">No recent activity found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
