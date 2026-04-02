import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import { LogIn, UserPlus, ShieldAlert, Clock, Search, Filter, Loader2, RefreshCw, Edit3, Trash2 } from 'lucide-react';
import { getRecentActivitiesWithUsers } from '@/src/services/activity_service';
import { supabase } from '@/src/lib/supabase/client';

export default function AdminActivityLogs() {
    const [searchTerm, setSearchTerm] = useState('');
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const data = await getRecentActivitiesWithUsers(50);
            setLogs(data || []);
        } catch (error) {
            console.error('Activity Logs: Error fetching logs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();

        // Real-time subscription
        const channel = supabase
            .channel('realtime:activities')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'activities' },
                async (payload) => {
                    console.log('New activity received:', payload);

                    // Fetch user info for the new activity (since joined data isn't in payload)
                    const { data: user } = await supabase
                        .from('users')
                        .select('username')
                        .eq('id', payload.new.user_id)
                        .single();

                    const newLog = {
                        ...payload.new,
                        users: user || { username: 'Unknown' }
                    };

                    setLogs(prev => [newLog, ...prev.slice(0, 49)]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const getLogUIConfig = (type: string) => {
        switch (type) {
            case 'user_login':
                return { icon: <LogIn className="w-4 h-4 text-emerald-400" />, label: 'login', status: 'success' };
            case 'login_failure':
            case 'login_unauthorized':
                return { icon: <ShieldAlert className="w-4 h-4 text-rose-400" />, label: 'security', status: 'error' };
            case 'user_created':
                return { icon: <UserPlus className="w-4 h-4 text-blue-400" />, label: 'system', status: 'info' };
            case 'user_updated':
                return { icon: <Edit3 className="w-4 h-4 text-amber-400" />, label: 'system', status: 'warning' };
            case 'user_deleted':
                return { icon: <Trash2 className="w-4 h-4 text-rose-400" />, label: 'security', status: 'error' };
            default:
                return { icon: <Clock className="w-4 h-4 text-zinc-400" />, label: 'other', status: 'info' };
        }
    };

    const filteredLogs = logs.filter(log => {
        const username = log.users?.username || 'Unknown';
        const search = searchTerm.toLowerCase();
        return (
            username.toLowerCase().includes(search) ||
            log.description.toLowerCase().includes(search) ||
            log.activity_type.toLowerCase().includes(search)
        );
    });

    const formatTimestamp = (dateString: string) => {
        const date = new Date(dateString);
        return {
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: date.toLocaleDateString()
        };
    };

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
                        <button
                            onClick={fetchLogs}
                            className="p-3 bg-white/5 border border-white/10 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                            title="Refresh logs"
                        >
                            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </header>

                <div className="rounded-3xl bg-[#0a0a0a]/80 border border-white/10 overflow-hidden backdrop-blur-xl shadow-2xl min-h-[400px]">
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
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                                                <p className="text-zinc-500 text-sm">Fetching live logs...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredLogs.map((log) => {
                                    const { icon, label, status } = getLogUIConfig(log.activity_type);
                                    const { time, date } = formatTimestamp(log.created_at);
                                    return (
                                        <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                                                        {icon}
                                                    </div>
                                                    <span className="text-sm font-medium text-white/80 capitalize">{label}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-zinc-300 font-medium">{log.users?.username || 'Unknown'}</span>
                                            </td>
                                            <td className="px-6 py-4 hidden lg:table-cell">
                                                <span className="text-sm text-zinc-400 leading-relaxed">{log.description}</span>
                                            </td>
                                            <td className="px-6 py-4 hidden sm:table-cell">
                                                <div className="flex flex-col text-zinc-400">
                                                    <span className="text-sm">{time}</span>
                                                    <span className="text-[10px] uppercase tracking-tighter opacity-50">{date}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${status === 'success'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                                                    : status === 'error'
                                                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.2)]'
                                                        : status === 'warning'
                                                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                                                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    }`}>
                                                    {status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {!isLoading && filteredLogs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                            {searchTerm ? `No logs found matching "${searchTerm}"` : 'No activities recorded yet.'}
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
