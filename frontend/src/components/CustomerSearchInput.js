import { useState, useEffect, useRef } from 'react';
import api from '@/utils/api';
import { FiSearch, FiUser, FiX } from 'react-icons/fi';

export default function CustomerSearchInput({ onSelect, disabled }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!searchTerm.trim() || selectedCustomer) {
        setCustomers([]);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get('/customers', { params: { search: searchTerm } });
        setCustomers(res.data.data);
        setIsOpen(true);
      } catch (err) {
        console.error('Failed to search customers:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, selectedCustomer]);

  const handleSelect = (customer) => {
    setSelectedCustomer(customer);
    setSearchTerm('');
    setIsOpen(false);
    onSelect(customer);
  };

  const handleClear = () => {
    setSelectedCustomer(null);
    setSearchTerm('');
    onSelect(null);
  };

  if (selectedCustomer) {
    return (
      <div className="flex items-center justify-between p-3 border border-indigo-200 bg-indigo-50 rounded-md">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-full hidden sm:block">
            <FiUser className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{selectedCustomer.name}</p>
            {(selectedCustomer.phone || selectedCustomer.email) && (
              <p className="text-xs text-gray-500">
                {selectedCustomer.phone} {selectedCustomer.phone && selectedCustomer.email && '•'} {selectedCustomer.email}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleClear}
          disabled={disabled}
          className="p-1 hover:bg-indigo-100 rounded text-gray-500 hover:text-gray-700 transition"
          type="button"
        >
          <FiX />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">Customer Selection (Optional for Cash)</label>
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => { if (customers.length > 0) setIsOpen(true); }}
          placeholder="Search customer by name, email, or phone..."
          disabled={disabled}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm text-gray-900"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
        )}
      </div>

      {isOpen && customers.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {customers.map((customer) => (
            <button
              key={customer.id}
              onClick={() => handleSelect(customer)}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition"
              type="button"
            >
              <p className="text-sm font-medium text-gray-900">{customer.name}</p>
              <p className="text-xs text-gray-500">
                {customer.phone || 'No phone'} | {customer.email || 'No email'}
              </p>
            </button>
          ))}
        </div>
      )}
      
      {isOpen && !loading && searchTerm.trim() && customers.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg px-4 py-3 text-sm text-gray-500 text-center">
          No customers found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
}
