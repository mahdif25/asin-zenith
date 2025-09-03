import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/components/ui/use-toast';
import { Bell, TrendingUp, TrendingDown } from 'lucide-react';

interface RealtimeNotification {
  id: string;
  type: 'position_change' | 'tracking_complete' | 'error' | 'info' | 'broadcast';
  title: string;
  message: string;
  timestamp: string;
  data?: any;
}

export const useRealtimeUpdates = () => {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Subscribe to position history changes
    const positionChannel = supabase
      .channel('position-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'position_history',
          filter: `tracking_job_id=in.(SELECT id FROM tracking_jobs WHERE user_id=eq.${user.id})`
        },
        (payload) => {
          const newData = payload.new as any;
          
          // Create notification for significant position changes
          if (newData.organic_position <= 10 || newData.sponsored_position <= 5) {
            const notification: RealtimeNotification = {
              id: `pos-${newData.id}`,
              type: 'position_change',
              title: 'Great Ranking!',
              message: `"${newData.keyword}" reached position ${newData.organic_position || newData.sponsored_position}`,
              timestamp: new Date().toISOString(),
              data: newData
            };

            setNotifications(prev => [notification, ...prev.slice(0, 9)]);
            setUnreadCount(prev => prev + 1);

            toast({
              title: notification.title,
              description: notification.message,
            });
          }
        }
      )
      .subscribe();

    // Subscribe to tracking job updates
    const jobChannel = supabase
      .channel('job-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tracking_jobs',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newData = payload.new as any;
          const oldData = payload.old as any;

          if (newData.last_tracked_at !== oldData.last_tracked_at) {
            const notification: RealtimeNotification = {
              id: `job-${newData.id}`,
              type: 'tracking_complete',
              title: 'Tracking Updated',
              message: `Keywords for ${newData.asin} have been checked`,
              timestamp: new Date().toISOString(),
              data: newData
            };

            setNotifications(prev => [notification, ...prev.slice(0, 9)]);
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    // Subscribe to broadcast messages for system-wide notifications
    const broadcastChannel = supabase
      .channel('system-broadcasts')
      .on('broadcast', { event: 'notification' }, (payload) => {
        const notification: RealtimeNotification = {
          id: `broadcast-${Date.now()}`,
          type: payload.type || 'info',
          title: payload.title || 'System Notification',
          message: payload.message || '',
          timestamp: new Date().toISOString(),
          data: payload.data
        };

        setNotifications(prev => [notification, ...prev.slice(0, 9)]);
        setUnreadCount(prev => prev + 1);

        if (payload.showToast !== false) {
          toast({
            title: notification.title,
            description: notification.message,
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(positionChannel);
      supabase.removeChannel(jobChannel);
      supabase.removeChannel(broadcastChannel);
    };
  }, [user]);

  const markAsRead = (notificationId?: string) => {
    if (notificationId) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n) as any
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } else {
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true }) as any));
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications
  };
};