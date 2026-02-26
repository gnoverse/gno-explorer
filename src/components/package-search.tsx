'use client';

import { useRef, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function PackageSearch() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    // Cmd+K / Ctrl+K shortcut to focus search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
                inputRef.current?.select();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    return (
        <div className="relative w-full md:w-auto group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
            <Input
                ref={inputRef}
                type="search"
                placeholder="Search packages..."
                className="w-full md:w-[350px] pl-10 pr-12 h-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 text-slate-900 dark:text-slate-200 rounded-xl shadow-sm dark:shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-500"
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get('q')?.toString()}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-1">
                <kbd className="inline-flex h-5 items-center gap-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 px-1.5 font-mono text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </div>
        </div>
    );
}
