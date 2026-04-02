// Low Stock Products Page
'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/sidebar';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Spinner from '@/components/Spinner';
import Alert from '@/components/Alert';
import api from '@/utils/api';

export default function LowStockPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLowStock = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
        const res = await api.get('/products/low-stock', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Ensure products is always an array
        let items = res.data;
        if (Array.isArray(items)) {
          setProducts(items);
        } else if (Array.isArray(items?.data)) {
          setProducts(items.data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          setError('Failed to fetch low stock products');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLowStock();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900">Low Stock Products</h1>
        {error && <Alert variant="destructive">{error}</Alert>}
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">No low stock products.</div>
            ) : (
              products.map(product => (
                <Card key={product.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-lg">{product.name}</span>
                    {product.quantity <= product.minStock ? (
                      <Badge color="red">Critical</Badge>
                    ) : (
                      <Badge color="yellow">Low</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">SKU: {product.sku}</div>
                  <div className="text-sm text-gray-600 mb-1">Quantity: {product.quantity}</div>
                  <div className="text-sm text-gray-600">Min Stock: {product.minStock}</div>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
