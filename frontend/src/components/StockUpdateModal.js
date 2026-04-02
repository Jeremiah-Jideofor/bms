// StockUpdateModal.js - Update stock dialog using custom Modal, Input, Button, Alert
import { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import Alert from './Alert';

export default function StockUpdateModal({ open, onClose, onSubmit, product, loading, error }) {
  const [quantity, setQuantity] = useState('');
  const [type, setType] = useState('IN');

  useEffect(() => {
    if (open) {
      setQuantity('');
      setType('IN');
    }
  }, [open]);

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit({ productId: product?.id, quantity: Number(quantity), type });
  };

  return (
    <Modal open={open} onClose={onClose} title="Update Stock">
      {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            name="quantity"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            placeholder="Quantity (+/-)"
            type="number"
            required
          />
          <select
            name="type"
            value={type}
            onChange={e => setType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          >
            <option value="IN">Add Stock</option>
            <option value="OUT">Remove Stock</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>Update</Button>
        </div>
      </form>
    </Modal>
  );
}
