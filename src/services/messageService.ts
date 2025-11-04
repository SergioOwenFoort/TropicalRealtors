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

      // Get user profile for sender info
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', user.id)
        .single();

      // Get recipient profile info  
      const { data: recipientProfile } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', data.recipient_id)
        .single();

      // Data to insert into messages table (only fields that exist in the table)
      const messageData = {
        property_id: data.property_id,
        sender_id: user.id,
        recipient_id: data.recipient_id,
        subject: data.subject || `Vraag over: ${property?.title || 'Eigendom'}`,
        message: data.message,
        message_type: data.message_type || 'inquiry',
      };

      console.log('Attempting to insert message with data:', messageData);
      
      const { data: result, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        console.error('Error details:', error.details, error.hint, error.code);
        return { success: false, error: error.message };
      }

      // Send email notification to recipient (fire and forget)
      try {
        const recipientEmail = recipientProfile?.email || '';
        const recipientName = recipientProfile?.display_name || 'Onbekend';
        const senderName = profile?.display_name || 'Onbekend';
        const propertyTitle = property?.title || 'Eigendom';
        
        console.log('📧 Attempting to send email notification to:', recipientEmail);
        
        if (!recipientEmail) {
          console.warn('⚠️ No recipient email found, skipping email notification');
        } else {
          const emailResponse = await fetch('/.netlify/functions/send-message-notification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              recipient_email: recipientEmail,
              recipient_name: recipientName,
              sender_name: senderName,
              property_title: propertyTitle,
              subject: messageData.subject,
              message: messageData.message,
              viewing_date: data.viewing_date || null,
              viewing_time: data.viewing_time || null,
              viewing_notes: data.viewing_notes || null,
            }),
          });

          const emailResult = await emailResponse.json();
          
          if (!emailResponse.ok) {
            console.error('❌ Email notification failed:', emailResult);
          } else {
            console.log('✅ Email notification sent successfully:', emailResult);
          }
        }
      } catch (emailError) {
        // Don't fail the message sending if email fails
        console.error('❌ Failed to send email notification:', emailError);
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

  // Get conversations grouped by participants and property
  static async getConversations(
    filters: MessageFilters = {}
  ): Promise<{ success: boolean; conversations?: any[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get all messages for the user - using only core fields that definitely exist
      let query = supabase
        .from('messages')
        .select(`
          id,
          property_id,
          sender_id,
          recipient_id,
          subject,
          message,
          message_type,
          status,
          created_at,
          updated_at
        `);

      // Filter by user (either sender or recipient)
      if (filters.folder === 'sent') {
        query = query.eq('sender_id', user.id);
      } else if (filters.folder === 'archived') {
        query = query
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .eq('status', 'archived');
      } else {
        // inbox or all
        query = query.or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);
      }

      // Apply additional filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.message_type) {
        query = query.eq('message_type', filters.message_type);
      }

      const { data: messages, error } = await query
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        return { success: false, error: error.message };
      }

      // Group messages into conversations
      const conversationMap = new Map();

      // Get property and user info for the conversations
      const propertyIds = [...new Set(messages?.map(m => m.property_id))];
      const userIds = [...new Set(messages?.flatMap(m => [m.sender_id, m.recipient_id]))];

      // Fetch property titles
      const { data: properties } = await supabase
        .from('properties')
        .select('id, title')
        .in('id', propertyIds);

      // Fetch user profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds);

      // Create lookup maps
      const propertyMap = new Map(properties?.map(p => [p.id, p.title]) || []);
      const profileMap = new Map(profiles?.map(p => [p.id, p.display_name || 'Onbekend']) || []);

      messages?.forEach(message => {
        // Create a conversation key based on property and participants
        const participants = [message.sender_id, message.recipient_id].sort();
        const conversationKey = `${message.property_id}|${participants.join('|')}`;
        
        if (!conversationMap.has(conversationKey)) {
          conversationMap.set(conversationKey, {
            id: conversationKey,
            property_id: message.property_id,
            property_title: propertyMap.get(message.property_id) || 'Eigendom',
            participants: participants,
            participant_names: {
              [message.sender_id]: profileMap.get(message.sender_id) || 'Onbekend',
              [message.recipient_id]: profileMap.get(message.recipient_id) || 'Onbekend'
            },
            messages: [],
            lastMessage: null,
            unreadCount: 0,
            totalMessages: 0,
            created_at: message.created_at,
            updated_at: message.created_at
          });
        }

        const conversation = conversationMap.get(conversationKey);
        conversation.messages.push(message);
        conversation.totalMessages++;
        
        // Update last message if this is more recent
        if (!conversation.lastMessage || new Date(message.created_at) > new Date(conversation.lastMessage.created_at)) {
          conversation.lastMessage = message;
          conversation.updated_at = message.created_at;
        }

        // Count unread messages for current user
        if (message.status === 'unread' && message.recipient_id === user.id) {
          conversation.unreadCount++;
        }
      });

      // Convert map to array and sort by last message date
      const conversations = Array.from(conversationMap.values())
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      return { success: true, conversations };
    } catch (error) {
      console.error('Error in getConversations:', error);
      return { success: false, error: 'Failed to fetch conversations' };
    }
  }

  // Get messages for a specific conversation
  static async getConversationMessages(
    conversationId: string
  ): Promise<{ success: boolean; messages?: Message[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Parse conversation ID to get property and participants
      // Format: propertyId|participant1UUID|participant2UUID
      const parts = conversationId.split('|');
      const propertyId = parts[0];
      const participants = parts.slice(1);

      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          property_id,
          sender_id,
          recipient_id,
          subject,
          message,
          message_type,
          status,
          created_at,
          updated_at
        `)
        .eq('property_id', propertyId)
        .or(`sender_id.in.(${participants.map(p => `"${p}"`).join(',')}),recipient_id.in.(${participants.map(p => `"${p}"`).join(',')})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching conversation messages:', error);
        return { success: false, error: error.message };
      }

      // Enhance messages with property and user info
      if (messages && messages.length > 0) {
        // Get property info
        const { data: property } = await supabase
          .from('properties')
          .select('id, title')
          .eq('id', propertyId)
          .single();

        // Get user profiles
        const userIds = [...new Set(messages.flatMap(m => [m.sender_id, m.recipient_id]))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p.display_name || 'Onbekend']) || []);

        // Enhance each message
        messages.forEach(message => {
          (message as any).property_title = property?.title || 'Eigendom';
          (message as any).sender_name = profileMap.get(message.sender_id) || 'Onbekend';
          (message as any).recipient_name = profileMap.get(message.recipient_id) || 'Onbekend';
        });
      }

      return { success: true, messages: messages || [] };
    } catch (error) {
      console.error('Error in getConversationMessages:', error);
      return { success: false, error: 'Failed to fetch conversation messages' };
    }
  }
}
