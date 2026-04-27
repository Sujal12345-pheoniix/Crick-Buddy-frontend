'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI } from '@/lib/api';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'player' | 'coach' | 'admin';
    playerType: string;
    experienceLevel: string;
    battingStyle: string;
    bowlingStyle: string;
    overallScore: number;
    totalReports: number;
    totalUploads: number;
    avatar: string | null;
    phone: string | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<User>;
    register: (data: object) => Promise<void>;
    logout: () => void;
    updateUser: (u: User) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('crick_token');
        const storedUser = localStorage.getItem('crick_user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<User> => {
        const res = await authAPI.login({ email, password });
        const { token: t, user: u } = res.data;
        localStorage.setItem('crick_token', t);
        localStorage.setItem('crick_user', JSON.stringify(u));
        setToken(t);
        setUser(u);
        return u;
    };
    
    const register = async (data: object) => {
        const res = await authAPI.register(data);
        const { token: t, user: u } = res.data;
        localStorage.setItem('crick_token', t);
        localStorage.setItem('crick_user', JSON.stringify(u));
        setToken(t);
        setUser(u);
    };

    const logout = () => {
        localStorage.removeItem('crick_token');
        localStorage.removeItem('crick_user');
        setToken(null);
        setUser(null);
        window.location.href = '/login';
    };

    const updateUser = (u: User) => {
        setUser(u);
        localStorage.setItem('crick_user', JSON.stringify(u));
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
