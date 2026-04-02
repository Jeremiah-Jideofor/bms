'use client';

import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import api from '@/utils/api';
import { formatCurrency } from '@/utils/formatCurrency';
import Spinner from './Spinner';

/**
 * ProductSearchInput Component
 * 
 * Searchable product input with debounced API calls, dropdown results,
 * and click-to-select functionality. Shows loading state and "no results" message.
 * 
 * @param {Object} props
 * @param {Function} props.onSelect - Callback when product is selected
 * @param {boolean} [props.disabled=false] - Disable input
 * @param {string} [props.className] - Additional classes
 */
export default function ProductSearchInput({ onSelect, disabled = false, className = '' }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debounceTimer = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!search.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await api.get('/products', {
          params: { search: search.trim() },
        });
        setResults(res.data.data || []);
        setOpen(true);
        setHighlightedIndex(-1);
      } catch (err) {
        console.error('Product search failed:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && inputRef.current && !inputRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!open) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          handleSelectProduct(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setOpen(false);
        break;
      default:
        break;
    }
  };

  const handleSelectProduct = (product) => {
    onSelect(product);
    setSearch('');
    setResults([]);
    setOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    setSearch('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div className={`relative flex-1 ${className}`}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <FiSearch className="w-5 h-5" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => search && setOpen(true)}
          placeholder="Search products..."
          disabled={disabled}
          className={`
            w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md
            text-sm text-gray-900 bg-white placeholder:text-gray-400
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
          `}
        />
        {search && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {open && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Spinner label="Searching..." />
            </div>
          )}

          {!loading && results.length === 0 && search && (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              No products found for "{search}"
            </div>
          )}

          {!loading && results.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {results.map((product, index) => (
                <li key={product.id}>
                  <button
                    onClick={() => handleSelectProduct(product)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`
                      w-full px-4 py-3 text-left transition-colors duration-150
                      ${highlightedIndex === index ? 'bg-indigo-50' : 'hover:bg-gray-50'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-sm font-semibold text-indigo-600">{formatCurrency(product.price)}</p>
                        <p className="text-xs text-gray-500">{product.quantity} in stock</p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
