import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

interface User {
    username: string;
    profile?: {
        avatar: string | null;
    };
}

interface AuthContextType {
    user: User | null;
    login: (access: string, refresh: string) => Promise<void>;
    logout: () => void;
    updateUser: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const res = await api.get<User>('accounts/me/');
            setUser(res.data);
        } catch (error) {
            console.error('Failed to fetch user', error);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                await fetchUser();
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (access: string, refresh: string) => {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        await fetchUser();
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    const updateUser = async () => {
        await fetchUser();
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
