import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User as UserIcon, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (user: any) => void;
}

type AuthMode = 'LOGIN' | 'REGISTER';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [mode, setMode] = useState<AuthMode>('LOGIN');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const resetForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (mode === 'REGISTER') {
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match"); // Ideally translatable
                }
                const res = await api.auth.register({ email, password, name, role: 'GIVER', city: 'Casablanca' }); // Default role/city for now
                onSuccess(res.user);
            } else {
                const res = await api.auth.login({ email, password });
                onSuccess(res.user);
            }
            onClose();
            resetForm();
        } catch (err: any) {
            console.error(err);
            setError(err.message || t('auth.error'));
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN');
        resetForm();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-morocco-green/10 p-6 text-center relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-red-500"
                            >
                                <X size={20} />
                            </button>
                            <h2 className="text-2xl font-bold text-morocco-green">
                                {mode === 'LOGIN' ? t('auth.loginTitle') : t('auth.registerTitle')}
                            </h2>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            {mode === 'REGISTER' && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 ml-1">{t('auth.nameLabel')}</label>
                                    <div className="relative">
                                        <UserIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-morocco-green focus:ring-1 focus:ring-morocco-green transition-all"
                                            placeholder={t('auth.nameLabel')}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 ml-1">{t('auth.emailLabel')}</label>
                                <div className="relative">
                                    <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-morocco-green focus:ring-1 focus:ring-morocco-green transition-all"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 ml-1">{t('auth.passwordLabel')}</label>
                                <div className="relative">
                                    <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-morocco-green focus:ring-1 focus:ring-morocco-green transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {mode === 'REGISTER' && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 ml-1">{t('auth.confirmPasswordLabel')}</label>
                                    <div className="relative">
                                        <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-morocco-green focus:ring-1 focus:ring-morocco-green transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-morocco-green text-white font-bold py-4 rounded-xl shadow-lg hover:bg-morocco-green/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : (mode === 'LOGIN' ? t('auth.submitLogin') : t('auth.submitRegister'))}
                            </button>

                            <div className="text-center pt-2">
                                <button
                                    type="button"
                                    onClick={toggleMode}
                                    className="text-sm text-gray-500 hover:text-morocco-green font-medium underline px-2 py-1"
                                >
                                    {mode === 'LOGIN' ? t('auth.switchToRegister') : t('auth.switchToLogin')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
