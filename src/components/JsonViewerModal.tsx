interface JsonViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: unknown;
}

export function JsonViewerModal({ isOpen, onClose, title, data }: JsonViewerModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-neutral-200 dark:border-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 p-6 text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] bg-neutral-50 dark:bg-black">
          <pre className="text-sm text-green-600 dark:text-green-400 font-mono whitespace-pre-wrap break-words">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900 flex gap-3">
          <button
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(data, null, 2));
            }}
            className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-white px-6 py-3 rounded-lg font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700"
          >
            📋 Copy JSON
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
