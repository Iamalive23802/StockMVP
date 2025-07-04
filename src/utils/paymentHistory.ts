export interface PaymentEntry {
  amount: string;
  date: string;
  utr?: string;
  status?: 'approved' | 'pending';
}

export const parsePaymentHistory = (history?: string): PaymentEntry[] => {
  if (!history) return [];
  return history.split('|||').map(entry => {
    const [amount = '', date = '', utr = '', status = 'approved'] = entry.split('__');
    return { amount, date, utr, status: status as 'approved' | 'pending' };
  });
};

export const stringifyPaymentHistory = (entries: PaymentEntry[]): string => {
  return entries
    .map(e => [e.amount, e.date, e.utr || '', e.status || 'approved'].join('__'))
    .join('|||');
};
