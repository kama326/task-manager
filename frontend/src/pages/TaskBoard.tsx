import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Plus, MoreVertical, Clock, Trash2, ArrowRight, ArrowLeft, CheckCircle, Activity, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface Task {
    id: number;
    title: string;
    description: string;
    status: 'new' | 'in_progress' | 'done';
    priority: 'low' | 'medium' | 'high';
    created_at: string;
    due_date: string | null;
    assigned_to_username: string | null;
}

const statusMap = {
    new: 'К ВЫПОЛНЕНИЮ',
    in_progress: 'В РАБОТЕ',
    done: 'ГОТОВО',
};

const DropdownMenu = ({
    trigger,
    children
}: {
    trigger: React.ReactNode;
    children: React.ReactNode
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);

    // Calculate position on open
    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // Default to bottom-right alignment relative to trigger
            setCoords({
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX
            });
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                // If clicking outside trigger, check if clicking inside the portal content (handled separately or by simple close)
                // Actually, since portal is elsewhere, we need a way to detect clicks inside it.
                // Simplified: Close on any click outside the trigger, UNLESS it's on the menu.
                // We'll attach a ref to the menu content too.
                const menuEl = document.getElementById('dropdown-portal-content');
                if (menuEl && menuEl.contains(event.target as Node)) return;

                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div className="relative inline-block" ref={triggerRef}>
            <div onClick={toggleOpen} className="cursor-pointer">{trigger}</div>
            {isOpen && ReactDOM.createPortal(
                <div
                    id="dropdown-portal-content"
                    className="absolute z-[9999] bg-white dark:bg-surface border border-slate-200 dark:border-primary/30 backdrop-blur-xl rounded-none shadow-lg dark:shadow-glass overflow-hidden text-sm w-56 animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: coords.top, left: coords.left }}
                >
                    {children}
                </div>,
                document.body
            )}
        </div>
    );
};

const DropdownItem = ({
    onClick,
    children,
    className
}: {
    onClick: () => void;
    children: React.ReactNode;
    className?: string
}) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-primary/10 transition-colors flex items-center gap-2 border-l-2 border-transparent hover:border-indigo-500 dark:hover:border-primary",
            "text-textMain font-mono text-xs tracking-wider",
            className
        )}
    >
        {children}
    </button>
);

