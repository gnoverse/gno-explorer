import { Client, cacheExchange, fetchExchange } from 'urql';

export const testnetClient = new Client({
  url: 'https://indexer.test11.testnets.gno.land/graphql/query',
  exchanges: [cacheExchange, fetchExchange],
});

// Default to testnet for existing comparisons if not specified
export const client = testnetClient;