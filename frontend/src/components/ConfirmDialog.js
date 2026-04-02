// Custom ConfirmDialog for delete confirmation
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ open, onClose, onConfirm, title = "Are you sure?", description = "This action cannot be undone." }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="mb-6 text-gray-700">{description}</p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="destructive" onClick={onConfirm}>Delete</Button>
      </div>
    </Modal>
  );
}
