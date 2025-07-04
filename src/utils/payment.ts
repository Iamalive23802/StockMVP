export interface PaymentEntry {
  amount: string;
  date: string;
  utr: string;
  approved: boolean;
  /** Local-only flag to indicate entry hasn't been saved yet */
  isNew?: boolean;
}

export function parsePaymentHistory(str?: string): PaymentEntry[] {
  if (!str) return [];
  return str.split('|||').map(entry => {
    const parts = entry.split('__');
    return {
      amount: parts[0] || '',
      date: parts[1] || new Date().toISOString(),
      utr: parts[2] || '',
      approved: parts[3] ? parts[3] === '1' || parts[3] === 'true' : true,
      isNew: false,
    } as PaymentEntry;
  });
}

export function serializePaymentHistory(entries: PaymentEntry[]): string {
  return entries
    .map(({ amount, date, utr, approved }) =>
      `${amount}__${date}__${utr || ''}__${approved ? '1' : '0'}`,
    )
    .join('|||');
}
