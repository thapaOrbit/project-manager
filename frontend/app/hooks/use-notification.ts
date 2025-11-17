import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchData, updateData, deleteData } from '@/lib/fetch-util';
import type { Notification } from '@/types';
import { toast } from 'sonner';

const NOTIFICATIONS_KEY = 'notifications';


export const useNotificationsQuery = (options?: { unreadOnly?: boolean }) => {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, options],
    queryFn: async (): Promise<Notification[]> => {
      const params = new URLSearchParams();
      if (options?.unreadOnly) {
        params.append('unreadOnly', 'true');
      }
      return await fetchData(`/notifications?${params}`);
    },
    refetchInterval: 30000,
  });
};

export const useUnreadCountQuery = () => {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, 'unread-count'],
    queryFn: async (): Promise<{ count: number }> => {
      return await fetchData('/notifications/unread-count');
    },
    refetchInterval: 30000,
  });
};


export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      return await updateData(`/notifications/${notificationId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY, 'unread-count'] });
    },
  });
};


export const useMarkAllAsReadMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return await updateData('/notifications/read-all', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY, 'unread-count'] });
      toast.success('All notifications marked as read');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark all as read');
    },
  });
};


export const useDeleteNotificationMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const result = await deleteData(`/notifications/${notificationId}`);
      return result;
    },
    onSuccess: () => {
    
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY, 'unread-count'] });
      toast.success('Notification deleted successfully');
    },
    onError: (error: any) => {
    
      toast.error(error.response?.data?.message || 'Failed to delete notification');
    },
  });
};