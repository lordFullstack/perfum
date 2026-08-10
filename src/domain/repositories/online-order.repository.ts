import type { OnlineOrder, OnlineOrderStatus } from "@/domain/entities/online-order.entity";

export interface OnlineOrderRepository {
  listOrders(): Promise<OnlineOrder[]>;
  updateStatus(orderId: string, status: OnlineOrderStatus): Promise<OnlineOrder>;
}
