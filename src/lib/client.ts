import { Client, cacheExchange, fetchExchange } from 'urql';

export const DEFAULT_CHAIN_DOMAIN = 'test12.testnets.gno.land';

export function createClient(chainDomain: string = DEFAULT_CHAIN_DOMAIN) {
  return new Client({
    url: `https://indexer.${chainDomain}/graphql/query`,
    exchanges: [cacheExchange, fetchExchange],
  });
}
