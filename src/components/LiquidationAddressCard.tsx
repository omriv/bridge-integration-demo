import type { LiquidationAddress } from '../types';

interface LiquidationAddressCardProps {
  liquidationAddress: LiquidationAddress;
  copiedField: string | null;
  onCopy: (text: string, fieldId: string) => void;
  onViewRawJson?: () => void;
}

export function LiquidationAddressCard({ 
  liquidationAddress, 
  copiedField, 
  onCopy,
  onViewRawJson
}: LiquidationAddressCardProps) {
  const la = liquidationAddress;

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs flex-1">
          <div>
            <p className="text-slate-500 mb-1 font-medium">ID</p>
            <div className="flex items-center gap-1 bg-slate-900/50 rounded px-2 py-1 border border-slate-700/50">
              <p className="font-mono text-slate-300 truncate flex-1">{la.id.substring(0, 12)}...</p>
              <button
                onClick={() => onCopy(la.id, `la-id-${la.id}`)}
                className="p-0.5 text-slate-500 hover:text-blue-400 flex-shrink-0 transition-colors"
              >
                {copiedField === `la-id-${la.id}` ? (
                  <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <p className="text-slate-500 mb-1 font-medium">Address</p>
            <div className="flex items-center gap-1 bg-slate-900/50 rounded px-2 py-1 border border-slate-700/50">
              <p className="font-mono text-slate-300 truncate flex-1">{la.address.substring(0, 12)}...</p>
              <button
                onClick={() => onCopy(la.address, `la-addr-${la.id}`)}
                className="p-0.5 text-slate-500 hover:text-blue-400 flex-shrink-0 transition-colors"
              >
                {copiedField === `la-addr-${la.id}` ? (
                  <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className='bg-teal-500/10 border border-teal-500/20 rounded p-2'>
            <p className="text-teal-500/70 mb-0.5 font-medium">Source Chain</p>
            <p className="font-bold text-teal-200 uppercase">{la.chain}</p>
          </div>

          <div className='bg-amber-500/10 border border-amber-500/20 rounded p-2'>
            <p className="text-amber-500/70 mb-0.5 font-medium">Destination Rail</p>
            <p className="font-bold text-amber-200 uppercase">{la.destination_payment_rail}</p>
          </div>

          <div className="p-2">
            <p className="text-slate-500 mb-1 font-medium">State</p>
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${
              la.state === 'active' 
                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                : 'bg-slate-700 text-slate-300 border-slate-600'
            }`}>
              {la.state.toUpperCase()}
            </span>
          </div>

          <div className="p-2">
            <p className="text-slate-500 mb-1 font-medium">Created</p>
            <p className="text-slate-300 font-medium">{new Date(la.created_at).toLocaleDateString()}</p>
          </div>

          <div className='bg-teal-500/10 border border-teal-500/20 rounded p-2'>
            <p className="text-teal-500/70 mb-0.5 font-medium">Source Currency</p>
            <p className="font-bold text-teal-200 uppercase">{la.currency}</p>
          </div>

          <div className='bg-amber-500/10 border border-amber-500/20 rounded p-2'>
            <p className="text-amber-500/70 mb-0.5 font-medium">Destination Currency</p>
            <p className="font-bold text-amber-200 uppercase">{la.destination_currency}</p>
          </div>

        </div>
        
        {onViewRawJson && (
          <button
            onClick={onViewRawJson}
            className="ml-2 p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
            title="View Raw JSON"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
