export function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "";
  return "₦" + Number(value).toLocaleString();
}
