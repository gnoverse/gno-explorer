export async function fetchGenesis() {
  try {
    const res = await fetch('https://rpc.test10.testnets.gno.land/genesis');
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
