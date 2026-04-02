import React, { useState } from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import { LogIn, UserPlus, ShieldAlert, Clock, Search, Filter } from 'lucide-react';

const MOCK_LOGS = [
    { id: 1, type: 'login', user: 'Alice Cooper', action: 'Successfully logged in', time: '10:42 AM', date: '2026-04-02', status: 'success' },
    { id: 2, type: 'security', user: 'Unknown', action: 'Failed login attempt (3x)', time: '09:15 AM', date: '2026-04-02', status: 'error' },
    { id: 3, type: 'system', user: 'Diana Prince', action: 'Created new user account', time: '08:30 AM', date: '2026-04-02', status: 'info' },
    { id: 4, type: 'login', user: 'Evan Edwards', action: 'Successfully logged in', time: '04:20 PM', date: '2026-04-01', status: 'success' },
    { id: 5, type: 'security', user: 'Charlie Davis', action: 'Password reset requested', time: '02:10 PM', date: '2026-04-01', status: 'warning' },
];

const getLogIcon = (type: string, status: string) => {
    switch (type) {
        case 'login': return <LogIn className="w-4 h-4 text-emerald-400" />;
        case 'security':
            return status === 'error'
                ? <ShieldAlert className="w-4 h-4 text-rose-400" />
                : <ShieldAlert className="w-4 h-4 text-amber-400" />;
        case 'system': return <UserPlus className="w-4 h-4 text-blue-400" />;
        default: return <Clock className="w-4 h-4 text-zinc-400" />;
    }
};

export default function AdminActivityLogs() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLogs = MOCK_LOGS.filter(log =>
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout currentIndex={2}>
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            Activity Logs
                        </h1>
                        <p className="text-zinc-400 mt-2">Monitor recent events and security alerts across the platform.</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-64 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 outline-none text-sm focus:bg-white/10 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-500"
                            />
                        </div>
                        <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <div className="rounded-3xl bg-[#0a0a0a]/80 border border-white/10 overflow-hidden backdrop-blur-xl shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                                    <th className="px-6 py-4">Event</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4 hidden lg:table-cell">Action</th>
                                    <th className="px-6 py-4 hidden sm:table-cell">Timestamp</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                                                    {getLogIcon(log.type, log.status)}
                                                </div>
                                                <span className="text-sm font-medium text-white/80 capitalize">{log.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-zinc-300 font-medium">{log.user}</span>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <span className="text-sm text-zinc-400 leading-relaxed">{log.action}</span>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-zinc-300">{log.time}</span>
                                                <span className="text-[10px] text-zinc-600 uppercase tracking-tighter">{log.date}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${log.status === 'success'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : log.status === 'error'
                                                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredLogs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                            No logs found matching "{searchTerm}"
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
