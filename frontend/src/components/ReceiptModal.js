'use client';

import { FiPrinter, FiX } from 'react-icons/fi';
import { formatCurrency } from '@/utils/formatCurrency';

const generateReceiptHTML = (sale) => {
  const saleDate = new Date(sale.createdAt);
  const formattedDate = saleDate.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = saleDate.toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const paymentMethodLabels = {
    CASH: 'Cash',
    TRANSFER: 'Transfer',
    CARD: 'Card',
  };

  const itemsHtml = sale.items?.map((item) => `
    <tr>
      <td>${item.product?.name || 'Unknown Product'}</td>
      <td style="text-align: center;">${item.quantity}</td>
      <td class="text-right">${formatCurrency(item.price)}</td>
      <td class="text-right">${formatCurrency(item.subtotal)}</td>
    </tr>
  `).join('') || '';

  const staffHtml = sale.user ? `
    <p style="margin: 5px 0;">
      <span style="font-weight: bold;">Staff:</span> ${sale.user.name}
    </p>
  ` : '';

  const creditHtml = sale.isCredit ? `
    <p style="margin: 5px 0; color: #dc2626;">
      <span style="font-weight: bold;">Credit Sale</span> - Due: ${new Date(sale.dueDate).toLocaleDateString('en-NG')}
    </p>
  ` : '';

  return `
    <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 20px;">
      <h1 style="margin: 0; font-size: 24px;">Leo Cosmetics</h1>
      <p style="margin: 5px 0 0; font-size: 14px; color: #555;">Sales Receipt</p>
    </div>

    <div style="margin-bottom: 20px; font-size: 14px;">
      <p style="margin: 5px 0;"><span style="font-weight: bold;">Date:</span> ${formattedDate}</p>
      <p style="margin: 5px 0;"><span style="font-weight: bold;">Time:</span> ${formattedTime}</p>
      ${staffHtml}
      <p style="margin: 5px 0;"><span style="font-weight: bold;">Payment:</span> ${paymentMethodLabels[sale.paymentMethod] || sale.paymentMethod}</p>
      ${creditHtml}
    </div>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align: center;">Qty</th>
          <th class="text-right">Price</th>
          <th class="text-right">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="total">
      <span>Total Amount:</span>
      <span>${formatCurrency(sale.total)}</span>
    </div>

    <div class="footer">
      <p style="margin: 0 0 5px 0;">Thank you for your business!</p>
      <p style="margin: 0;">Please retain this receipt for your records</p>
    </div>
  `;
};

/**
 * ReceiptModal Component
 * 
 * Displays a printable receipt with business details, sale items, total, and payment method.
 * Includes print-optimized styling via @media print rules.
 * 
 * @param {Object} props
 * @param {boolean} props.open - Modal visibility
 * @param {Function} props.onClose - Callback to close modal
 * @param {Object} props.sale - Sale object with items, total, paymentMethod, createdAt, user
 */
export default function ReceiptModal({ open, onClose, sale }) {
  if (!open || !sale) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #000;
              max-width: 400px;
              margin: 0 auto;
            }

            h1 {
              text-align: center;
              font-size: 24px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th, td {
              padding: 8px;
              border-bottom: 1px solid #ddd;
              text-align: left;
            }

            .text-right {
              text-align: right;
            }

            .total {
              font-size: 18px;
              font-weight: bold;
              margin-top: 20px;
              display: flex;
              justify-content: space-between;
              border-top: 2px solid #ddd;
              padding-top: 15px;
            }

            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #555;
            }
          </style>
        </head>
        <body>
          ${generateReceiptHTML(sale)}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const saleDate = new Date(sale.createdAt);
  const formattedDate = saleDate.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = saleDate.toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const paymentMethodLabels = {
    CASH: 'Cash',
    TRANSFER: 'Transfer',
    CARD: 'Card',
  };

  return (
    <>
      {/* Modal Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-white rounded-lg shadow-xl z-50 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 print:hidden">
          <h2 className="text-xl font-bold text-gray-900">Receipt</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Content - Scrollable */}
        <div id="receipt" className="flex-1 overflow-y-auto px-6 py-6 bg-white">
          {/* Business Header */}
          <div className="text-center mb-6 pb-6 border-b border-gray-300">
            <h1 className="text-2xl font-bold text-gray-900">Business Management Suite</h1>
            <p className="text-sm text-gray-600 mt-1">Sales Receipt</p>
          </div>

          {/* Date & Staff Info */}
          <div className="text-sm text-gray-700 mb-6 space-y-1">
            <p>
              <span className="font-medium">Date:</span> {formattedDate}
            </p>
            <p>
              <span className="font-medium">Time:</span> {formattedTime}
            </p>
            {sale.user && (
              <p>
                <span className="font-medium">Staff:</span> {sale.user.name}
              </p>
            )}
            <p>
              <span className="font-medium">Payment:</span> {paymentMethodLabels[sale.paymentMethod] || sale.paymentMethod}
            </p>
            {sale.isCredit && (
              <p className="text-red-600">
                <span className="font-medium">Credit Sale</span> - Due: {new Date(sale.dueDate).toLocaleDateString('en-NG')}
              </p>
            )}
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 font-semibold text-gray-900">Item</th>
                  <th className="text-center py-2 font-semibold text-gray-900 w-12">Qty</th>
                  <th className="text-right py-2 font-semibold text-gray-900 w-24">Price</th>
                  <th className="text-right py-2 font-semibold text-gray-900 w-28">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sale.items && sale.items.map((item) => (
                  <tr key={item.id} className="text-gray-900">
                    <td className="py-2">{item.product?.name || 'Unknown Product'}</td>
                    <td className="text-center py-2">{item.quantity}</td>
                    <td className="text-right py-2">{formatCurrency(item.price)}</td>
                    <td className="text-right py-2 font-medium">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Section */}
          <div className="border-t-2 border-gray-300 pt-4 space-y-2">
            <div className="flex items-center justify-between text-lg font-bold text-gray-900">
              <span>Total Amount:</span>
              <span className="text-indigo-600">{formatCurrency(sale.total)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500 space-y-2">
            <p>Thank you for your business!</p>
            <p>Please retain this receipt for your records</p>
          </div>
        </div>

        {/* Footer Actions - Print Only Button */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
          >
            <FiPrinter className="w-4 h-4" />
            Print Receipt
          </button>
        </div>
      </div>
    </>
  );
}
