export const getChainColor = (chain: string) => {
  const colors: Record<string, string> = {
    ethereum: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    polygon: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
    base: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
    arbitrum: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20',
    optimism: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20',
    solana: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20',
    avalanche: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
    bsc: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20',
  };
  return colors[chain.toLowerCase()] || 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700';
};

export const getCurrencyColor = (currency: string) => {
  const colors: Record<string, string> = {
    usdc: 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300',
    usdt: 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300',
    usdb: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-700 dark:text-indigo-300',
    dai: 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300',
    eth: 'bg-neutral-500/10 border-neutral-500/20 text-neutral-700 dark:text-neutral-300',
    weth: 'bg-neutral-500/10 border-neutral-500/20 text-neutral-700 dark:text-neutral-300',
    btc: 'bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-300',
    wbtc: 'bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-300',
    matic: 'bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300',
    sol: 'bg-violet-500/10 border-violet-500/20 text-violet-700 dark:text-violet-300',
    avax: 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300',
    bnb: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-300',
  };
  return colors[currency.toLowerCase()] || 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300';
};