const TaskBoard = () => {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const { data: tasks, isLoading } = useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const res = await api.get<Task[]>('tasks/');
            return res.data;
        },
    });

    const createTaskMutation = useMutation({
        mutationFn: (title: string) => api.post('tasks/', { title, status: 'new' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setNewTaskTitle('');
            setIsFormOpen(false);
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            api.patch(`tasks/${id}/`, { status }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
    });

    const deleteTaskMutation = useMutation({
        mutationFn: (id: number) => api.delete(`tasks/${id}/`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
    });

    const bulkMoveMutation = useMutation({
        mutationFn: ({ from, to }: { from: string; to: string }) =>
            api.post('tasks/bulk_move/', { from_status: from, to_status: to }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
    });

    const bulkDeleteMutation = useMutation({
        mutationFn: (status: string) =>
            api.post('tasks/bulk_delete/', { status }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
    });

    if (isLoading) return <div className="text-textMain dark:text-primary font-mono text-center mt-20 text-lg animate-pulse">ЗАГРУЗКА ДАННЫХ СИСТЕМЫ...</div>;

    const columns = ['new', 'in_progress', 'done'] as const;

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskTitle) createTaskMutation.mutate(newTaskTitle);
    };

    const handleDragStart = (e: React.DragEvent, taskId: number) => {
        e.dataTransfer.setData('taskId', taskId.toString());
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, status: string) => {
        e.preventDefault();
        const taskId = parseInt(e.dataTransfer.getData('taskId'));
        if (taskId) {
            updateStatusMutation.mutate({ id: taskId, status });
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Page Header (Action Area) - Now simplified since Title is in Top Bar */}
            <div className="flex justify-end items-center mb-8">
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="group relative px-6 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 dark:bg-primary/10 dark:hover:bg-primary/20 text-indigo-700 dark:text-primary border border-indigo-600/50 dark:border-primary/50 overflow-hidden transition-all clip-path-polygon"
                >
                    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-primary/30 to-transparent transition-transform duration-1000"></div>
                    <div className="flex items-center space-x-2 font-orbitron font-bold text-xs tracking-widest uppercase">
                        <Plus size={16} />
                        <span>СОЗДАТЬ ЗАДАЧУ</span>
                    </div>
                </button>
            </div>

            {isFormOpen && (
                <div className="mb-8 relative animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="absolute inset-0 bg-primary/5 blur-xl"></div>
                    <form onSubmit={handleCreate} className="relative bg-white dark:bg-surface/80 p-1 border border-primary/50 shadow-neon-blue backdrop-blur-md">
                        <div className="bg-slate-50 dark:bg-background/50 p-6 relative overflow-hidden">
                            {/* Decorative corner accents */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary"></div>
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary"></div>
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary"></div>
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary"></div>

                            <div className="flex items-center gap-2 mb-4 text-indigo-700 dark:text-primary font-mono text-xs">
                                <Zap size={14} className="animate-pulse" /> НОВАЯ КОМАНДА
                            </div>
                            <input
                                value={newTaskTitle}
                                onChange={e => setNewTaskTitle(e.target.value)}
                                placeholder="Введите название задачи..."
                                className="w-full bg-white dark:bg-background/50 border-b border-slate-300 dark:border-white/10 p-3 text-textMain placeholder:text-textMuted focus:border-primary focus:outline-none transition-all"
                                autoFocus
                            />
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-textMuted hover:text-textMain font-mono text-xs hover:bg-slate-200 dark:hover:bg-white/5 transition-colors uppercase">
                                    [ESC] ОТМЕНА
                                </button>
                                <button type="submit" className="bg-indigo-600 dark:bg-primary hover:bg-indigo-700 dark:hover:bg-white text-white dark:text-black font-bold px-6 py-2 transition-colors text-xs uppercase tracking-widest clip-path-polygon">
                                    ВЫПОЛНИТЬ
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-hidden">
                {columns.map((status) => (
                    <div
                        key={status}
                        className="flex flex-col h-full mx-2"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, status)}
                    >
                        {/* High-Tech Column Header */}
                        <div className="flex items-stretch mb-4 group/col">
                            <div className={cn(
                                "w-1 mr-3 transition-all duration-300",
                                status === 'new' ? "bg-accent shadow-[0_0_10px_#f59e0b]" :
                                    status === 'in_progress' ? "bg-primary shadow-[0_0_10px_#00f0ff]" :
                                        "bg-secondary shadow-[0_0_10px_#7000ff]"
                            )}></div>

                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-orbitron text-sm font-bold text-slate-900 dark:text-textMain tracking-widest uppercase">
                                        {statusMap[status]}
                                    </h3>
                                    <DropdownMenu
                                        trigger={
                                            <button className="text-textMuted hover:text-textMain transition-colors">
                                                <MoreVertical size={16} />
                                            </button>
                                        }
                                    >
                                        <div className="py-1 bg-white dark:bg-surface border border-slate-200 dark:border-white/10">
                                            {status === 'new' && (
                                                <DropdownItem onClick={() => bulkMoveMutation.mutate({ from: 'new', to: 'in_progress' })}>
                                                    <ArrowRight size={14} /> ВСЕ <ArrowRight size={10} className="inline mx-1" /> В РАБОТЕ
                                                </DropdownItem>
                                            )}
                                            {status === 'in_progress' && (
                                                <>
                                                    <DropdownItem onClick={() => bulkMoveMutation.mutate({ from: 'in_progress', to: 'done' })}>
                                                        <CheckCircle size={14} /> ВСЕ <ArrowRight size={10} className="inline mx-1" /> ГОТОВО
                                                    </DropdownItem>
                                                    <DropdownItem onClick={() => bulkMoveMutation.mutate({ from: 'in_progress', to: 'new' })}>
                                                        <ArrowLeft size={14} /> ВЕРНУТЬ ВСЕ В НОВЫЕ
                                                    </DropdownItem>
                                                </>
                                            )}
                                            {status === 'done' && (
                                                <DropdownItem onClick={() => bulkMoveMutation.mutate({ from: 'done', to: 'new' })}>
                                                    <ArrowLeft size={14} /> ВЕРНУТЬ ВСЕ В НОВЫЕ
                                                </DropdownItem>
                                            )}
                                            <div className="h-px bg-slate-200 dark:bg-white/10 my-1"></div>
                                            <DropdownItem
                                                onClick={() => {
                                                    if (window.confirm('ВНИМАНИЕ: УДАЛИТЬ ВСЕ ЗАДАЧИ В ЭТОМ СЕКТОРЕ?')) {
                                                        bulkDeleteMutation.mutate(status);
                                                    }
                                                }}
                                                className="text-danger hover:text-danger hover:bg-danger/10"
                                            >
                                                <Trash2 size={14} /> ОЧИСТИТЬ СЕКТОР
                                            </DropdownItem>
                                        </div>
                                    </DropdownMenu>
                                </div>
                                <p className="text-[10px] text-textMuted font-mono mt-1">
                                     // {tasks?.filter((t) => t.status === status).length} ЗАДАЧ
                                </p>
                            </div>
                        </div>

                        {/* Tasks Container with Scroll */}
                        <div className="flex-1 space-y-3 overflow-y-auto pr-2 pb-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {tasks?.filter((t) => t.status === status).map((task) => (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                    className={cn(
                                        "bg-white/80 dark:bg-slate-900 backdrop-blur-md p-0 border-l-2 transition-all duration-300 relative group/card cursor-move hover:translate-x-1 hover:shadow-lg border border-slate-200 dark:border-white/5",
                                        status === 'new' ? "border-l-accent hover:border-l-accent hover:shadow-[0_0_15px_rgba(245,158,11,0.1)]" :
                                            status === 'in_progress' ? "border-l-primary hover:border-l-primary hover:shadow-[0_0_15px_rgba(0,240,255,0.1)]" :
                                                "border-l-secondary hover:border-l-secondary hover:shadow-[0_0_15px_rgba(112,0,255,0.1)] opacity-80 hover:opacity-100"
                                    )}
                                >
                                    {/* Glass Effect Overlay */}
                                    <div className="absolute inset-0 bg-white/0 group-hover/card:bg-indigo-50/50 dark:group-hover/card:bg-white/5 transition-colors pointer-events-none"></div>

                                    {/* Card Content */}
                                    <div className="p-4 relative z-10">

                                        <div className="flex justify-between items-start mb-2">
                                            <span className={cn(
                                                "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm border",
                                                task.priority === 'high' ? "text-red-700 dark:text-danger border-red-200 dark:border-danger/30 bg-red-50 dark:bg-danger/10" :
                                                    task.priority === 'medium' ? "text-amber-700 dark:text-accent border-amber-200 dark:border-accent/30 bg-amber-50 dark:bg-accent/10" :
                                                        "text-emerald-700 dark:text-green-400 border-emerald-200 dark:border-green-400/30 bg-emerald-50 dark:bg-green-400/10"
                                            )}>
                                                {task.priority === 'low' ? 'НИЗКИЙ' : task.priority === 'medium' ? 'СРЕДНИЙ' : 'ВЫСОКИЙ'}
                                            </span>

                                            <DropdownMenu
                                                trigger={
                                                    <button className="text-textMuted hover:text-textMain p-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                                        <MoreVertical size={14} />
                                                    </button>
                                                }
                                            >
                                                <div className="py-1 bg-white dark:bg-surface border border-slate-200 dark:border-white/10">
                                                    {status !== 'new' && (
                                                        <DropdownItem onClick={() => updateStatusMutation.mutate({ id: task.id, status: 'new' })}>
                                                            <ArrowLeft size={14} /> ВЕРНУТЬ В НОВЫЕ
                                                        </DropdownItem>
                                                    )}
                                                    {status !== 'in_progress' && (
                                                        <DropdownItem onClick={() => updateStatusMutation.mutate({ id: task.id, status: 'in_progress' })}>
                                                            {status === 'new' ? <ArrowRight size={14} /> : <ArrowLeft size={14} />} НАЧАТЬ РАБОТУ
                                                        </DropdownItem>
                                                    )}
                                                    {status !== 'done' && (
                                                        <DropdownItem onClick={() => updateStatusMutation.mutate({ id: task.id, status: 'done' })}>
                                                            <CheckCircle size={14} /> ЗАВЕРШИТЬ
                                                        </DropdownItem>
                                                    )}
                                                    <div className="h-px bg-slate-200 dark:bg-white/10 my-1"></div>
                                                    <DropdownItem
                                                        onClick={() => deleteTaskMutation.mutate(task.id)}
                                                        className="text-danger hover:text-danger hover:bg-danger/10"
                                                    >
                                                        <Trash2 size={14} /> УНИЧТОЖИТЬ
                                                    </DropdownItem>
                                                </div>
                                            </DropdownMenu>
                                        </div>

                                        <div className="font-mono text-[10px] text-indigo-900 dark:text-primary/70 mb-1 tracking-widest font-bold">
                                            ID: TASK-{task.id.toString().padStart(4, '0')}
                                        </div>

                                        <h4 className="font-bold text-red-600 dark:text-red-500 mb-4 leading-snug tracking-wide text-sm">
                                            {task.title}
                                        </h4>

                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-sm bg-indigo-100 dark:bg-primary/20 flex items-center justify-center text-indigo-700 dark:text-primary font-bold text-[10px]">
                                                    {task.assigned_to_username?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                {task.due_date && (
                                                    <span className="flex items-center text-amber-600 dark:text-accent text-[10px] font-mono">
                                                        <Clock size={10} className="mr-1" />
                                                        {new Date(task.due_date).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                            {status === 'in_progress' && <Activity size={12} className="text-secondary animate-pulse" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {tasks?.filter((t) => t.status === status).length === 0 && (
                                <div className="h-24 border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center text-textMuted font-mono text-xs animate-pulse">
                                    [ НЕТ ЗАДАЧ ]
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskBoard;
