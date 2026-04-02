// Sales History Page
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useUser } from '@/hooks/useUser';
import { formatCurrency } from '@/utils/formatCurrency';
import Spinner from '@/components/Spinner';
import Alert from '@/components/Alert';

export default function SalesHistoryPage() {
  const { isAdmin } = useUser();
  const router = useRouter();
  const [sales, setSales] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await api.get('/sales');
        setSales(res.data.data || []);
      } catch (err) {
        console.error('Error fetching sales:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
        } else {
          setError('Failed to load sales');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isAdmin ? 'All Sales' : 'Your Sales'}
        </h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">

        {error && (
          <Alert variant="destructive" className="mb-4">{error}</Alert>
        )}

        {sales.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-sm">
              {isAdmin ? 'No sales recorded yet.' : 'You have not created any sales yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  {isAdmin && (
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Staff</th>
                  )}
                  {/* <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Due Date</th> */}
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.map(sale => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(sale.createdAt).toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(sale.total)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {sale.isCredit ? (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-700">Credit</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">Cash</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {sale.user?.name || 'Unknown'}
                      </td>
                    )}
                    {/* <td className="px-4 py-3 text-sm text-gray-900">
                      {sale.dueDate ? new Date(sale.dueDate).toLocaleDateString() : '—'}
                    </td> */}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelected(sale)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Sale Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition text-lg leading-none"
              onClick={() => setSelected(null)}
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sale #{selected.id}</h2>
            <div className="space-y-2 mb-6">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Amount:</span> {formatCurrency(selected.total)}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Type:</span> {selected.isCredit ? 'Credit' : 'Cash'}
              </div>
              {isAdmin && selected.user && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Staff:</span> {selected.user.name}
                </div>
              )}
              <div className="text-sm text-gray-600">
                <span className="font-medium">Due Date:</span> {selected.dueDate ? new Date(selected.dueDate).toLocaleDateString() : '—'}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Created:</span> {new Date(selected.createdAt).toLocaleString()}
              </div>
            </div>

            {/* Sale Items Table */}
            {selected.items && selected.items.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Product</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Qty</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Price</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selected.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 text-gray-900">{item.product?.name || 'Unknown'}</td>
                          <td className="px-3 py-2 text-gray-900">{item.quantity}</td>
                          <td className="px-3 py-2 text-right text-gray-900">{formatCurrency(item.price)}</td>
                          <td className="px-3 py-2 text-right text-gray-900 font-medium">{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
