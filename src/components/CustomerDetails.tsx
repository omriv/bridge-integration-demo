import type { Customer } from '../types';
import { useState } from 'react';
import { useData } from '../context/DataContext';

interface CustomerDetailsProps {
  customer: Customer;
}

export function CustomerDetails({ customer }: CustomerDetailsProps) {
  const { deleteCustomer } = useData();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [deleteStep, setDeleteStep] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

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
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20';
      case 'pending':
      case 'under_review':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20';
      case 'rejected':
      case 'incomplete':
      case 'inactive':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';
      default:
        return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-600';
    }
  };

  const renderStatusField = (label: string, value: string | undefined) => {
    if (!value) return null;
    
    return (
      <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-700/50">
        <div className="flex items-center gap-3">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">{label}</p>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
            {value.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>
      </div>
    );
  };

  const renderField = (label: string, value: string | undefined, fieldKey: string) => {
    if (!value) return null;
    
    return (
      <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group">
        <div className="flex-1">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium mb-1">{label}</p>
          <p className="text-neutral-900 dark:text-neutral-200 break-all font-mono text-sm">{value}</p>
        </div>
        <button
          onClick={() => copyToClipboard(value, fieldKey)}
          className="ml-3 p-2 text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="Copy to clipboard"
        >
          {copiedField === fieldKey ? (
            <svg className="w-5 h-5 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
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
        <div className="space-y-3 mt-6">
          {renderField('Customer ID', customer.id, 'id')}
          {renderField('Type', customer.type, 'type')}
          {renderStatusField('Status', customer.status)}
          {renderStatusField('KYC Status', customer.kyc_status)}
          {renderStatusField('ToS Status', customer.tos_status)}
          {renderField('Email', customer.email, 'email')}
          {renderField('Full Name', customer.full_name, 'full_name')}
          {renderField('Created At', customer.created_at, 'created_at')}
          {renderField('KYC Link', customer.kyc_link, 'kyc_link')}
          {renderField('ToS Link', customer.tos_link, 'tos_link')}
          
          {/* Render any additional fields */}
          {Object.entries(customer).map(([key, value]) => {
            if (!['id', 'type', 'status', 'kyc_status', 'tos_status', 'email', 'full_name', 'created_at', 'kyc_link', 'tos_link'].includes(key) && 
                typeof value === 'string') {
              return renderField(key.replace(/_/g, ' ').toUpperCase(), value as string, key);
            }
            return null;
          })}
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
