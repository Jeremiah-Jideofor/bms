import { useState, useEffect } from "react";

export default function CurrencyInput({
  value,           // can be number | string | "" | null
  onChange,
  name,
  placeholder = "",
  disabled = false,
  required = false,
  labelClassName,
  ...props
}) {
  const [display, setDisplay] = useState("");
  const [error, setError] = useState("");

  // Better format that handles number or string safely
  const formatCurrency = (val) => {
    if (val == null || val === "") return "";

    const num = Number(String(val).replace(/[^\d.]/g, ""));
    if (isNaN(num)) return "";

    return "₦" + num.toLocaleString("en-US");
  };

  useEffect(() => {
    setDisplay(formatCurrency(value));
  }, [value]);

  const parseNumber = (str) => {
    if (!str) return "";
    const cleaned = str.replace(/[^\d]/g, "");
    if (cleaned === "") return "";
    return Number(cleaned);
  };

  const handleInput = (e) => {
    const cleaned = e.target.value.replace(/[^\d]/g, "");

    if (!cleaned) {
      setDisplay("");
      onChange({ target: { name, value: "" } });
      return;
    }

    const number = Number(cleaned);

    setDisplay("₦" + number.toLocaleString("en-US"));

    onChange({
      target: { name, value: number }
    });

    setError("");
  };

  const handleBlur = () => {
    // Re-format from current prop value (should be latest)
    setDisplay(formatCurrency(value));

    if (required && (value == null || value === "" || Number(value) <= 0)) {
      setError("Amount is required and must be greater than zero");
    } else {
      setError("");
    }
  };

  return (
    <div>
      <input
        type="text"
        name={name}
        value={display}
        onChange={handleInput}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        inputMode="numeric"
        className={`w-full px-3 py-2.5 border ${error ? "border-red-500" : "border-gray-300"
          } rounded-md shadow-sm text-sm text-gray-900 bg-white placeholder:text-gray-400 transition focus:outline-none focus:ring-2 ${error ? "focus:ring-red-500/30 focus:border-red-500" : "focus:ring-indigo-500/30 focus:border-indigo-500"} disabled:bg-gray-100 disabled:cursor-not-allowed`}
        {...props}
      />
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  );
}