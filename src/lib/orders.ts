import { ORDER_PROGRESS_STEPS, OrderStatus } from '@/types';

// valid next statuses from each current status
export function getAllowedNextStatuses(current: OrderStatus): OrderStatus[] {
  if (current === 'Completed' || current === 'Cancelled') {
    return [];
  }

  const idx = ORDER_PROGRESS_STEPS.indexOf(current);
  const next: OrderStatus[] = [];

  // allow moving forward one or more steps in the sequence
  for (let i = idx + 1; i < ORDER_PROGRESS_STEPS.length; i++) {
    next.push(ORDER_PROGRESS_STEPS[i]);
  }

  // cancellation only allowed from Pending or Confirmed
  if (current === 'Pending' || current === 'Confirmed') {
    next.push('Cancelled');
  }

  return next;
}

export function canTransitionOrderStatus(
  from: OrderStatus,
  to: OrderStatus
): boolean {
  if (from === to) return false;
  return getAllowedNextStatuses(from).includes(to);
}

export function shouldRestoreStock(
  from: OrderStatus,
  to: OrderStatus,
  stockRestored: boolean
): boolean {
  if (stockRestored) return false;
  return (from === 'Pending' || from === 'Confirmed') && to === 'Cancelled';
}

