import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Calendar, 
  Home, 
  ArrowLeft,
  Send,
  RefreshCw
} from 'lucide-react';
import { MessageService } from '../../services/messageService';
import { Message, MessageFilters } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

interface ConversationsDashboardProps {
  title?: string;
  className?: string;
}

interface Conversation {
  id: string;
  property_id: string;
  property_title: string;
  participants: string[];
  participant_names: { [key: string]: string };
  messages: Message[];
  lastMessage: Message;
  unreadCount: number;
  totalMessages: number;
  created_at: string;
  updated_at: string;
}

export function ConversationsDashboard({ title = "Berichten", className = "" }: ConversationsDashboardProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  const [filters, setFilters] = useState<MessageFilters>({
    folder: 'inbox',
    status: undefined,
    message_type: undefined
  });

  useEffect(() => {
    loadConversations();
  }, [filters]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const result = await MessageService.getConversations(filters);
      if (result.success && result.conversations) {
        setConversations(result.conversations);
      } else {
        toast.error(result.error || 'Fout bij het laden van gesprekken');
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Fout bij het laden van gesprekken');
    } finally {
      setLoading(false);
    }
  };

  const loadConversationMessages = async (conversation: Conversation) => {
    try {
      const result = await MessageService.getConversationMessages(conversation.id);
      if (result.success && result.messages) {
        setConversationMessages(result.messages);
        setSelectedConversation(conversation);
        
        // Mark messages as read
        const unreadMessages = result.messages.filter(
          msg => msg.status === 'unread' && msg.recipient_id === user?.id
        );
        
        for (const message of unreadMessages) {
          await MessageService.markAsRead(message.id);
        }
        
        // Refresh conversations to update unread counts
        loadConversations();
      } else {
        toast.error(result.error || 'Fout bij het laden van berichten');
      }
    } catch (error) {
      console.error('Error loading conversation messages:', error);
      toast.error('Fout bij het laden van berichten');
    }
  };

  const handleSendReply = async () => {
    if (!selectedConversation || !replyMessage.trim()) return;

    setSending(true);
    try {
      // Find the last message to reply to
      const lastMessage = conversationMessages[conversationMessages.length - 1];
      
      const result = await MessageService.replyToMessage(lastMessage.id, replyMessage.trim());
      
      if (result.success) {
        setReplyMessage('');
        // Reload conversation messages
        await loadConversationMessages(selectedConversation);
        toast.success('Bericht verzonden!');
      } else {
        toast.error(result.error || 'Fout bij het verzenden van bericht');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Fout bij het verzenden van bericht');
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipantName = (conversation: Conversation) => {
    if (!user) return 'Onbekend';
    const otherParticipant = conversation.participants.find(p => p !== user.id);
    return otherParticipant ? conversation.participant_names[otherParticipant] || 'Onbekend' : 'Onbekend';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('nl-NL', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
    }
  };

  if (selectedConversation) {
    return (
      <div className={`bg-white rounded-lg shadow-sm ${className}`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedConversation(null)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold">{getOtherParticipantName(selectedConversation)}</h2>
              <p className="text-sm text-gray-600">{selectedConversation.property_title}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col h-96">
          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {conversationMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender_id === user?.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatDate(message.created_at)}
                  </p>
                  {message.viewing_date && (
                    <div className={`text-xs mt-1 flex items-center gap-1 ${
                      message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <Calendar className="w-3 h-3" />
                      <span>
                        Bezichtiging: {new Date(message.viewing_date).toLocaleDateString('nl-NL')}
                        {message.viewing_time && ` om ${message.viewing_time}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Reply Form */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type uw bericht..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendReply();
                  }
                }}
                disabled={sending}
              />
              <button
                onClick={handleSendReply}
                disabled={sending || !replyMessage.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Verzenden...' : 'Verzenden'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={() => {
              setRefreshing(true);
              loadConversations().finally(() => setRefreshing(false));
            }}
            disabled={refreshing}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-4">
          {['inbox', 'sent', 'archived'].map((folder) => (
            <button
              key={folder}
              onClick={() => setFilters({ ...filters, folder: folder as any })}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filters.folder === folder
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {folder === 'inbox' ? 'Inbox' : folder === 'sent' ? 'Verzonden' : 'Gearchiveerd'}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin mx-auto mb-4 w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <p>Gesprekken laden...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Geen gesprekken gevonden</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                conversation.unreadCount > 0 ? 'bg-blue-50' : ''
              }`}
              onClick={() => loadConversationMessages(conversation)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 mt-1">
                    <MessageSquare className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium truncate ${
                        conversation.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {getOtherParticipantName(conversation)}
                      </h3>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <Home className="w-3 h-3" />
                      <span>{conversation.property_title}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {conversation.lastMessage?.message || 'Geen berichten'}
                    </p>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 ml-2">
                  {formatDate(conversation.updated_at)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}