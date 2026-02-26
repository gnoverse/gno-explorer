'use client';

import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
    message: string;
}

export function ErrorDisplay({ message }: ErrorDisplayProps) {
    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-8 flex items-center justify-center">
            <div className="text-center space-y-4 max-w-lg">
                <h2 className="text-2xl font-bold text-red-500 dark:text-red-400">Error Fetching Packages</h2>
                <p className="text-slate-500 dark:text-slate-400">
                    Could not connect to the Gno.land indexer. Please try again later.
                </p>
                <pre className="bg-white dark:bg-slate-900 p-4 rounded text-xs text-left overflow-auto text-red-600 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                    {message}
                </pre>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                    Retry
                </Button>
            </div>
        </main>
    );
}
