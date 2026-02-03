import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, LayoutDashboard, Settings, Moon, Sun, Activity } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const Layout = () => {
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex h-screen overflow-hidden selection:bg-primary/30 selection:text-primary bg-background text-slate-900 dark:text-textMain font-sans transition-colors duration-300">
            {/* Sidebar - Minimalist */}
            <aside className="w-20 lg:w-64 bg-surface border-r border-white/5 flex flex-col relative z-20 transition-all duration-300">

                {/* Logo Area */}
                <div className="h-20 flex items-center justify-center border-b border-white/5">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-neon-blue">
                        <div className="w-6 h-6 bg-primary rounded-sm opacity-80" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-8 space-y-2 px-3">
                    <Link
                        to="/"
                        className={`flex items-center space-x-4 px-3 py-3 rounded-lg transition-all duration-300 group relative overflow-hidden ${isActive('/')
                            ? 'text-slate-900 dark:text-white bg-primary/10 shadow-neon-blue border border-primary/20'
                            : 'text-textMuted hover:text-slate-900 dark:hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <LayoutDashboard size={24} strokeWidth={1.5} className={isActive('/') ? 'text-primary drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]' : ''} />
                        <span className={`font-orbitron tracking-wide hidden lg:block ${isActive('/') ? 'text-primary' : ''}`}>ЗАДАЧИ</span>
                        {isActive('/') && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_#00f0ff]"></div>}
                    </Link>

                    <Link
                        to="/settings"
                        className={`flex items-center space-x-4 px-3 py-3 rounded-lg transition-all duration-300 group relative overflow-hidden ${isActive('/settings')
                            ? 'text-slate-900 dark:text-white bg-primary/10 shadow-neon-blue border border-primary/20'
                            : 'text-textMuted hover:text-slate-900 dark:hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Settings size={24} strokeWidth={1.5} className={isActive('/settings') ? 'text-primary drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]' : ''} />
                        <span className={`font-orbitron tracking-wide hidden lg:block ${isActive('/settings') ? 'text-primary' : ''}`}>НАСТРОЙКИ</span>
                        {isActive('/settings') && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_#00f0ff]"></div>}
                    </Link>
                </nav>

                {/* User Area */}
                <div className="p-4 border-t border-white/5 bg-surfaceHover/30 backdrop-blur-sm">
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-white/5 text-textMuted hover:text-textMain transition-colors flex items-center justify-center"
                            title="Сменить тему"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div className="h-px bg-white/10 w-full"></div>

                        <div className="flex items-center gap-3 justify-center lg:justify-start">
                            <div className="w-8 h-8 rounded bg-surface border border-white/10 flex-shrink-0 flex items-center justify-center text-primary font-bold overflow-hidden">
                                {user?.profile?.avatar ? (
                                    <img src={user.profile.avatar} className="w-full h-full object-cover" />
                                ) : (
                                    user?.username?.[0]?.toUpperCase()
                                )}
                            </div>
                            <div className="hidden lg:block overflow-hidden">
                                <p className="text-xs font-bold text-textMain font-orbitron truncate">{user?.username}</p>
                                <p className="text-[10px] text-primary tracking-widest uppercase">ОПЕРАТОР</p>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="flex items-center justify-center space-x-2 py-2 text-danger/80 hover:text-danger hover:bg-danger/10 rounded transition-all mt-2"
                        >
                            <LogOut size={18} />
                            <span className="hidden lg:inline text-xs font-bold tracking-widest">ВЫЙТИ</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden relative bg-background">
                {/* Top Header - Cyberpunk Style */}
                <header className="h-20 border-b border-white/5 bg-surface/50 backdrop-blur-md flex items-center justify-between px-8 relative z-10">
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

                    <div className="flex items-center gap-4">
                        <Activity className="text-primary hidden md:block animate-pulse" />
                        <div>
                            <h1 className="text-2xl font-orbitron font-bold text-slate-900 dark:text-textMain tracking-[0.2em] uppercase dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                УПРАВЛЕНИЕ ЗАДАЧАМИ
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="h-1 w-1 rounded-full bg-primary animate-ping"></div>
                                <p className="text-[10px] text-slate-900 dark:text-primary/60 font-mono tracking-widest uppercase">
                                    Управление операциями и назначениями
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-right hidden md:block">
                        <p className="text-primary/40 font-mono text-xs tracking-widest">
                            {new Date().toLocaleDateString('ru-RU', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}
                        </p>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-8 relative">
                    {/* Background Grid Effect */}
                    <div className="absolute inset-0 pointer-events-none opacity-20"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }}>
                    </div>

                    <div className="max-w-[1600px] mx-auto h-full relative z-1">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
