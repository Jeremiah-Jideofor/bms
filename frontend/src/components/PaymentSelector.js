'use client';

import { FiDollarSign, FiSend, FiCreditCard } from 'react-icons/fi';

/**
 * PaymentSelector Component
 * 
 * Radio-style cards for selecting payment method (CASH, TRANSFER, CARD)
 * Each option has distinctive color coding and icons for visual clarity
 * 
 * @param {Object} props
 * @param {string} props.selected - Selected payment method ('CASH', 'TRANSFER', 'CARD')
 * @param {Function} props.onChange - Callback when payment method changes
 */
export default function PaymentSelector({ selected = 'CASH', onChange }) {
  const paymentMethods = [
    {
      id: 'CASH',
      label: 'Cash',
      icon: <FiDollarSign className="w-6 h-6" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      selectedBorder: 'border-green-500 ring-2 ring-green-200',
      textColor: 'text-green-900',
      iconColor: 'text-green-600',
    },
    {
      id: 'TRANSFER',
      label: 'Transfer',
      icon: <FiSend className="w-6 h-6" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      selectedBorder: 'border-blue-500 ring-2 ring-blue-200',
      textColor: 'text-blue-900',
      iconColor: 'text-blue-600',
    },
    {
      id: 'CARD',
      label: 'Card',
      icon: <FiCreditCard className="w-6 h-6" />,
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      selectedBorder: 'border-purple-500 ring-2 ring-purple-200',
      textColor: 'text-purple-900',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Payment Method</label>
      <div className="grid grid-cols-3 gap-3">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => onChange(method.id)}
            className={`
              flex flex-col items-center justify-center gap-2 p-2 rounded-lg border-2 transition-all duration-200
              ${selected === method.id ? `${method.selectedBorder} ${method.bgColor}` : `${method.borderColor} ${method.bgColor} hover:border-gray-300`}
            `}
          >
            <div className={method.iconColor}>
              {method.icon}
            </div>
            <span className={`text-sm font-semibold ${method.textColor}`}>
              {method.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
