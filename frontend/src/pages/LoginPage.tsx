import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('token/', { username, password });
            login(response.data.access, response.data.refresh);
            navigate('/');
        } catch (err) {
            setError('ДОСТУП ЗАПРЕЩЕН: НЕВЕРНЫЕ ДАННЫЕ');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-background relative overflow-hidden bg-cyber-grid bg-[length:50px_50px]">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 dark:via-primary/5 to-transparent pointer-events-none"></div>
            <div className="absolute w-96 h-96 bg-indigo-500/10 dark:bg-primary/10 rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>
            <div className="absolute w-96 h-96 bg-purple-500/10 dark:bg-secondary/10 rounded-full blur-3xl -bottom-20 -right-20 animate-pulse delay-1000"></div>

            <div className="max-w-md w-full relative z-10">
                {/* Card Container */}
                <div className="bg-white/60 dark:bg-surface/50 backdrop-blur-xl border border-indigo-200 dark:border-primary/30 p-8 shadow-xl dark:shadow-glass relative group">
                    {/* Decorative Corners */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-indigo-500 dark:border-primary"></div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-indigo-500 dark:border-primary"></div>
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-indigo-500 dark:border-primary"></div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-indigo-500 dark:border-primary"></div>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-orbitron font-bold text-black tracking-widest mb-2">
                            Управление задачами
                        </h2>
                        <p className="text-black font-mono text-xs tracking-[0.3em]">ТЕРМИНАЛ ДОСТУПА</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 mb-6 font-mono text-xs flex items-center gap-2 animate-bounce">
                            <span className="font-bold">ОШИБКА:</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-mono text-black mb-2 uppercase tracking-wider">
                                Идентификатор (Логин)
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 px-4 py-3 text-black font-mono placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none transition-all"
                                placeholder="ВВЕДИТЕ ID..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-black mb-2 uppercase tracking-wider">
                                Ключ доступа (Пароль)
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 px-4 py-3 text-black font-mono placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none transition-all"
                                placeholder="ВВЕДИТЕ КЛЮЧ..."
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-50 hover:bg-indigo-500 text-black hover:text-white border border-indigo-500 font-bold py-3 px-4 transition-all duration-300 uppercase tracking-widest font-mono text-sm shadow-md"
                        >
                            &gt; Вход
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-[10px] text-black font-mono">
                            НЕСАНКЦИОНИРОВАННЫЙ ДОСТУП ПРЕСЛЕДУЕТСЯ ПО ЗАКОНУ
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
