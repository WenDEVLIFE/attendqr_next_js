import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { deleteUser, UserData } from '../services/user_service';

interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserDeleted: () => void;
    user: UserData | null;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ isOpen, onClose, onUserDeleted, user }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!user?.id) return;

        setError(null);
        setLoading(true);

        try {
            await deleteUser(user.id);
            onUserDeleted();
            onClose();
        } catch (err: any) {
            setError(err.message || 'An error occurred while deleting the user.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-zinc-900 border border-rose-500/20 shadow-[0_0_50px_-12px_rgba(244,63,94,0.3)]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent" />

                        <div className="relative p-8 text-center text-white">
                            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-8 h-8 text-rose-500" />
                            </div>

                            <h2 className="text-2xl font-bold mb-2">Delete User?</h2>
                            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                                You are about to permanently delete <span className="text-white font-semibold">{user?.username}</span> and all their associated data. This action cannot be undone.
                            </p>

                            {error && (
                                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 leading-relaxed text-left">
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-5 h-5" />
                                            Confirm Deletion
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={onClose}
                                    disabled={loading}
                                    className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-all border border-white/10"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>

                        {/* Top Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
