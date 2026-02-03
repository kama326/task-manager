import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Bell, Shield, Monitor, X, Camera, Save, Sun, Moon } from 'lucide-react';
import api from '../services/api';

const SettingsPage = () => {
    const { user, updateUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const toggleNotifications = () => setNotificationsEnabled(!notificationsEnabled);

    // Password Change Logic
    const [passwords, setPasswords] = useState({ old_password: '', new_password: '', confirm_password: '' });
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.patch('accounts/password/', {
                old_password: passwords.old_password,
                new_password: passwords.new_password,
                confirm_password: passwords.confirm_password,
            });
            alert('ДОСТУП РАЗРЕШЕН: ПАРОЛЬ ОБНОВЛЕН');
            setIsPasswordModalOpen(false);
            setPasswords({ old_password: '', new_password: '', confirm_password: '' });
        } catch (error: any) {
            console.error('Password change failed', error);
            const errorMessage = error.response?.data ? JSON.stringify(error.response.data) : 'ОШИБКА ПРИ СМЕНЕ ПАРОЛЯ';
            alert(errorMessage);
        }
    };

    // Avatar Upload Logic
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setIsUploading(true);
        try {
            await api.patch('accounts/avatar/', formData);
            await updateUser();
        } catch (error: any) {
            console.error('Failed to upload avatar', error);
            const errorMessage = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            alert(`ОШИБКА: ${errorMessage}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto relative pb-20">
            <div className="mb-8 border-b border-indigo-200 dark:border-primary/20 pb-4">
                <h2
                    className="text-3xl font-orbitron font-bold text-textMain tracking-widest flex items-center gap-3"
                >
                    <Monitor className="text-indigo-600 dark:text-primary" />
                    НАСТРОЙКИ СИСТЕМЫ
                </h2>
                <p
                    className="text-textMuted font-mono text-xs mt-1"
                >
                    Параметры пользователя и уровень допуска
                </p>
            </div>

            <div className="grid gap-8">
                {/* Profile Section */}
                <section className="bg-white dark:bg-surface/30 backdrop-blur-md p-8 border border-slate-200 dark:border-white/5 relative overflow-hidden shadow-sm dark:shadow-none">
                    <div className="absolute top-0 right-0 bg-indigo-500/10 dark:bg-primary/10 w-32 h-32 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>

                    <h3 className="text-lg font-orbitron text-indigo-700 dark:text-primary mb-6 flex items-center gap-2 border-b border-slate-200 dark:border-white/5 pb-2">
                        <User size={18} />
                        ПОЛЬЗОВАТЕЛЬ
                    </h3>

                    <div className="flex items-center gap-8">
                        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />

                            <div className="w-24 h-24 rounded-none clip-path-polygon bg-slate-100 dark:bg-surface border-2 border-indigo-200 dark:border-primary/50 group-hover:border-indigo-500 dark:group-hover:border-primary dark:group-hover:shadow-neon-blue transition-all flex items-center justify-center overflow-hidden relative">
                                {user?.profile?.avatar ? (
                                    <img
                                        src={user.profile.avatar}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-4xl font-orbitron text-indigo-300 dark:text-primary font-bold">{user?.username?.[0]?.toUpperCase() || 'U'}</span>
                                )}

                                <div className="absolute inset-0 bg-black/60 items-center justify-center hidden group-hover:flex">
                                    <Camera size={24} className="text-indigo-100 dark:text-primary animate-pulse" />
                                </div>

                                {isUploading && (
                                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-primary border-t-transparent animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            {/* Decorative Frame */}
                            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-indigo-400 dark:border-primary"></div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-indigo-400 dark:border-primary"></div>
                        </div>

                        <div>
                            <p
                                className="font-orbitron text-2xl text-textMain tracking-widest mb-1"
                            >
                                {user?.username || 'НЕИЗВЕСТНО'}
                            </p>
                            <p className="text-indigo-500/70 dark:text-primary/60 font-mono text-xs tracking-widest mb-4">ДОПУСК: УРОВЕНЬ 1 // ОПЕРАТОР</p>

                            <button onClick={handleAvatarClick} className="text-xs text-textMuted hover:text-textMain border border-slate-300 dark:border-white/20 hover:border-slate-500 dark:hover:border-white/50 px-3 py-1 font-mono hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                                [ ОБНОВИТЬ_ФОТО ]
                            </button>
                        </div>
                    </div>
                </section>

                {/* Interface Section */}
                <section className="bg-white dark:bg-surface/30 backdrop-blur-md p-8 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
                    <h3 className="text-lg font-orbitron text-indigo-700 dark:text-primary mb-6 flex items-center gap-2 border-b border-slate-200 dark:border-white/5 pb-2">
                        <Monitor size={18} />
                        ИНТЕРФЕЙС
                    </h3>
                    <div className="space-y-6">
                        {/* Theme Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-50 dark:bg-primary/5 flex items-center justify-center border border-indigo-200 dark:border-primary/20">
                                    <Sun size={20} className="text-textMain hidden dark:block" />
                                    <Moon size={20} className="text-textMain block dark:hidden" />
                                </div>
                                <div>
                                    <span
                                        className="block text-textMain font-mono text-sm"
                                    >
                                        ТЕМА ОФОРМЛЕНИЯ
                                    </span>
                                    <span
                                        className="text-xs text-textMuted dark:text-primary/40"
                                    >
                                        Переключение светлой/темной темы
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`w-12 h-6 border ${theme === 'dark' ? 'border-indigo-500 dark:border-primary bg-indigo-100 dark:bg-primary/20' : 'border-slate-400 bg-slate-200'} p-1 transition-all relative`}
                            >
                                <div className={`w-3 h-3 bg-current ${theme === 'dark' ? 'text-indigo-600 dark:text-primary translate-x-6' : 'text-slate-600 translate-x-0'} transition-transform dark:shadow-neon-blue`}></div>
                            </button>
                        </div>

                        {/* Notification Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-50 dark:bg-primary/5 flex items-center justify-center border border-indigo-200 dark:border-primary/20">
                                    <Bell size={20} className="text-textMain" />
                                </div>
                                <div>
                                    <span
                                        className="block text-textMain font-mono text-sm"
                                    >
                                        УВЕДОМЛЕНИЯ
                                    </span>
                                    <span
                                        className="text-xs text-textMuted dark:text-primary/40"
                                    >
                                        Оповещения в реальном времени
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={toggleNotifications}
                                className={`w-12 h-6 border ${notificationsEnabled ? 'border-indigo-500 dark:border-primary bg-indigo-100 dark:bg-primary/20' : 'border-slate-300 dark:border-white/20 bg-transparent'} p-1 transition-all relative`}
                            >
                                <div className={`w-3 h-3 bg-current ${notificationsEnabled ? 'text-indigo-600 dark:text-primary translate-x-6' : 'text-slate-400 dark:text-white/20 translate-x-0'} transition-transform dark:shadow-neon-blue`}></div>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Security Section */}
                <section className="bg-white dark:bg-surface/30 backdrop-blur-md p-8 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
                    <h3 className="text-lg font-orbitron text-red-600 dark:text-danger mb-6 flex items-center gap-2 border-b border-slate-200 dark:border-white/5 pb-2">
                        <Shield size={18} />
                        БЕЗОПАСНОСТЬ
                    </h3>
                    <div className="flex items-center justify-between">
                        <span
                            className="text-textMain font-mono text-sm"
                        >
                            КЛЮЧ ДОСТУПА (ПАРОЛЬ)
                        </span>
                        <button
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="text-xs bg-red-50 dark:bg-danger/10 hover:bg-red-100 dark:hover:bg-danger/20 border border-red-200 dark:border-danger/40 hover:border-red-400 dark:hover:border-danger text-red-600 dark:text-danger px-4 py-2 font-mono tracking-widest transition-all dark:hover:shadow-[0_0_10px_rgba(255,0,60,0.3)]"
                        >
                            СБРОСИТЬ_КЛЮЧ
                        </button>
                    </div>
                </section>

                <div
                    className="text-center text-textMuted dark:text-primary/20 text-xs font-mono mt-8"
                >
                    ВЕРСИЯ СИСТЕМЫ 1.0.0 // СБОРКА 2026
                </div>
            </div>

            {/* Password Modal */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-surface w-full max-w-md border border-indigo-200 dark:border-primary/30 p-8 relative shadow-lg dark:shadow-glass">
                        <button
                            onClick={() => setIsPasswordModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 dark:text-primary/40 hover:text-indigo-600 dark:hover:text-primary transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h3
                            className="text-xl font-orbitron font-bold text-slate-800 dark:text-white mb-6 tracking-widest border-b border-indigo-200 dark:border-primary/20 pb-4"
                            style={{ color: 'var(--color-force-black, #000000)' }}
                        >
                            ОБНОВЛЕНИЕ ДАННЫХ
                        </h3>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-indigo-600 dark:text-primary/70 mb-2">ТЕКУЩИЙ КЛЮЧ</label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-50 dark:bg-black/50 border border-slate-300 dark:border-primary/20 p-3 text-slate-900 dark:text-white font-mono focus:border-indigo-500 dark:focus:border-primary focus:outline-none dark:focus:shadow-neon-blue transition-all"
                                    value={passwords.old_password}
                                    onChange={e => setPasswords({ ...passwords, old_password: e.target.value })}
                                    style={{ color: 'var(--color-force-black, #000000)' }}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-indigo-600 dark:text-primary/70 mb-2">НОВЫЙ КЛЮЧ</label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-50 dark:bg-black/50 border border-slate-300 dark:border-primary/20 p-3 text-slate-900 dark:text-white font-mono focus:border-indigo-500 dark:focus:border-primary focus:outline-none dark:focus:shadow-neon-blue transition-all"
                                    value={passwords.new_password}
                                    onChange={e => setPasswords({ ...passwords, new_password: e.target.value })}
                                    style={{ color: 'var(--color-force-black, #000000)' }}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-indigo-600 dark:text-primary/70 mb-2">ПОДТВЕРЖДЕНИЕ</label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-50 dark:bg-black/50 border border-slate-300 dark:border-primary/20 p-3 text-slate-900 dark:text-white font-mono focus:border-indigo-500 dark:focus:border-primary focus:outline-none dark:focus:shadow-neon-blue transition-all"
                                    value={passwords.confirm_password}
                                    onChange={e => setPasswords({ ...passwords, confirm_password: e.target.value })}
                                    style={{ color: 'var(--color-force-black, #000000)' }}
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordModalOpen(false)}
                                    className="px-4 py-2 text-slate-500 dark:text-textMuted hover:text-slate-900 dark:hover:text-white font-mono text-xs hover:bg-slate-100 dark:hover:bg-white/5 transition-colors uppercase"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 bg-indigo-600 dark:bg-primary text-white dark:text-background font-bold px-6 py-2 hover:bg-indigo-700 dark:hover:bg-white transition-colors text-xs uppercase tracking-widest"
                                >
                                    <Save size={14} />
                                    Сохранить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
