'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Filter, Check } from "lucide-react";

const FILTER_OPTIONS = [
    { value: '', label: 'All' },
    { value: 'realm', label: 'Realms' },
    { value: 'package', label: 'Packages' },
] as const;

export function PackageFilter() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const currentFilter = searchParams.get('type') || '';

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleFilter = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set('type', value);
        } else {
            params.delete('type');
        }
        replace(`${pathname}?${params.toString()}`);
        setOpen(false);
    };

    const activeLabel = FILTER_OPTIONS.find(o => o.value === currentFilter)?.label || 'All';

    return (
        <div className="relative" ref={menuRef}>
            <Button
                variant="outline"
                onClick={() => setOpen(!open)}
                className={`border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-700 transition-all shadow-sm h-10 ${currentFilter ? 'border-indigo-400 dark:border-indigo-500/50 text-indigo-600 dark:text-indigo-300' : ''}`}
            >
                <Filter className="w-4 h-4 mr-2" />
                {activeLabel}
            </Button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {FILTER_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleFilter(option.value)}
                            className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors ${
                                currentFilter === option.value
                                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            {option.label}
                            {currentFilter === option.value && (
                                <Check className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
