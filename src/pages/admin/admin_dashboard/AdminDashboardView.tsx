import React from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import { Users, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
    const stats = [
        { label: 'Total Users', value: '1,234', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Active Scans Today', value: '423', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Successful Logins', value: '389', icon: CheckCircle, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { label: 'Failed Attempts', value: '12', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    ];

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
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => {
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
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                                    <p className="text-sm font-medium text-zinc-400">{stat.label}</p>
                                </div>
                                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                            </div>
                        );
                    })}
                </div>

                {/* Main Content Area placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    <div className="lg:col-span-2 rounded-3xl bg-white/5 border border-white/10 p-8 min-h-[400px] backdrop-blur-xl">
                        <h3 className="text-xl font-semibold mb-4 text-white/90">Activity Overview</h3>
                        <div className="h-full flex items-center justify-center text-zinc-500">
                            Chart Placeholder
                        </div>
                    </div>
                    <div className="rounded-3xl bg-white/5 border border-white/10 p-8 min-h-[400px] backdrop-blur-xl">
                        <h3 className="text-xl font-semibold mb-4 text-white/90">Recent Alerts</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-rose-500" />
                                    <div>
                                        <p className="text-sm font-medium text-white/80">Failed login attempt</p>
                                        <p className="text-xs text-zinc-500 mt-1">{i * 5} mins ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
