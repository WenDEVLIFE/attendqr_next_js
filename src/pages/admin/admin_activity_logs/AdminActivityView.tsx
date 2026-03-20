import React from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import { LogIn, UserPlus, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

const MOCK_LOGS = [
    { id: 1, type: 'login', user: 'Alice Cooper', action: 'Successfully logged in', time: '10:42 AM', date: 'Today', status: 'success' },
    { id: 2, type: 'security', user: 'Unknown', action: 'Failed login attempt (3x)', time: '09:15 AM', date: 'Today', status: 'error' },
    { id: 3, type: 'system', user: 'Diana Prince', action: 'Created new user account', time: '08:30 AM', date: 'Today', status: 'info' },
    { id: 4, type: 'login', user: 'Evan Edwards', action: 'Successfully logged in', time: 'Yesterday 04:20 PM', date: 'Yesterday', status: 'success' },
    { id: 5, type: 'security', user: 'Charlie Davis', action: 'Password reset requested', time: 'Yesterday 02:10 PM', date: 'Yesterday', status: 'warning' },
];

const getLogIcon = (type: string, status: string) => {
    switch (type) {
        case 'login': return <LogIn className="w-5 h-5 text-emerald-400" />;
        case 'security':
            return status === 'error'
                ? <ShieldAlert className="w-5 h-5 text-rose-400" />
                : <ShieldAlert className="w-5 h-5 text-amber-400" />;
        case 'system': return <UserPlus className="w-5 h-5 text-blue-400" />;
        default: return <Clock className="w-5 h-5 text-zinc-400" />;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'success': return 'border-emerald-500/20 bg-emerald-500/5';
        case 'error': return 'border-rose-500/20 bg-rose-500/5';
        case 'warning': return 'border-amber-500/20 bg-amber-500/5';
        default: return 'border-blue-500/20 bg-blue-500/5';
    }
}

export default function AdminActivityLogs() {
    return (
        <AdminLayout currentIndex={2}>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <header className="border-b border-white/10 pb-6">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        Activity Logs
                    </h1>
                    <p className="text-zinc-400 mt-2">Monitor recent events and security alerts across the platform.</p>
                </header>

                <div className="relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                    <div className="space-y-6">
                        {MOCK_LOGS.map((log) => (
                            <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">

                                {/* Timeline Dot */}
                                <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-black bg-zinc-900 absolute left-0 md:left-1/2 -ml-6 md:-ml-6 z-10 shadow shadow-black overflow-hidden group-hover:scale-110 transition-transform">
                                    <div className="absolute inset-0 bg-white/5" />
                                    {getLogIcon(log.type, log.status)}
                                </div>

                                {/* Content Card */}
                                <div className="w-full md:w-5/12 pl-16 md:pl-0">
                                    <div className={`p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:shadow-lg ${getStatusColor(log.status)} hover:bg-white/10`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm font-bold text-white/90">{log.user}</span>
                                            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                                <Clock className="w-3 h-3" />
                                                {log.time}
                                            </div>
                                        </div>
                                        <p className="text-sm text-zinc-400 leading-relaxed">
                                            {log.action}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
