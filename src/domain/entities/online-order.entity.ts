export type OnlineOrderStatus = "pending" | "contacted" | "fulfilled" | "cancelled";

export interface OnlineOrderItem {
  id: string;
  perfumeId: string;
  perfumeName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OnlineOrderItemDraft {
  perfumeId: string;
  quantity: number;
}

export interface OnlineOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  notes: string | null;
  total: number;
  status: OnlineOrderStatus;
  createdAt: string;
  items: OnlineOrderItem[];
}
