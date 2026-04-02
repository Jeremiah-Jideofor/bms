// DeleteConfirmDialog.js - Confirm delete dialog using custom Modal, Button
import Modal from './Modal';
import Button from './Button';

export default function DeleteConfirmDialog({ open, onClose, onConfirm, loading }) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Product?">
      <p className="mb-6 text-gray-700">Are you sure you want to delete this product? This action cannot be undone.</p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="destructive" onClick={onConfirm} disabled={loading}>Delete</Button>
      </div>
    </Modal>
  );
}
