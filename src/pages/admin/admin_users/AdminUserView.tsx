import React, { useState } from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import { Search, MoreVertical, Edit2, Trash2 } from 'lucide-react';

const MOCK_USERS = [
    { id: 1, name: 'Alice Cooper', email: 'alice@example.com', role: 'Staff', status: 'Active', date: '2026-03-19' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Student', status: 'Inactive', date: '2026-03-18' },
    { id: 3, name: 'Charlie Davis', email: 'charlie@example.com', role: 'Staff', status: 'Active', date: '2026-03-17' },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'Admin', status: 'Active', date: '2026-03-16' },
    { id: 5, name: 'Evan Edwards', email: 'evan@example.com', role: 'Student', status: 'Active', date: '2026-03-15' },
];

export default function AdminUsers() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = MOCK_USERS.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout currentIndex={1}>
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            User Management
                        </h1>
                        <p className="text-zinc-400 mt-2">Manage all registered users in the system.</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-64 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 outline-none text-sm focus:bg-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-zinc-500"
                            />
                        </div>
                        <button className="whitespace-nowrap bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-semibold text-sm transition-colors shadow-lg shadow-blue-500/20">
                            Add User
                        </button>
                    </div>
                </header>

                {/* Users Table Card */}
                <div className="rounded-3xl bg-[#0a0a0a]/80 border border-white/10 overflow-hidden backdrop-blur-xl shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4 hidden sm:table-cell">Role</th>
                                    <th className="px-6 py-4 hidden md:table-cell">Joined</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-400 font-bold text-sm border border-blue-500/20">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white/90 group-hover:text-white transition-colors">{user.name}</p>
                                                    <p className="text-xs text-zinc-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <span className="text-sm text-zinc-300">{user.role}</span>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className="text-sm text-zinc-400">{user.date}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${user.status === 'Active'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-blue-400 transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-rose-500/20 rounded-lg text-zinc-400 hover:text-rose-400 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                            No users found matching "{searchTerm}"
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
