'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Link } from "lucide-react";
import { DEFAULT_CHAIN_DOMAIN } from '@/lib/client';
import { useState, useCallback } from 'react';

export function ChainSelector() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const current = searchParams.get('chain') || DEFAULT_CHAIN_DOMAIN;
    const [value, setValue] = useState(current);

    const submit = useCallback((val: string) => {
        const domain = val.trim() || DEFAULT_CHAIN_DOMAIN;
        const params = new URLSearchParams(searchParams);
        if (domain !== DEFAULT_CHAIN_DOMAIN) {
            params.set('chain', domain);
        } else {
            params.delete('chain');
        }
        replace(`${pathname}?${params.toString()}`);
    }, [searchParams, pathname, replace]);

    return (
        <form
            className="relative group"
            onSubmit={(e) => { e.preventDefault(); submit(value); }}
        >
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
            <Input
                type="text"
                placeholder={DEFAULT_CHAIN_DOMAIN}
                className="w-[220px] pl-9 pr-3 h-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 text-slate-900 dark:text-slate-200 rounded-xl shadow-sm dark:shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-mono"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={() => submit(value)}
            />
        </form>
    );
}
