/**
 * Payment History Component
 * 
 * Displays user's payment history.
 */

'use client';

import { useState, useEffect } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import type { PaymentHistory } from '@/types/subscription';

interface PaymentHistoryProps {
  userId: string;
}

export function PaymentHistory({ userId }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentHistory();
  }, [userId]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscriptions/payments');
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment history');
      }

      const data = await response.json();
      setPayments(data.payments || []);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Convert cents to dollars
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      case 'refunded':
        return 'text-gray-400';
      default:
        return 'text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="md" />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-8 text-center">
        <p className="text-gray-300">No payment history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Payment History</h3>
      <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {new Date(payment.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300 capitalize">
                    {payment.payment_type.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-3 text-sm text-white font-medium">
                    {formatAmount(payment.amount, payment.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold capitalize ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

