'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
    const [dark, setDark] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem('theme');
        const isDark = stored ? stored === 'dark' : true;
        setDark(isDark);
        document.documentElement.classList.toggle('dark', isDark);
    }, []);

    const toggle = () => {
        const next = !dark;
        setDark(next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', next);
    };

    if (!mounted) return <div className="w-9 h-9" />;

    return (
        <button
            onClick={toggle}
            className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all shadow-sm"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
    );
}
