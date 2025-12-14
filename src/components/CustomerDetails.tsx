import type { Customer } from '../types';
import { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';

interface CustomerDetailsProps {
  customer: Customer;
}

interface RequirementListPopoverProps {
  items: string[];
  colorClass: string;
  onClose: () => void;
  onCopy: (text: string, fieldName: string) => void;
}

function RequirementListPopover({ items, colorClass, onClose, onCopy }: RequirementListPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (items.length === 0) {
    return (
      <div ref={popoverRef} className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 p-1.5 text-[10px] text-neutral-400 italic">
        No items
      </div>
    );
  }

  return (
    <div ref={popoverRef} className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 p-1 max-h-60 overflow-y-auto">
      <div className="flex justify-between items-center mb-0.5 pb-0.5 pl-2 border-b border-neutral-100 dark:border-neutral-700">
        <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Requirements</span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5"
        >
          <i className="fas fa-times text-[10px]"></i>
        </button>
      </div>
      <div className="space-y-0">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between group hover:bg-neutral-50 dark:hover:bg-neutral-700/50 px-3 py-0 rounded transition-colors">
            <span className={`text-[12px] font-mono ${colorClass} break-all leading-tight`}>{item}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopy(item, `req-${item}`);
              }}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-neutral-400 hover:text-amber-600 transition-all ml-1"
            >
              <i className="fas fa-copy text-[9px]"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CustomerDetails({ customer }: CustomerDetailsProps) {
  const { deleteCustomer, getTosLink } = useData();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTosLoading, setIsTosLoading] = useState(false);
  const [expandedRequirements, setExpandedRequirements] = useState<Record<string, string | null>>({});

  const toggleRequirement = (endorsementName: string, type: string) => {
    setExpandedRequirements(prev => ({
      ...prev,
      [endorsementName]: prev[endorsementName] === type ? null : type
    }));
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCustomer(customer.id);
      setDeleteStep(0);
    } catch (error) {
      console.error('Failed to delete customer:', error);
      alert('Failed to delete customer');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTosClick = async () => {
    setIsTosLoading(true);
    try {
      const { url } = await getTosLink(customer.id);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to get ToS link:', error);
      alert('Failed to get ToS link');
    } finally {
      setIsTosLoading(false);
    }
  };

  const showTosButton = customer.endorsements?.some(endorsement => {
    if (endorsement.status === 'approved') return false;
    
    const missing = endorsement.requirements.missing;
    if (!missing) return false;
    
    const allOf = (missing as any).all_of;
    if (!Array.isArray(allOf) || allOf.length === 0) return false;
    
    return allOf.some((req: string) => req.startsWith('terms_of_service'));
  });

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'complete':
      case 'active':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'pending':
      case 'under_review':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'rejected':
      case 'incomplete':
      case 'inactive':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-600';
    }
  };

  const getMissingItems = (missing: any): string[] => {
    if (!missing) return [];
    if (Array.isArray(missing.all_of)) return missing.all_of;
    return Object.keys(missing); // Fallback
  };

  const renderCompactField = (label: string, value: string | undefined, fieldKey: string, isCopyable = true) => {
    if (!value) return null;
    return (
      <div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">{label}</p>
        <div className="flex items-center gap-1">
          <p className="font-mono text-xs text-neutral-900 dark:text-white break-all flex-1">{value}</p>
          {isCopyable && (
            <button
              onClick={() => copyToClipboard(value, fieldKey)}
              className="p-1 text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 rounded transition-all flex-shrink-0"
              title="Copy to clipboard"
            >
              {copiedField === fieldKey ? (
                <svg className="w-3.5 h-3.5 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderStatusBadge = (label: string, status: string | undefined) => {
    if (!status) return null;
    return (
      <div className="flex justify-between items-center">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">{label}</span>
        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(status)}`}>
          {status.replace(/_/g, ' ').toUpperCase()}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-4 mb-6">
      <div className="w-full flex items-center justify-between">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center hover:opacity-80 transition-opacity group"
        >
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center">
            <span className="mr-3 p-1.5 bg-teal-500/10 rounded-lg text-teal-600 dark:text-teal-400"><i className="fas fa-user"></i></span>
            Customer Details
          </h2>
          <svg
            className={`w-5 h-5 text-neutral-500 transition-transform ml-3 ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {customer.id !== 'cfbc5326-25ff-43fb-82c9-6e800566f490' &&
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteStep(1);
          }}
          className="px-3 py-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-lg text-sm font-medium hover:bg-rose-500/20 transition-all flex items-center gap-2"
        >
          <span><i className="fas fa-trash"></i></span> Delete
        </button>}
      </div>
      
      {!isCollapsed && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Basic Info */}
          <div className="space-y-4">
            {/* Identity Section */}
            <div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                <i className="fas fa-id-card text-neutral-400"></i> Identity
              </h4>
              <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-3 border border-neutral-200 dark:border-neutral-700/50 space-y-3">
                {renderCompactField('Customer ID', customer.id, 'id')}
                {renderCompactField('Full Name', customer.first_name, 'full_name')}
                {renderCompactField('Email', customer.email, 'email')}
                {renderCompactField('Type', customer.type, 'type', false)}
                {renderCompactField('Created At', new Date(customer.created_at).toLocaleString(), 'created_at', false)}
                
                {/* Links */}
                {(customer.kyc_link || customer.tos_link) && (
                  <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/50 space-y-2">
                    {renderCompactField('KYC Link', customer.kyc_link, 'kyc_link')}
                    {renderCompactField('ToS Link', customer.tos_link, 'tos_link')}
                  </div>
                )}
              </div>
            </div>

            {/* Status Section */}
            <div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                <i className="fas fa-info-circle text-neutral-400"></i> Status
              </h4>
              <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-3 border border-neutral-200 dark:border-neutral-700/50 space-y-2">
                {renderStatusBadge('Overall Status', customer.status)}
                {renderStatusBadge('KYC Status', customer.kyc_status)}
                {renderStatusBadge('ToS Status', customer.tos_status)}
              </div>
            </div>
          </div>

          {/* Right Column: Capabilities & Endorsements */}
          <div className="space-y-4">
            {/* Capabilities */}
            {customer.capabilities && (
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                  <i className="fas fa-sliders-h text-neutral-400"></i> Capabilities
                </h4>
                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-3 border border-neutral-200 dark:border-neutral-700/50 grid grid-cols-2 gap-3">
                  {Object.entries(customer.capabilities).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded w-fit ${getStatusColor(value || '')}`}>
                        {(value || '').toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Endorsements */}
            {customer.endorsements && customer.endorsements.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                  <i className="fas fa-check-double text-neutral-400"></i> Endorsements
                </h4>
                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-3 border border-neutral-200 dark:border-neutral-700/50 space-y-3">
                  {customer.endorsements.map((endorsement) => (
                    <div key={endorsement.name} className="border-b border-neutral-200 dark:border-neutral-700/50 last:border-0 pb-3 last:pb-0 relative">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                          {endorsement.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getStatusColor(endorsement.status)}`}>
                          {endorsement.status.toUpperCase()}
                        </span>
                      </div>
                      
                      {/* Requirements Info */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <button 
                          onClick={() => toggleRequirement(endorsement.name, 'complete')}
                          className={`text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 p-1 rounded transition-colors ${expandedRequirements[endorsement.name] === 'complete' ? 'bg-neutral-100 dark:bg-neutral-800 ring-1 ring-neutral-200 dark:ring-neutral-700' : ''}`}
                        >
                          <div className="text-green-600 dark:text-green-400">
                            <span className="font-semibold">{endorsement.requirements.complete.length}</span> Complete
                          </div>
                        </button>
                        
                        <button 
                          onClick={() => toggleRequirement(endorsement.name, 'pending')}
                          className={`text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 p-1 rounded transition-colors ${expandedRequirements[endorsement.name] === 'pending' ? 'bg-neutral-100 dark:bg-neutral-800 ring-1 ring-neutral-200 dark:ring-neutral-700' : ''}`}
                        >
                          <div className="text-yellow-600 dark:text-yellow-400">
                            <span className="font-semibold">{endorsement.requirements.pending.length}</span> Pending
                          </div>
                        </button>

                        <button 
                          onClick={() => toggleRequirement(endorsement.name, 'missing')}
                          className={`text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 p-1 rounded transition-colors ${expandedRequirements[endorsement.name] === 'missing' ? 'bg-neutral-100 dark:bg-neutral-800 ring-1 ring-neutral-200 dark:ring-neutral-700' : ''}`}
                        >
                          <div className="text-red-600 dark:text-red-400">
                            <span className="font-semibold">
                              {endorsement.requirements.missing 
                                ? (Array.isArray(endorsement.requirements.missing.all_of) 
                                    ? endorsement.requirements.missing.all_of.length 
                                    : Object.keys(endorsement.requirements.missing).length)
                                : 0}
                            </span> Missing
                          </div>
                        </button>
                      </div>

                      {/* Expanded List */}
                      {expandedRequirements[endorsement.name] === 'complete' && (
                        <RequirementListPopover
                          items={endorsement.requirements.complete}
                          colorClass="text-green-600 dark:text-green-400"
                          onClose={() => setExpandedRequirements(prev => ({ ...prev, [endorsement.name]: null }))}
                          onCopy={copyToClipboard}
                        />
                      )}
                      {expandedRequirements[endorsement.name] === 'pending' && (
                        <RequirementListPopover
                          items={endorsement.requirements.pending}
                          colorClass="text-yellow-600 dark:text-yellow-400"
                          onClose={() => setExpandedRequirements(prev => ({ ...prev, [endorsement.name]: null }))}
                          onCopy={copyToClipboard}
                        />
                      )}
                      {expandedRequirements[endorsement.name] === 'missing' && (
                        <RequirementListPopover
                          items={getMissingItems(endorsement.requirements.missing)}
                          colorClass="text-red-600 dark:text-red-400"
                          onClose={() => setExpandedRequirements(prev => ({ ...prev, [endorsement.name]: null }))}
                          onCopy={copyToClipboard}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showTosButton && !isCollapsed && (
        <div className="mt-6 flex justify-end border-t border-neutral-200 dark:border-neutral-700 pt-4">
          <button
            onClick={handleTosClick}
            disabled={isTosLoading}
            className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-amber-500/20 transition-all shadow-sm flex items-center justify-center gap-1 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isTosLoading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-600 dark:border-amber-400"></div>
                Generating Link...
              </>
            ) : (
              <>
                <i className="fas fa-file-contract"></i>
                Sign Terms of Service
              </>
            )}
          </button>
        </div>
      )}

      {deleteStep > 0 && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 w-full p-6 transition-all duration-300 ${
            deleteStep === 1 ? 'max-w-md' : deleteStep === 2 ? 'max-w-lg' : 'max-w-xl'
          }`}>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
              {deleteStep === 1 && 'Delete Customer'}
              {deleteStep === 2 && 'Are you really sure?'}
              {deleteStep === 3 && 'Are you absolutely sure?'}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300 mb-6">
              {deleteStep === 1 && (
                <>Are you sure you want to delete customer <span className="font-semibold text-neutral-900 dark:text-white">{customer.full_name || customer.email || customer.id}</span>? This action cannot be undone.</>
              )}
              {deleteStep === 2 && 'Are you sure that you are sure? This will permanently remove all data associated with this customer.'}
              {deleteStep === 3 && `Listen, I am not joking here!`}
              <br/>
              <br/>
              {deleteStep === 3 && `If you delete this customer there is NO going back and you might regret it.`}
              <br/>
              {deleteStep === 3 && `Think about it for a bit. Ask yourself if this is really necessary.`}
              <br/>
              {deleteStep === 3 && `If you are still so damn sure, then go ahead and click the button below one last time...`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (deleteStep < 3) {
                    setDeleteStep(prev => prev + 1);
                  } else {
                    handleDelete();
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-lg font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    Deleting...
                  </>
                ) : (
                  deleteStep === 1 ? 'Yes, delete' :
                  deleteStep === 2 ? 'I understand, continue' :
                  'YESSSSS!!!!'
                )}
              </button>
              <button
                onClick={() => setDeleteStep(0)}
                className="px-4 py-2 bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20 rounded-lg font-medium hover:bg-neutral-500/20 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
