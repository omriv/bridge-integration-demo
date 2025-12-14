import { getChainColor } from '../utils/colorUtils';

interface ChainBadgeProps {
  chain: string;
  className?: string;
}

export function ChainBadge({ chain, className = '' }: ChainBadgeProps) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getChainColor(chain)} ${className}`}>
      {chain.toUpperCase()}
    </span>
  );
}
