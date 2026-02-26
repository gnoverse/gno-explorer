"use client";

import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { FolderCode, Copy, Check, FileCode2, ExternalLink, Package, Globe } from "lucide-react";

type PackageFile = { name: string };

type PackageType = {
    path: string;
    name: string;
    files: PackageFile[];
};

interface PackageListProps {
    packages: PackageType[];
}

const ITEMS_PER_PAGE = 24;

function PackageCard({ pkg, onSelect }: { pkg: PackageType; onSelect: () => void }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(pkg.path);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card
            className="relative overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 hover:shadow-xl group hover:-translate-y-1 cursor-pointer"
            onClick={onSelect}
        >
            <CardHeader className="pb-3 relative z-10 flex flex-row items-center gap-3 space-y-0">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <FolderCode className="w-5 h-5 shrink-0" />
                </div>
                <div className="flex-1 min-w-0 pr-8">
                    <CardTitle
                        className="font-mono text-base md:text-lg text-indigo-600 dark:text-indigo-300 group-hover:text-indigo-500 dark:group-hover:text-indigo-200 truncate"
                        title={pkg.path}
                    >
                        {pkg.path}
                    </CardTitle>
                </div>
                <button
                    onClick={handleCopy}
                    className="absolute right-4 md:right-6 top-5 p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-20"
                    title="Copy path"
                >
                    {copied ? <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-5 h-10 overflow-hidden line-clamp-2">
                    <span className="font-semibold text-slate-400 dark:text-slate-500">Name:</span>{" "}
                    {pkg.name || <span className="italic opacity-50">Unnamed Package</span>}
                </div>
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50 text-xs font-medium">
                        <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
                        {pkg.files?.length || 0} files
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-600 font-mono tracking-wider uppercase">
                        {pkg.path.startsWith('gno.land/r/') ? 'Realm' : 'Package'}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function PackageDetailModal({ pkg, open, onClose }: { pkg: PackageType | null; open: boolean; onClose: () => void }) {
    const [copied, setCopied] = useState(false);

    if (!pkg) return null;

    const isRealm = pkg.path.startsWith("gno.land/r/");
    const pathSegments = pkg.path.split("/");
    const displayName = pkg.name || pathSegments[pathSegments.length - 1];

    const handleCopyPath = () => {
        navigator.clipboard.writeText(pkg.path);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getFileIcon = (fileName: string) => {
        if (fileName.endsWith("_test.gno")) return "text-amber-500 dark:text-amber-400";
        if (fileName.endsWith(".gno")) return "text-emerald-500 dark:text-emerald-400";
        if (fileName.endsWith(".md")) return "text-blue-500 dark:text-blue-400";
        return "text-slate-400";
    };

    const getFileLabel = (fileName: string) => {
        if (fileName.endsWith("_test.gno")) return "Test";
        if (fileName.endsWith(".gno")) return "Source";
        if (fileName.endsWith(".md")) return "Doc";
        return "File";
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-1">
                        <div className={`p-2.5 rounded-xl ${isRealm ? "bg-purple-500/15 text-purple-600 dark:text-purple-400" : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"}`}>
                            {isRealm ? <Globe className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                {displayName}
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                {isRealm ? "Realm" : "Package"} on Gno.land
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="mt-2 space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                        <div className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-2">Full Path</div>
                        <div className="flex items-center justify-between gap-2">
                            <code className="text-sm font-mono text-indigo-600 dark:text-indigo-300 break-all">{pkg.path}</code>
                            <button
                                onClick={handleCopyPath}
                                className="shrink-0 p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Copy path"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                            <div className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-1">Type</div>
                            <div className={`text-sm font-semibold ${isRealm ? "text-purple-600 dark:text-purple-400" : "text-indigo-600 dark:text-indigo-400"}`}>
                                {isRealm ? "Realm" : "Package"}
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                            <div className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-1">Files</div>
                            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {pkg.files?.length || 0} files
                            </div>
                        </div>
                    </div>

                    {pkg.files && pkg.files.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                            <div className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-3">Files</div>
                            <div className="space-y-1.5 max-h-60 overflow-y-auto">
                                {pkg.files.map((file, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between py-1.5 px-3 rounded-md bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileCode2 className={`w-4 h-4 ${getFileIcon(file.name)}`} />
                                            <span className="font-mono text-sm text-slate-700 dark:text-slate-300">{file.name}</span>
                                        </div>
                                        <span className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full border ${
                                            file.name.endsWith("_test.gno")
                                                ? "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20"
                                                : file.name.endsWith(".gno")
                                                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                                : file.name.endsWith(".md")
                                                ? "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20"
                                                : "text-slate-500 dark:text-slate-400 bg-slate-500/10 border-slate-500/20"
                                        }`}>
                                            {getFileLabel(file.name)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <a
                        href={`https://${pkg.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                        View on Gno.land
                    </a>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function PackageList({ packages }: PackageListProps) {
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
    const { ref, inView } = useInView({
        threshold: 0,
        rootMargin: "200px",
    });

    useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
    }, [packages]);

    useEffect(() => {
        if (inView && visibleCount < packages.length) {
            setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, packages.length));
        }
    }, [inView, packages.length, visibleCount]);

    const visiblePackages = packages.slice(0, visibleCount);

    return (
        <>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visiblePackages.map((pkg) => (
                    <PackageCard
                        key={pkg.path}
                        pkg={pkg}
                        onSelect={() => setSelectedPackage(pkg)}
                    />
                ))}

                {visibleCount < packages.length && (
                    <div ref={ref} className="col-span-full h-20 flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    </div>
                )}

                {packages.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-32 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <FolderCode className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
                        <h3 className="text-xl font-medium text-slate-600 dark:text-slate-300 mb-2">No packages found</h3>
                        <p className="text-sm">Try adjusting your search query.</p>
                    </div>
                )}
            </section>

            <PackageDetailModal
                pkg={selectedPackage}
                open={!!selectedPackage}
                onClose={() => setSelectedPackage(null)}
            />
        </>
    );
}
