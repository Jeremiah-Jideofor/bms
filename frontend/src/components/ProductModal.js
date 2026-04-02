import { useState, useEffect } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import Alert from "./Alert";
import CurrencyInput from "./CurrencyInput";

export default function ProductModal({
  open,
  onClose,
  onSubmit,
  initialData,
  loading,
  error,
}) {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    cost: "",
    quantity: "",
    minStock: "",
    description: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        sku: initialData.sku || "",
        price: initialData.price ?? "", // keep as-is (number or string)
        cost: initialData.cost ?? "",
        quantity: initialData.quantity ?? "",
        minStock: initialData.minStock ?? "",
        description: initialData.description || "",
      });
    } else {
      // reset
      setForm({
        name: "",
        sku: "",
        price: "",
        cost: "",
        quantity: "",
        minStock: "",
        description: "",
      });
    }
  }, [initialData, open]); // ← keep open if you want reset on reopen

  const handleChange = (e) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ensure price and cost are numbers before submit
    const submitForm = {
      ...form,
      price: form.price === "" ? 0 : Number(form.price),
      cost: form.cost === "" ? 0 : Number(form.cost),
      quantity: form.quantity === "" ? 0 : Number(form.quantity),
      minStock: form.minStock === "" ? 0 : Number(form.minStock),
    };
    console.log("Submitting product:", submitForm);
    onSubmit(submitForm);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<span className="text-xl font-bold text-gray-900">{initialData ? "Edit Product" : "Add Product"}</span>}
    >
      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product info */}
        <div className="grid gap-4">
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Product Name"
            required
            className="text-gray-900"
            labelClassName="text-gray-700"
          />

          <Input
            name="sku"
            value={form.sku}
            onChange={handleChange}
            placeholder="SKU Code"
            required
            className="text-gray-900"
            labelClassName="text-gray-700"
          />
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4">
          <CurrencyInput
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Selling Price"
            required
            className=" w-full px-3 py-2.5
        border border-gray-300
        rounded-md
        text-sm text-gray-900
        bg-white
        placeholder:text-gray-400
        transition
        focus:outline-none
        focus:ring-2 focus:ring-indigo-500/30
        focus:border-indigo-500
        disabled:bg-gray-100 disabled:cursor-not-allowed"
            labelClassName="text-gray-700"
          />

          <CurrencyInput
            name="cost"
            value={form.cost}
            onChange={handleChange}
            placeholder="Cost Price"
            required
            className=" w-full px-3 py-2.5
        border border-gray-300
        rounded-md
        text-sm text-gray-900
        bg-white
        placeholder:text-gray-400
        transition
        focus:outline-none
        focus:ring-2 focus:ring-indigo-500/30
        focus:border-indigo-500
        disabled:bg-gray-100 disabled:cursor-not-allowed"
            labelClassName="text-gray-700"
          />
        </div>

        {/* Inventory */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            type="number"
            min="0"
            required
            className="text-gray-900"
            labelClassName="text-gray-700"
          />

          <Input
            name="minStock"
            value={form.minStock}
            onChange={handleChange}
            placeholder="Minimum Stock"
            type="number"
            min="0"
            required
            className="text-gray-900"
            labelClassName="text-gray-700"
          />
        </div>

        <Input
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Product Description"
          className="text-gray-900"
          labelClassName="text-gray-700"
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : initialData
                ? "Update Product"
                : "Create Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
