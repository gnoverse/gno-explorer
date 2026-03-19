import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/client";
import { Client } from "urql";
import { Globe, Package as PackageIcon, Users } from "lucide-react";

// Query to count deployments
const DEPLOYMENTS_QUERY = `
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
            }
          }
        }
      }
    }
  }
`;

// Query to find unique users
const USERS_QUERY = `
  query GetAllTransactions {
    transactions(filter: {}) {
      messages {
        value {
          ... on BankMsgSend {
            from_address
          }
          ... on MsgCall {
            caller
          }
          ... on MsgAddPackage {
            creator
          }
          ... on MsgRun {
            caller
          }
        }
      }
    }
  }
`;

type NetworkStats = {
  realms: number;
  packages: number;
  uniqueUsers: number;
  error?: boolean;
};

async function fetchStats(client: Client): Promise<NetworkStats> {
  try {
    const [deployRes, usersRes] = await Promise.all([
      client.query(DEPLOYMENTS_QUERY, {}).toPromise(),
      client.query(USERS_QUERY, {}).toPromise()
    ]);

    if (deployRes.error || usersRes.error) {
      console.error("Error fetching stats:", deployRes.error || usersRes.error);
      return { realms: 0, packages: 0, uniqueUsers: 0, error: true };
    }

    let realms = 0;
    let packages = 0;

    const deployTxs = deployRes.data?.transactions || [];
    for (const tx of deployTxs as any[]) {
      for (const msg of tx.messages) {
        const path = msg.value?.package?.path;
        if (path) {
          if (path.startsWith("gno.land/r/")) realms++;
          else if (path.startsWith("gno.land/p/")) packages++;
        }
      }
    }

    const uniqueAddresses = new Set<string>();
    const userTxs = usersRes.data?.transactions || [];
    for (const tx of userTxs as any[]) {
      for (const msg of tx.messages) {
        const val = msg.value;
        if (!val) continue;

        const addr = val.from_address || val.caller || val.creator;
        if (addr) uniqueAddresses.add(addr);
      }
    }

    return { realms, packages, uniqueUsers: uniqueAddresses.size };

  } catch (e) {
    console.error("Exception fetching stats:", e);
    return { realms: 0, packages: 0, uniqueUsers: 0, error: true };
  }
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgLight,
  iconBgDark
}: {
  title: string,
  value: number | string,
  icon: any,
  iconColor: string,
  iconBgLight: string,
  iconBgDark: string
}) {
  return (
    <Card className="relative overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 group hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
      <div className="relative z-10 p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h3>
          <div className={`p-2.5 rounded-xl ${iconBgLight} ${iconBgDark} transition-colors duration-300`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{value}</div>
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live on Testnet
        </div>
      </div>
    </Card>
  )
}

export async function StatsDashboard({ chainDomain }: { chainDomain: string }) {
  const testnetStats = await fetchStats(createClient(chainDomain));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <StatCard
        title="Realms Deployed"
        value={testnetStats.error ? "Err" : testnetStats.realms}
        icon={Globe}
        iconColor="text-indigo-500 dark:text-indigo-400"
        iconBgLight="bg-slate-100 group-hover:bg-slate-200"
        iconBgDark="dark:bg-slate-800 dark:group-hover:bg-slate-700"
      />
      <StatCard
        title="Packages Deployed"
        value={testnetStats.error ? "Err" : testnetStats.packages}
        icon={PackageIcon}
        iconColor="text-cyan-500 dark:text-cyan-400"
        iconBgLight="bg-slate-100 group-hover:bg-slate-200"
        iconBgDark="dark:bg-slate-800 dark:group-hover:bg-slate-700"
      />
      <StatCard
        title="Unique Users"
        value={testnetStats.error ? "Err" : testnetStats.uniqueUsers}
        icon={Users}
        iconColor="text-purple-500 dark:text-purple-400"
        iconBgLight="bg-slate-100 group-hover:bg-slate-200"
        iconBgDark="dark:bg-slate-800 dark:group-hover:bg-slate-700"
      />
    </div>
  );
}
