import { supabase } from '../config/supabase.config';
import { Message, SendMessageRequest, MessageFilters, MessageStats } from '../types';

export class MessageService {
  // Send a new message
  static async sendMessage(data: SendMessageRequest): Promise<{ success: boolean; message?: Message; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get property information for the subject
      const { data: property } = await supabase
        .from('properties')
        .select('title')
        .eq('id', data.property_id)
        .single();

      const messageData = {
        property_id: data.property_id,
        sender_id: user.id,
        recipient_id: data.recipient_id,
        subject: data.subject || `Vraag over: ${property?.title || 'Eigendom'}`,
        message: data.message,
        message_type: data.message_type || 'inquiry',
        contact_info: {
          viewing_date: data.viewing_date || null,
          viewing_time: data.viewing_time || null,
          viewing_notes: data.viewing_notes || null,
        },
      };

      const { data: result, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return { success: false, error: error.message };
      }

      return { success: true, message: result };
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return { success: false, error: 'Failed to send message' };
    }
  }

  // Reply to a message
  static async replyToMessage(
    originalMessageId: string, 
    replyMessage: string
  ): Promise<{ success: boolean; message?: Message; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get the original message to determine reply details
      const { data: originalMessage, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('id', originalMessageId)
        .single();

      if (fetchError || !originalMessage) {
        return { success: false, error: 'Original message not found' };
      }

      // Determine sender and recipient for the reply
      const replyData = {
        property_id: originalMessage.property_id,
        sender_id: user.id,
        recipient_id: originalMessage.sender_id === user.id 
          ? originalMessage.recipient_id 
          : originalMessage.sender_id,
        subject: originalMessage.subject.startsWith('Re: ') 
          ? originalMessage.subject 
          : `Re: ${originalMessage.subject}`,
        message: replyMessage,
        message_type: originalMessage.message_type,
        contact_info: null,
      };

      const { data: result, error } = await supabase
        .from('messages')
        .insert(replyData)
        .select()
        .single();

      if (error) {
        console.error('Error sending reply:', error);
        return { success: false, error: error.message };
      }

      // Mark original message as read if the current user is the recipient
      if (originalMessage.recipient_id === user.id && originalMessage.status === 'unread') {
        await this.markAsRead(originalMessageId);
      }

      return { success: true, message: result };
    } catch (error) {
      console.error('Error in replyToMessage:', error);
      return { success: false, error: 'Failed to send reply' };
    }
  }

  // Get messages for a user with filtering and pagination
  static async getMessages(
    filters: MessageFilters = {},
    limit: number = 50,
    offset: number = 0
  ): Promise<{ success: boolean; messages?: any[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      let query = supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply folder filter
      if (filters.folder === 'inbox') {
        query = query.eq('recipient_id', user.id);
      } else if (filters.folder === 'sent') {
        query = query.eq('sender_id', user.id);
      } else {
        // 'all' or no folder specified - show both sent and received
        query = query.or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);
      }

      // Apply status filter
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Apply message type filter
      if (filters.message_type) {
        query = query.eq('message_type', filters.message_type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching messages:', error);
        return { success: false, error: error.message };
      }

      return { success: true, messages: data || [] };
    } catch (error) {
      console.error('Error in getMessages:', error);
      return { success: false, error: 'Failed to fetch messages' };
    }
  }

  // Mark a message as read
  static async markAsRead(messageId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase.rpc('mark_message_as_read', {
        message_id: messageId
      });

      if (error) {
        console.error('Error marking message as read:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return { success: false, error: 'Failed to mark message as read' };
    }
  }

  // Get unread message count
  static async getUnreadCount(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase.rpc('get_unread_message_count');

      if (error) {
        console.error('Error getting unread count:', error);
        return { success: false, error: error.message };
      }

      return { success: true, count: data || 0 };
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return { success: false, error: 'Failed to get unread count' };
    }
  }

  // Update message status
  static async updateMessageStatus(
    messageId: string, 
    status: 'unread' | 'read' | 'archived'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const updateData: any = { status };
      
      // Set timestamps based on status
      if (status === 'read') {
        updateData.read_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('messages')
        .update(updateData)
        .eq('id', messageId)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);

      if (error) {
        console.error('Error updating message status:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateMessageStatus:', error);
      return { success: false, error: 'Failed to update message status' };
    }
  }

  // Get message statistics for dashboard
  static async getMessageStats(): Promise<{ success: boolean; stats?: MessageStats; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('messages')
        .select('status')
        .eq('recipient_id', user.id);

      if (error) {
        console.error('Error getting message stats:', error);
        return { success: false, error: error.message };
      }

      const stats: MessageStats = {
        total: data.length,
        unread: data.filter((m: any) => m.status === 'unread').length,
        archived: data.filter((m: any) => m.status === 'archived').length,
      };

      return { success: true, stats };
    } catch (error) {
      console.error('Error in getMessageStats:', error);
      return { success: false, error: 'Failed to get message stats' };
    }
  }

  // Get a single message by ID
  static async getMessage(messageId: string): Promise<{ success: boolean; message?: Message; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .single();

      if (error) {
        console.error('Error fetching message:', error);
        return { success: false, error: error.message };
      }

      return { success: true, message: data };
    } catch (error) {
      console.error('Error in getMessage:', error);
      return { success: false, error: 'Failed to fetch message' };
    }
  }

  // Delete a message (only sender can delete)
  static async deleteMessage(messageId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) {
        console.error('Error deleting message:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteMessage:', error);
      return { success: false, error: 'Failed to delete message' };
    }
  }

  // Real-time subscription to messages
  static subscribeToMessages(
    userId: string,
    callback: (message: Message) => void
  ) {
    return supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload: any) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  }
}
