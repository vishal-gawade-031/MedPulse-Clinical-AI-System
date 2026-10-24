import { api } from "./api";
import { NotificationItem } from "../types";

export interface NotificationsResponse {
  success: boolean;
  unreadCount: number;
  data: NotificationItem[];
}

export const notificationService = {
  async getNotifications(): Promise<NotificationsResponse> {
    const res = await api.get<NotificationsResponse>("/notifications");
    return res.data;
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },
};
