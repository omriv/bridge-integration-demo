import type { LiquidationAddress } from '../types';

interface LiquidationAddressCardProps {
  liquidationAddress: LiquidationAddress;
  copiedField: string | null;
  onCopy: (text: string, fieldId: string) => void;
}

export function LiquidationAddressCard({ 
  liquidationAddress, 
  copiedField, 
  onCopy 
}: LiquidationAddressCardProps) {
  const la = liquidationAddress;

  return (
    <div className="bg-white rounded border border-gray-200 hover:border-indigo-300 transition-colors p-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
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

        <div>
          <p className="text-gray-500 mb-0.5">Chain</p>
          <p className="font-semibold text-gray-900 uppercase">{la.chain}</p>
        </div>

        <div>
          <p className="text-gray-500 mb-0.5">Currency</p>
          <p className="font-semibold text-gray-900 uppercase">{la.currency}</p>
        </div>

        <div>
          <p className="text-gray-500 mb-0.5">Dest. Rail</p>
          <p className="font-semibold text-gray-900 uppercase">{la.destination_payment_rail}</p>
        </div>

        <div>
          <p className="text-gray-500 mb-0.5">Dest. Currency</p>
          <p className="font-semibold text-gray-900 uppercase">{la.destination_currency}</p>
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
      </div>
    </div>
  );
}
