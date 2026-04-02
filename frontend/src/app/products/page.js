'use client';

import { useEffect, useState } from 'react';

import Card from '@/components/Card';
import Button from '@/components/Button';
import Table from '@/components/Table';
import Alert from '@/components/Alert';
import Spinner from '@/components/Spinner';
import Sidebar from '@/components/sidebar';
import ProductModal from '@/components/ProductModal';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import StockUpdateModal from '@/components/StockUpdateModal';
import api from '@/utils/api';
import { formatCurrency } from '@/utils/formatCurrency';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal/dialog state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productModalLoading, setProductModalLoading] = useState(false);
  const [productModalError, setProductModalError] = useState(null);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProduct, setStockProduct] = useState(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState(null);

 const fetchProducts = async () => {
  setLoading(true);
  setError(null);

  try {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : '';

    const res = await api.get('/products', {
      headers: { Authorization: `Bearer ${token}` },
    });

    setProducts(res.data.data); // FIX HERE

  } catch (err) {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else {
      setError('Failed to fetch products');
    }
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>

          <Button onClick={() => {
            setEditingProduct(null);
            setProductModalError(null);
            setShowProductModal(true);
          }}>
            Add Product
          </Button>
        </div>

        {error && <Alert variant="destructive">{error}</Alert>}

        <Card>
          {loading ? (
            <Spinner />
          ) : (
            <Table
              columns={['name', 'sku', 'price', 'quantity', 'minStock']}
              data={products.map((p) => ({
                ...p,
                price: formatCurrency(p.price),
              }))}
              actions={(product) => (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingProduct(product);
                      setProductModalError(null);
                      setShowProductModal(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setDeletingProduct(product);
                      setShowDeleteDialog(true);
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setStockProduct(product);
                      setStockError(null);
                      setShowStockModal(true);
                    }}
                  >
                    Update Stock
                  </Button>
                </div>
              )}
            />
          )}
        </Card>

        {/* Product Modal for Add/Edit */}
        <ProductModal
          open={showProductModal}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
          onSubmit={async (form) => {
            setProductModalLoading(true);
            setProductModalError(null);
            try {
              const token = localStorage.getItem('token');
              if (editingProduct) {
                // Edit
                await api.put(`/products/${editingProduct.id}`, form, {
                  headers: { Authorization: `Bearer ${token}` },
                });
              } else {
                // Add
                await api.post('/products', form, {
                  headers: { Authorization: `Bearer ${token}` },
                });
              }
              setShowProductModal(false);
              setEditingProduct(null);
              fetchProducts();
            } catch (err) {
              if (err.response?.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
              } else {
                setProductModalError('Failed to save product');
              }
            } finally {
              setProductModalLoading(false);
            }
          }}
          initialData={editingProduct}
          loading={productModalLoading}
          error={productModalError}
        />

        {/* Delete Confirm Dialog */}
        <DeleteConfirmDialog
          open={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setDeletingProduct(null);
          }}
          onConfirm={async () => {
            setDeleteLoading(true);
            try {
              const token = localStorage.getItem('token');
              await api.delete(`/products/${deletingProduct.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              setShowDeleteDialog(false);
              setDeletingProduct(null);
              fetchProducts();
            } catch (err) {
              if (err.response?.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
              } else {
                setError('Failed to delete product');
              }
            } finally {
              setDeleteLoading(false);
            }
          }}
          loading={deleteLoading}
        />

        {/* Stock Update Modal */}
        <StockUpdateModal
          open={showStockModal}
          onClose={() => {
            setShowStockModal(false);
            setStockProduct(null);
          }}
          onSubmit={async ({ productId, quantity, type }) => {
            setStockLoading(true);
            setStockError(null);
            try {
              const token = localStorage.getItem('token');
              await api.post(`/products/${productId}/stock`, { quantity, type: type || 'IN' }, {
                headers: { Authorization: `Bearer ${token}` },
              });
              setShowStockModal(false);
              setStockProduct(null);
              fetchProducts();
            } catch (err) {
              if (err.response?.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
              } else {
                setStockError('Failed to update stock');
              }
            } finally {
              setStockLoading(false);
            }
          }}
          product={stockProduct}
          loading={stockLoading}
          error={stockError}
        />
          

      </main>
    </div>
  );
}