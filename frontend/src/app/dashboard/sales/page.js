// Sales POS Page - Create Sale
'use client';
import { useState, useEffect, useMemo } from 'react';
import api from '@/utils/api';
import { formatCurrency } from '@/utils/formatCurrency';
import ProductSearchInput from '@/components/ProductSearchInput';
import CustomerSearchInput from '@/components/CustomerSearchInput';
import PaymentSelector from '@/components/PaymentSelector';
import ReceiptModal from '@/components/ReceiptModal';

export default function SalesPage() {
  const [cart, setCart] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isCredit, setIsCredit] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const addToCart = (product) => {
    setError('');
    if (!product) return setError('Select a product');

    const cartItem = cart.find(item => item.productId === product.id);
    const totalQty = (cartItem ? cartItem.quantity : 0) + Number(quantity);

    if (totalQty > product.quantity) {
      return setError(`Cannot add more than available stock. Available: ${product.quantity}`);
    }
    if (totalQty <= 0) return setError('Quantity must be at least 1');

    setCart(prev => {
      if (cartItem) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: totalQty, subtotal: product.price * totalQty } 
            : item
        );
      } else {
        return [...prev, { 
          productId: product.id, 
          name: product.name, 
          price: product.price, 
          quantity: Number(quantity), 
          subtotal: product.price * Number(quantity) 
        }];
      }
    });
    setQuantity(1);
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.productId !== id));

  const updateQuantity = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCart(cart => cart.map(item => 
      item.productId === id 
        ? { ...item, quantity: qty, subtotal: item.price * qty } 
        : item
    ));
  };

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const handleSubmit = async (credit = false) => {
    setError(''); 
    setSuccess(''); 
    setLoading(true);

    if (cart.length === 0) { 
      setError('Cart is empty'); 
      setLoading(false); 
      return; 
    }
    if (credit && !dueDate) { 
      setError('Due date required for credit sale'); 
      setLoading(false); 
      return; 
    }
    if (credit && !selectedCustomer) {
      setError('A customer must be selected for credit sales');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/sales', {
        items: cart.map(({ productId, quantity }) => ({ productId, quantity })),
        isCredit: credit,
        dueDate: credit ? dueDate : undefined,
        paymentMethod: paymentMethod,
        customerId: selectedCustomer?.id || undefined,
      });
      
      setSuccess('Sale completed!');
      setLastSale(res.data.data);
      setShowReceipt(true);
      setCart([]); 
      setDueDate(''); 
      setIsCredit(false);
      setPaymentMethod('CASH');
      setSelectedCustomer(null);
    } catch (e) {
      setError(e.response?.data?.message || 'Sale failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Sales POS</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">

        {error && (
          <div className="bg-red-100 text-red-700 text-sm px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 text-sm px-4 py-2 rounded-md mb-4">
            {success}
          </div>
        )}

        {/* Product search row */}
        <div className="flex gap-2 mb-4">
          <ProductSearchInput 
            onSelect={addToCart}
            disabled={loading}
            className="flex-1"
          />
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            className="w-20 border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            disabled={loading}
          />
        </div>

        {/* Customer search row */}
        <div className="mb-5 border-b border-gray-200 pb-5">
          <CustomerSearchInput 
            onSelect={setSelectedCustomer} 
            disabled={loading}
          />
        </div>

        {/* Cart table */}
        <div className="overflow-hidden border border-gray-200 rounded-lg mb-5">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Qty</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subtotal</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cart.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-sm text-gray-500">
                    No items in cart
                  </td>
                </tr>
              )}
              {cart.map(item => (
                <tr key={item.productId} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateQuantity(item.productId, Number(e.target.value))}
                      className="border border-gray-300 rounded-md w-16 px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                      disabled={loading}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.price)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.price * item.quantity)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-sm text-red-600 hover:text-red-700 transition disabled:opacity-50"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment Method Selection */}
        {cart.length > 0 && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <PaymentSelector 
              selected={paymentMethod}
              onChange={setPaymentMethod}
            />
          </div>
        )}

        {/* Total & actions */}
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold text-gray-900">
            Total: <span className="text-indigo-600">{formatCurrency(total)}</span>
          </div>
          <div className="flex gap-2 items-center">
            <button
              disabled={loading || cart.length === 0}
              onClick={() => handleSubmit(false)}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete Sale
            </button>
            <button
              disabled={loading}
              onClick={() => setIsCredit(v => !v)}
              className={`text-sm font-medium px-4 py-2 rounded-md transition ${
                isCredit
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              Credit Sale
            </button>
          </div>
        </div>

        {/* Due date (credit) */}
        {isCredit && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                disabled={loading}
              />
              <button
                disabled={loading || !selectedCustomer}
                onClick={() => handleSubmit(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Credit Sale
              </button>
            </div>
            {!selectedCustomer && (
              <p className="mt-2 text-sm text-red-600">Please select a customer above to proceed with a credit sale.</p>
            )}
          </div>
        )}

      </div>

      {/* Receipt Modal */}
      <ReceiptModal 
        open={showReceipt}
        onClose={() => setShowReceipt(false)}
        sale={lastSale}
      />
    </div>
  );
}
