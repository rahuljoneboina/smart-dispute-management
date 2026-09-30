export type DisputeReason =
  | 'Wrong Quantity'
  | 'Wrong Price'
  | 'Missing Items'
  | 'Tax Problem'
  | 'Damaged Goods'
  | 'Other';

export type DisputeStatus = 'New' | 'In Progress' | 'Resolved' | 'Closed';

export interface Dispute {
  id: string;
  invoiceNumber: string;
  vendor: string;
  amount: number;
  reason: DisputeReason;
  description: string;
  date: string;
  status: DisputeStatus;
}
