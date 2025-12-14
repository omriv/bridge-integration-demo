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
    <div className="bg-white rounded border border-gray-200 hover:border-indigo-300 transition-colors p-3">
      <div className="flex items-start justify-between mb-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs flex-1">
          <div>
            <p className="text-gray-500 mb-0.5">ID</p>
            <div className="flex items-center gap-1">
              <p className="font-mono text-gray-900 truncate flex-1">{la.id.substring(0, 12)}...</p>
              <button
                onClick={() => onCopy(la.id, `la-id-${la.id}`)}
                className="p-0.5 text-gray-600 hover:text-indigo-600 flex-shrink-0"
              >
                {copiedField === `la-id-${la.id}` ? (
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <p className="text-gray-500 mb-0.5">Address</p>
            <div className="flex items-center gap-1">
              <p className="font-mono text-gray-900 truncate flex-1">{la.address.substring(0, 12)}...</p>
              <button
                onClick={() => onCopy(la.address, `la-addr-${la.id}`)}
                className="p-0.5 text-gray-600 hover:text-indigo-600 flex-shrink-0"
              >
                {copiedField === `la-addr-${la.id}` ? (
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          <div className='bg-teal-100'>
            <p className="text-gray-500 mb-0.5">Source Chain</p>
            <p className="font-semibold text-gray-900 uppercase">{la.chain}</p>
          </div>

          <div className='bg-amber-100'>
            <p className="text-gray-500 mb-0.5">Destination Rail</p>
            <p className="font-semibold text-gray-900 uppercase">{la.destination_payment_rail}</p>
          </div>

          <div>
            <p className="text-gray-500 mb-0.5">State</p>
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
              la.state === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {la.state.toUpperCase()}
            </span>
          </div>

          <div>
            <p className="text-gray-500 mb-0.5">Created</p>
            <p className="text-gray-900">{new Date(la.created_at).toLocaleDateString()}</p>
          </div>

          <div className='bg-teal-100'>
            <p className="text-gray-500 mb-0.5">Source Currency</p>
            <p className="font-semibold text-gray-900 uppercase">{la.currency}</p>
          </div>

          <div className='bg-amber-100'>
            <p className="text-gray-500 mb-0.5">Destination Currency</p>
            <p className="font-semibold text-gray-900 uppercase">{la.destination_currency}</p>
          </div>

        </div>
        
        {onViewRawJson && (
          <button
            onClick={onViewRawJson}
            className="ml-2 p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="View Raw JSON"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
