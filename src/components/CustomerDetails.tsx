import type { Customer } from '../types';
import { useState } from 'react';

interface CustomerDetailsProps {
  customer: Customer;
}

export function CustomerDetails({ customer }: CustomerDetailsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

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
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'incomplete':
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const renderStatusField = (label: string, value: string | undefined) => {
    if (!value) return null;
    
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-600 font-medium">{label}</p>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(value)}`}>
            {value.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>
      </div>
    );
  };

  const renderField = (label: string, value: string | undefined, fieldKey: string) => {
    if (!value) return null;
    
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium">{label}</p>
          <p className="text-gray-900 break-all">{value}</p>
        </div>
        <button
          onClick={() => copyToClipboard(value, fieldKey)}
          className="ml-3 p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
          title="Copy to clipboard"
        >
          {copiedField === fieldKey ? (
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
      >
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="text-indigo-600 mr-2">👤</span>
          Customer Details
        </h2>
        <svg
          className={`w-6 h-6 text-gray-600 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {!isCollapsed && (
        <div className="space-y-3">
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
    </div>
  );
}
