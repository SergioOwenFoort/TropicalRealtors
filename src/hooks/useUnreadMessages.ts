import { useState, useEffect } from 'react';
import { MessageService } from '../services/messageService';
import { useAuth } from './useAuth';

export function useUnreadMessages() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const loadUnreadCount = async () => {
      try {
        const result = await MessageService.getUnreadCount();
        if (result.success) {
          setUnreadCount(result.count || 0);
        }
      } catch (error) {
        console.error('Error loading unread count:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUnreadCount();

    // Set up real-time subscription for new messages
    const subscription = MessageService.subscribeToMessages(user.id, () => {
      // Reload count when new message arrives
      loadUnreadCount();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return { unreadCount, loading };
}
