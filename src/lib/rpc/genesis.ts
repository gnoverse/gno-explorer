import { DEFAULT_CHAIN_DOMAIN } from '@/lib/client';

export async function fetchGenesis(chainDomain: string = DEFAULT_CHAIN_DOMAIN) {
  try {
    const res = await fetch(`https://rpc.${chainDomain}/genesis`);
    if (!res.ok) {
      throw new Error(`Failed to fetch genesis: ${res.statusText}`);
    }
    const data = await res.json();
    return data.result.genesis;
  } catch (error) {
    console.error('Error fetching genesis:', error);
    return null;
  }
}
