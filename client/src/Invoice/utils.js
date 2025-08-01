// utils.js
export function formatCurrency(amount) {
  return '₹' + (amount ? Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00');
}
