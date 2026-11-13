// convert pesos to centavos so float math doesn't mess up totals
export function toCentavos(amount: number): number {
  return Math.round(Number(amount) * 100);
}

export function fromCentavos(centavos: number): number {
  return Number((centavos / 100).toFixed(2));
}

export function calcLineTotal(unitPrice: number, quantity: number): number {
  const safeQty = Math.max(0, Math.floor(quantity));
  return fromCentavos(toCentavos(unitPrice) * safeQty);
}

export function calcCartTotal(
  items: Array<{ unitPrice: number; quantity: number }>
): number {
  const totalCentavos = items.reduce((sum, item) => {
    const qty = Math.max(0, Math.floor(item.quantity));
    return sum + toCentavos(item.unitPrice) * qty;
  }, 0);
  return fromCentavos(totalCentavos);
}

export function formatPHP(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `PHP ${safe.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

