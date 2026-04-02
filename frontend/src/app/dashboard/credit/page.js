// Credit Management Page
'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { formatCurrency } from '@/utils/formatCurrency';
import { FiEye } from 'react-icons/fi';
import Modal from '@/components/Modal';

function getStatus(sale) {
  if (!sale.isCredit) return 'N/A';
  if (sale.dueDate && new Date(sale.dueDate) < new Date()) return 'Overdue';
  return 'Pending';
}

export default function CreditPage() {
  const [sales, setSales] = useState([]);
  const [filter, setFilter] = useState('credit');
  const [error, setError] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    let url = '/sales/credit';
    if (filter === 'overdue') url = '/sales/overdue';
    api.get(url)
      .then(res => setSales(res.data.data))
      .catch(() => setError('Failed to load credit sales'));
  }, [filter]);

  const filterTabs = [
    { key: 'credit', label: 'Active Credit' },
    { key: 'overdue', label: 'Overdue' },
  ];

  const handleViewDetails = async (sale) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/sales/${sale.id}`);
      setSelectedSale(res.data.data);
      setIsDetailOpen(true);
    } catch (err) {
      setError('Failed to load sale details');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Credit Management</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">

        {error && (
          <div className="bg-red-100 text-red-700 text-sm px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                filter === tab.key
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Sale ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sales.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-sm text-gray-500">
                    No records found
                  </td>
                </tr>
              )}
              {sales.map(sale => {
                const status = getStatus(sale);
                return (
                  <tr key={sale.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-900">#{sale.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(sale.total)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {sale.dueDate ? new Date(sale.dueDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {status === 'Overdue' && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-700">Overdue</span>
                      )}
                      {status === 'Pending' && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-700">Pending</span>
                      )}
                      {status === 'N/A' && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleViewDetails(sale)}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition font-medium"
                      >
                        <FiEye size={16} />
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Details Modal */}
      <Modal
        open={isDetailOpen}
        onClose={() => !detailLoading && setIsDetailOpen(false)}
        title="Transaction Details"
      >
        {detailLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : selectedSale ? (
          <div className="space-y-6">
            {/* Sale Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sale Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Sale ID</p>
                  <p className="text-sm text-gray-900">#{selectedSale.id}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Amount</p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(selectedSale.total)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Sale Date</p>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedSale.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Due Date</p>
                  <p className="text-sm text-gray-900">
                    {selectedSale.dueDate ? new Date(selectedSale.dueDate).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Status</p>
                  <p className="text-sm text-gray-900">
                    {getStatus(selectedSale) === 'Overdue' && (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-700">Overdue</span>
                    )}
                    {getStatus(selectedSale) === 'Pending' && (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-700">Pending</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Payment Method</p>
                  <p className="text-sm text-gray-900">{selectedSale.paymentMethod || 'Credit'}</p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            {selectedSale.customer && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase">Name</p>
                    <p className="text-sm text-gray-900">{selectedSale.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase">Email</p>
                    <p className="text-sm text-gray-900">{selectedSale.customer.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase">Phone</p>
                    <p className="text-sm text-gray-900">{selectedSale.customer.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase">Address</p>
                    <p className="text-sm text-gray-900">{selectedSale.customer.address || '—'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Items */}
            {selectedSale.items && selectedSale.items.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Product</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Qty</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Price</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedSale.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-gray-900">{item.product?.name || 'N/A'}</td>
                          <td className="px-4 py-2 text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-2 text-gray-900">{formatCurrency(item.price)}</td>
                          <td className="px-4 py-2 text-gray-900 font-medium">{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}