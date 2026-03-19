import { ErrorDisplay } from "@/components/error-display";
import { createClient, DEFAULT_CHAIN_DOMAIN } from '@/lib/client';
import { PackageSearch } from "@/components/package-search";
import { PackageFilter } from "@/components/package-filter";
import { ChainSelector } from "@/components/chain-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { StatsDashboard } from "@/components/stats-dashboard";
import { PackageList } from "@/components/package-list";
import fs from 'fs/promises';
import path from 'path';

// Query to fetch add_package transactions
const PACKAGES_QUERY = `
  query GetDeployments {
    transactions(filter: {
      message: {
        type_url: add_package
      }
    }) {
      messages {
        value {
          ... on MsgAddPackage {
            package {
              path
              name
              files {
                name
              }
            }
          }
        }
      }
    }
  }
`;

type Package = {
  path: string;
  name: string;
  files: { name: string }[];
};

export default async function Home(props: {
  searchParams?: Promise<{ q?: string; type?: string; chain?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q?.toLowerCase() || "";
  const typeFilter = searchParams?.type || "";
  const chainDomain = searchParams?.chain || DEFAULT_CHAIN_DOMAIN;

  const client = createClient(chainDomain);

  // Fetch data on the server, bypassing all caches for latest packages
  const result = await client.query(PACKAGES_QUERY, {}, {
    requestPolicy: 'network-only',
    fetchOptions: { cache: 'no-store' }
  }).toPromise();

  // Load extracted genesis packages
  let genesisPackages: Package[] = [];
  try {
    const pkgPath = path.join(process.cwd(), 'src', 'lib', 'rpc', 'genesis_packages.json');
    const pkgText = await fs.readFile(pkgPath, 'utf-8');
    genesisPackages = JSON.parse(pkgText);
  } catch (e) {
    console.error("Failed to read extracted packages", e);
  }

  if (result.error) {
    return <ErrorDisplay message={result.error.message} />;
  }

  // Extract packages from transactions
  const allPackages: Package[] = [...genesisPackages];
  const transactions = result.data?.transactions || [];

  for (const tx of transactions as any[]) {
    for (const msg of tx.messages) {
      if (msg.value && msg.value.package) {
        allPackages.push(msg.value.package);
      }
    }
  }

  // Filter packages based on search query and type
  const packages = allPackages.filter((pkg) => {
    const matchesQuery = pkg.path.toLowerCase().includes(query) ||
      pkg.name.toLowerCase().includes(query);
    const isRealm = pkg.path.startsWith('gno.land/r/');
    const matchesType = !typeFilter ||
      (typeFilter === 'realm' && isRealm) ||
      (typeFilter === 'package' && !isRealm);
    return matchesQuery && matchesType;
  });

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative selection:bg-indigo-500/30 transition-colors duration-300">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full opacity-10 dark:opacity-20 bg-indigo-600 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[40%] rounded-full opacity-5 dark:opacity-10 bg-cyan-500 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] rounded-full opacity-5 dark:opacity-10 bg-purple-600 blur-[120px]" />
        <div className="hidden dark:block absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] mask-[linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8 p-6 md:p-8">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-200 dark:border-slate-800/50 pb-8 pt-4">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-4 shadow-sm dark:shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Testnet Explorer
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 pb-1">
              Gno.land Packages
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg max-w-xl mx-auto md:mx-0">
              Discover, search, and explore packages and realms on the Gno.land blockchain.
            </p>
          </div>

          <div className="flex w-full md:w-auto items-center space-x-3">
            <ChainSelector />
            <PackageSearch />
            <PackageFilter />
            <ThemeToggle />
          </div>
        </header>

        <StatsDashboard chainDomain={chainDomain} />

        <div className="relative pt-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 tracking-tight">
              All Packages
            </h2>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium bg-white/50 dark:bg-slate-900/50 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-inner">
              {packages.length} results
            </div>
          </div>
          <PackageList packages={packages} />
        </div>
      </div>
    </main>
  );
}
