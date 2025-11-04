import { useState, useEffect } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, Copy, Check, Calendar, Mail, User, Home } from 'lucide-react';
import { supabase } from '../../services/supabaseService';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  property_id: string;
  property_title: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  message: string;
  message_type: string;
  status: string;
  sender_name: string;
  sender_email: string;
  recipient_name: string;
  recipient_email: string;
  viewing_date: string | null;
  viewing_time: string | null;
  viewing_notes: string | null;
  created_at: string;
  updated_at: string;
  read_at: string | null;
  replied_at: string | null;
}

interface Conversation {
  otherUserId: string;
  otherUserName: string;
  otherUserEmail: string;
  messages: Message[];
  lastMessageDate: string;
  unreadCount: number;
}

interface UserChatViewerProps {
  userId: string;
  userName: string;
  userEmail: string;
}

export function UserChatViewer({ userId, userName, userEmail }: UserChatViewerProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedConversations, setExpandedConversations] = useState<Set<string>>(new Set());
  const [copiedConversation, setCopiedConversation] = useState<string | null>(null);

  useEffect(() => {
    loadUserMessages();
  }, [userId]);

  const loadUserMessages = async () => {
    try {
      setLoading(true);
      
      // First, try to get ALL messages to check if RLS is blocking
      console.log('🔍 Attempting to load ALL messages (admin check)...');
      const { data: allMessages } = await supabase
        .from('messages')
        .select('*')
        .limit(10);
      
      console.log('📊 Total accessible messages:', allMessages?.length || 0);
      if (allMessages && allMessages.length > 0) {
        console.log('📝 Sample message:', allMessages[0]);
        console.log('👥 Unique sender IDs:', [...new Set(allMessages.map(m => m.sender_id))]);
        console.log('👥 Unique recipient IDs:', [...new Set(allMessages.map(m => m.recipient_id))]);
      }
      
      // Now get messages for specific user
      console.log('🔍 Loading messages for user:', userId);
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading messages:', error);
        throw error;
      }

      console.log('✅ Loaded messages for user:', userId, 'Count:', messages?.length || 0);

      // Fetch all unique user IDs from messages
      const userIds = new Set<string>();
      messages?.forEach((msg: Message) => {
        userIds.add(msg.sender_id);
        userIds.add(msg.recipient_id);
      });

      // Fetch profiles for all users involved in conversations
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .in('id', Array.from(userIds));

      console.log('✅ Fetched profiles:', profiles?.length || 0);

      // Create profile lookup map
      const profileMap = new Map(
        profiles?.map(p => [p.id, { display_name: p.display_name || 'Onbekend', email: p.email }]) || []
      );

      // Group messages by conversation (other user)
      const conversationMap = new Map<string, Conversation>();

      messages?.forEach((msg: Message) => {
        const isUserSender = msg.sender_id === userId;
        const otherUserId = isUserSender ? msg.recipient_id : msg.sender_id;
        const otherUserProfile = profileMap.get(otherUserId);
        const otherUserName = otherUserProfile?.display_name || 'Onbekend';
        const otherUserEmail = otherUserProfile?.email || 'Onbekend';

        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            otherUserId,
            otherUserName,
            otherUserEmail,
            messages: [],
            lastMessageDate: msg.created_at,
            unreadCount: 0,
          });
        }

        const conversation = conversationMap.get(otherUserId)!;
        conversation.messages.push(msg);
        
        // Count unread messages where user is recipient
        if (!isUserSender && msg.status === 'unread') {
          conversation.unreadCount++;
        }
      });

      // Convert map to array and sort by last message date
      const conversationsArray = Array.from(conversationMap.values()).sort(
        (a, b) => new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime()
      );

      setConversations(conversationsArray);
    } catch (error) {
      console.error('Error loading user messages:', error);
      toast.error('Fout bij het laden van berichten');
    } finally {
      setLoading(false);
    }
  };

  const toggleConversation = (otherUserId: string) => {
    setExpandedConversations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(otherUserId)) {
        newSet.delete(otherUserId);
      } else {
        newSet.add(otherUserId);
      }
      return newSet;
    });
  };

  const copyConversation = async (conversation: Conversation) => {
    try {
      // Sort messages by date (oldest first for reading)
      const sortedMessages = [...conversation.messages].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      // Format conversation as readable text
      let conversationText = `Gesprek tussen ${userName} en ${conversation.otherUserName}\n`;
      conversationText += `Email: ${userEmail} ↔ ${conversation.otherUserEmail}\n`;
      conversationText += `Aantal berichten: ${conversation.messages.length}\n`;
      conversationText += `Laatste bericht: ${new Date(conversation.lastMessageDate).toLocaleString('nl-NL')}\n`;
      conversationText += `\n${'='.repeat(80)}\n\n`;

      sortedMessages.forEach((msg, index) => {
        const isUserSender = msg.sender_id === userId;
        const senderLabel = isUserSender ? userName : conversation.otherUserName;
        const date = new Date(msg.created_at).toLocaleString('nl-NL');

        conversationText += `Bericht ${index + 1} - ${date}\n`;
        conversationText += `Van: ${senderLabel} (${isUserSender ? userEmail : conversation.otherUserEmail})\n`;
        conversationText += `Aan: ${isUserSender ? conversation.otherUserName : userName} (${isUserSender ? conversation.otherUserEmail : userEmail})\n`;
        conversationText += `Eigendom: ${msg.property_title}\n`;
        conversationText += `Onderwerp: ${msg.subject}\n`;
        conversationText += `Status: ${msg.status}\n`;
        
        if (msg.viewing_date) {
          conversationText += `Bezichtigingsdatum: ${msg.viewing_date}`;
          if (msg.viewing_time) conversationText += ` om ${msg.viewing_time}`;
          conversationText += `\n`;
        }
        
        conversationText += `\nBericht:\n${msg.message}\n`;
        
        if (msg.viewing_notes) {
          conversationText += `\nNotities: ${msg.viewing_notes}\n`;
        }
        
        conversationText += `\n${'-'.repeat(80)}\n\n`;
      });

      await navigator.clipboard.writeText(conversationText);
      setCopiedConversation(conversation.otherUserId);
      toast.success('Gesprek gekopieerd naar klembord');
      
      setTimeout(() => setCopiedConversation(null), 2000);
    } catch (error) {
      console.error('Error copying conversation:', error);
      toast.error('Fout bij het kopiëren van gesprek');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Gesprekken laden...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">Geen gesprekken gevonden</p>
        <p className="text-sm mt-2">Deze gebruiker heeft nog geen berichten verzonden of ontvangen</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Chatgesprekken ({conversations.length})
        </h3>
        <p className="text-sm text-gray-500">
          Totaal {conversations.reduce((sum, conv) => sum + conv.messages.length, 0)} berichten
        </p>
      </div>

      {conversations.map((conversation) => {
        const isExpanded = expandedConversations.has(conversation.otherUserId);
        const isCopied = copiedConversation === conversation.otherUserId;

        return (
          <div
            key={conversation.otherUserId}
            className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Conversation Header */}
            <div
              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 cursor-pointer hover:from-blue-100 hover:to-cyan-100 transition-colors"
              onClick={() => toggleConversation(conversation.otherUserId)}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-blue-100 rounded-full">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {conversation.otherUserName}
                    </h4>
                    {conversation.unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {conversation.otherUserEmail}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {conversation.messages.length} berichten
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(conversation.lastMessageDate).toLocaleDateString('nl-NL')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyConversation(conversation);
                  }}
                  className="p-2 text-gray-600 hover:bg-white hover:text-blue-600 rounded-lg transition-colors"
                  title="Kopieer gesprek"
                >
                  {isCopied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </div>
            </div>

            {/* Conversation Messages */}
            {isExpanded && (
              <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto bg-gray-50">
                {[...conversation.messages]
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  .map((message) => {
                    const isUserSender = message.sender_id === userId;

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isUserSender ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-4 shadow-sm ${
                            isUserSender
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          {/* Message Header */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 flex-shrink-0" />
                              <span className="font-semibold text-sm">
                                {isUserSender ? userName : conversation.otherUserName}
                              </span>
                            </div>
                            <span
                              className={`text-xs ${
                                isUserSender ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              {new Date(message.created_at).toLocaleString('nl-NL', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          {/* Property Info */}
                          <div
                            className={`flex items-center gap-2 text-xs mb-2 pb-2 border-b ${
                              isUserSender ? 'border-blue-400' : 'border-gray-200'
                            }`}
                          >
                            <Home className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{message.property_title}</span>
                          </div>

                          {/* Subject */}
                          <div className="font-semibold text-sm mb-2">{message.subject}</div>

                          {/* Message Content */}
                          <div className="text-sm whitespace-pre-wrap break-words">
                            {message.message}
                          </div>

                          {/* Viewing Request Info */}
                          {message.viewing_date && (
                            <div
                              className={`mt-3 pt-3 border-t text-sm ${
                                isUserSender ? 'border-blue-400' : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-center gap-2 font-semibold mb-1">
                                <Calendar className="w-4 h-4" />
                                Bezichtigingsverzoek
                              </div>
                              <div className="ml-6">
                                <p>
                                  Datum: {message.viewing_date}
                                  {message.viewing_time && ` om ${message.viewing_time}`}
                                </p>
                                {message.viewing_notes && (
                                  <p className="mt-1 text-xs">
                                    Notities: {message.viewing_notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Status Badge */}
                          <div className="mt-2 flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                isUserSender
                                  ? 'bg-blue-500 text-blue-50'
                                  : message.status === 'unread'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : message.status === 'read'
                                  ? 'bg-green-100 text-green-800'
                                  : message.status === 'replied'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {message.status === 'unread'
                                ? 'Ongelezen'
                                : message.status === 'read'
                                ? 'Gelezen'
                                : message.status === 'replied'
                                ? 'Beantwoord'
                                : message.status === 'archived'
                                ? 'Gearchiveerd'
                                : message.status}
                            </span>
                            <span
                              className={`text-xs ${
                                isUserSender ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              {message.message_type === 'inquiry'
                                ? 'Vraag'
                                : message.message_type === 'viewing_request'
                                ? 'Bezichtiging'
                                : 'Algemeen'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
