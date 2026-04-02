import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AdminLayout } from '../../../components/AdminLayout';
import { Search, MoreVertical, Edit2, Trash2, Loader2, UserPlus } from 'lucide-react';
import { getUsers, UserData } from '@/src/services/user_service';
import { AddUserModal } from '@/src/components/AddUserModal';
import { EditUserModal } from '@/src/components/EditUserModal';
import { DeleteUserModal } from '@/src/components/DeleteUserModal';

interface UserActionsMenuProps {
    user: UserData;
    isOpen: boolean;
    onToggle: () => void;
    onEdit: (user: UserData) => void;
    onDelete: (user: UserData) => void;
}

function UserActionsMenu({ user, isOpen, onToggle, onEdit, onDelete }: UserActionsMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
        if (!isOpen) return;

        const updatePosition = () => {
            if (!buttonRef.current) return;

            const rect = buttonRef.current.getBoundingClientRect();
            setMenuStyle({
                position: 'fixed',
                top: rect.bottom + 8,
                left: Math.max(12, rect.right - 160),
                width: 160,
                zIndex: 9999,
            });
        };

        updatePosition();

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onToggle();
            }
        };

        const handleWindowChange = () => {
            onToggle();
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleWindowChange, true);
        window.addEventListener('resize', handleWindowChange);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleWindowChange, true);
            window.removeEventListener('resize', handleWindowChange);
        };
    }, [isOpen, onToggle]);

    const menu = isOpen ? createPortal(
        <div ref={menuRef} style={menuStyle}>
            <div className="bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                <button
                    type="button"
                    onClick={() => onEdit(user)}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-blue-500/20 text-zinc-300 hover:text-blue-400 transition-colors border-b border-white/5 text-sm"
                >
                    <Edit2 className="w-4 h-4" />
                    Edit User
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(user)}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-rose-500/20 text-zinc-300 hover:text-rose-400 transition-colors text-sm"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete User
                </button>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <div className="relative">
            <button
                type="button"
                onClick={onToggle}
                ref={buttonRef}
                className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {menu}
        </div>
    );
}

export default function AdminUsers() {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // Selection state
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleMenuClick = (userId: number | undefined) => {
        if (!userId) return;
        setOpenMenuId(openMenuId === userId ? null : userId);
    };

    const handleMenuEdit = (user: UserData) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
        setOpenMenuId(null);
    };

    const handleMenuDelete = (user: UserData) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
        setOpenMenuId(null);
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString?: string) => {
        if (!dateString) return '---';
        return new Date(dateString).toLocaleDateString();
    };

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
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="whitespace-nowrap bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-semibold text-sm transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            Add User
                        </button>
                    </div>
                </header>

                {/* Users Table Card */}
                <div className="rounded-3xl bg-[#0a0a0a]/80 border border-white/10 overflow-hidden backdrop-blur-xl shadow-2xl min-h-[400px]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4 hidden sm:table-cell">Role</th>
                                    <th className="px-6 py-4 hidden md:table-cell">Joined</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                                <p className="text-zinc-500 text-sm">Fetching users...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-400 font-bold text-sm border border-blue-500/20 uppercase">
                                                    {user.username.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white/90 group-hover:text-white transition-colors">{user.username}</p>
                                                    <p className="text-xs text-zinc-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <span className="text-sm text-zinc-300 capitalize">{user.role}</span>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className="text-sm text-zinc-400">{formatDate(user.created_at)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <UserActionsMenu
                                                user={user}
                                                isOpen={openMenuId === user.id}
                                                onToggle={() => handleMenuClick(user.id)}
                                                onEdit={handleMenuEdit}
                                                onDelete={handleMenuDelete}
                                            />
                                        </td>
                                    </tr>
                                ))}
                                {!loading && filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                            {searchTerm ? `No users found matching "${searchTerm}"` : 'No users registered yet.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddUserModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onUserAdded={fetchUsers}
            />
            
            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedUser(null);
                }}
                onUserUpdated={fetchUsers}
                user={selectedUser}
            />

            <DeleteUserModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedUser(null);
                }}
                onUserDeleted={fetchUsers}
                user={selectedUser}
            />
        </AdminLayout>
    );
}
