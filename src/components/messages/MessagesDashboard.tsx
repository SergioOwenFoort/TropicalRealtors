import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  MessageSquare, 
  Calendar, 
  Clock, 
  User, 
  Home, 
  CheckCircle,
  ArchiveIcon,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  RefreshCw
} from 'lucide-react';
import { MessageService } from '../../services/messageService';
import { Message, MessageFilters, MessageStats } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

interface MessagesDashboardProps {
  title?: string;
  className?: string;
}

export function MessagesDashboard({ title = "Berichten", className = "" }: MessagesDashboardProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [stats, setStats] = useState<MessageStats>({ total: 0, unread: 0, replied: 0, archived: 0 });
  
  const [filters, setFilters] = useState<MessageFilters>({
    folder: 'inbox',
    status: undefined,
    message_type: undefined
  });

  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    hasMore: true
  });

  useEffect(() => {
    loadMessages();
    loadStats();
  }, [filters]);

  useEffect(() => {
    if (!user) return;

    // Set up real-time subscription for new messages
    const subscription = MessageService.subscribeToMessages(user.id, (newMessage) => {
      setMessages(prev => [newMessage, ...prev]);
      loadStats(); // Refresh stats when new message arrives
      toast.success(`Nieuw bericht ontvangen`);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const loadMessages = async (append = false) => {
    try {
      if (!append) setLoading(true);
      
      const result = await MessageService.getMessages(
        filters,
        pagination.limit,
        append ? pagination.offset : 0
      );

      if (result.success && result.messages) {
        if (append) {
          setMessages(prev => [...prev, ...result.messages!]);
        } else {
          setMessages(result.messages);
        }
        
        setPagination(prev => ({
          ...prev,
          hasMore: result.messages!.length === pagination.limit,
          offset: append ? prev.offset + pagination.limit : pagination.limit
        }));
      } else {
        toast.error(result.error || 'Fout bij laden van berichten');
      }
    } catch (error) {
      toast.error('Fout bij laden van berichten');
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await MessageService.getMessageStats();
      if (result.success && result.stats) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error loading message stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setPagination(prev => ({ ...prev, offset: 0 }));
    await loadMessages();
    await loadStats();
  };

  const handleMarkAsRead = async (message: Message) => {
    if (message.status === 'read') return;

    try {
      const result = await MessageService.markAsRead(message.id);
      if (result.success) {
        setMessages(prev => 
          prev.map(m => 
            m.id === message.id 
              ? { ...m, status: 'read', read_at: new Date().toISOString() }
              : m
          )
        );
        loadStats();
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleStatusChange = async (messageId: string, newStatus: Message['status']) => {
    try {
      const result = await MessageService.updateMessageStatus(messageId, newStatus);
      if (result.success) {
        setMessages(prev => 
          prev.map(m => 
            m.id === messageId 
              ? { ...m, status: newStatus }
              : m
          )
        );
        loadStats();
        toast.success('Status bijgewerkt');
      } else {
        toast.error(result.error || 'Fout bij bijwerken status');
      }
    } catch (error) {
      toast.error('Fout bij bijwerken status');
      console.error('Error updating message status:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString('nl-NL', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('nl-NL', { day: '2-digit', month: 'short' });
    }
  };

  const getMessageTypeIcon = (type: Message['message_type']) => {
    switch (type) {
      case 'viewing_request':
        return <Calendar className="w-4 h-4" />;
      case 'inquiry':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Message['status']) => {
    switch (status) {
      case 'unread':
        return 'text-blue-600 bg-blue-100';
      case 'read':
        return 'text-gray-600 bg-gray-100';
      case 'archived':
        return 'text-gray-500 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: Message['status']) => {
    switch (status) {
      case 'unread':
        return 'Ongelezen';
      case 'read':
        return 'Gelezen';
      case 'archived':
        return 'Gearchiveerd';
      default:
        return status;
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Berichten laden...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">{title}</h2>
            {stats.unread > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.unread}
              </span>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Totaal</div>
            <div className="text-xl font-bold text-blue-900">{stats.total}</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-sm text-red-600 font-medium">Ongelezen</div>
            <div className="text-xl font-bold text-red-900">{stats.unread}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 font-medium">Gearchiveerd</div>
            <div className="text-xl font-bold text-gray-900">{stats.archived}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mt-4">
          <select
            value={filters.folder || 'inbox'}
            onChange={(e) => setFilters(prev => ({ ...prev, folder: e.target.value as any }))}
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="inbox">Inbox</option>
            <option value="sent">Verzonden</option>
            <option value="all">Alle berichten</option>
          </select>

          <select
            value={filters.status || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any || undefined }))}
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Alle statussen</option>
            <option value="unread">Ongelezen</option>
            <option value="read">Gelezen</option>
            <option value="replied">Beantwoord</option>
            <option value="archived">Gearchiveerd</option>
          </select>

          <select
            value={filters.message_type || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, message_type: e.target.value as any || undefined }))}
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Alle types</option>
            <option value="inquiry">Algemene vraag</option>
            <option value="viewing_request">Bezichtiging</option>
            <option value="general">Overig</option>
          </select>
        </div>
      </div>

      {/* Messages List */}
      <div className="divide-y">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Geen berichten gevonden</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                message.status === 'unread' ? 'bg-blue-50' : ''
              }`}
              onClick={() => {
                setSelectedMessage(message);
                handleMarkAsRead(message);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 mt-1">
                    {getMessageTypeIcon(message.message_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium truncate ${
                        message.status === 'unread' ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {filters.folder === 'sent' ? message.recipient_name : message.sender_name}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(message.status)}`}>
                        {getStatusLabel(message.status)}
                      </span>
                    </div>
                    
                    <p className="text-sm font-medium text-gray-900 mb-1">{message.subject}</p>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <Home className="w-3 h-3" />
                      <span>{message.property_title}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                    
                    {message.viewing_date && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Bezichtiging: {new Date(message.viewing_date).toLocaleDateString('nl-NL')}
                          {message.viewing_time && ` om ${message.viewing_time}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2 ml-4">
                  <span className="text-xs text-gray-500">{formatDate(message.created_at)}</span>
                  
                  <div className="flex gap-1">
                    {message.status === 'unread' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(message);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Markeer als gelezen"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    )}
                    
                    {message.status !== 'replied' && filters.folder === 'inbox' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(message.id, 'replied');
                        }}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="Markeer als beantwoord"
                      >
                        <CheckCircle className="w-3 h-3" />
                      </button>
                    )}
                    
                    {message.status !== 'archived' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(message.id, 'archived');
                        }}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        title="Archiveer"
                      >
                        <ArchiveIcon className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {pagination.hasMore && messages.length > 0 && (
        <div className="p-4 border-t">
          <button
            onClick={() => loadMessages(true)}
            disabled={loading}
            className="w-full py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Laden...' : 'Meer berichten laden'}
          </button>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getMessageTypeIcon(selectedMessage.message_type)}
                  <div>
                    <h3 className="text-lg font-semibold">{selectedMessage.subject}</h3>
                    <p className="text-sm text-gray-600">
                      Van: {selectedMessage.sender_name} ({selectedMessage.sender_email})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Home className="w-4 h-4" />
                  <span>{selectedMessage.property_title}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(selectedMessage.created_at).toLocaleString('nl-NL')}</span>
                </div>
              </div>

              {selectedMessage.viewing_date && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Bezichtiging gewenst</span>
                  </div>
                  <p className="text-blue-600 mt-1">
                    Datum: {new Date(selectedMessage.viewing_date).toLocaleDateString('nl-NL')}
                    {selectedMessage.viewing_time && ` om ${selectedMessage.viewing_time}`}
                  </p>
                  {selectedMessage.viewing_notes && (
                    <p className="text-blue-600 text-sm mt-2">
                      Opmerkingen: {selectedMessage.viewing_notes}
                    </p>
                  )}
                </div>
              )}

              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-800">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedMessage.status)}`}>
                  {getStatusLabel(selectedMessage.status)}
                </span>
                
                <div className="flex gap-2">
                  {selectedMessage.status !== 'replied' && filters.folder === 'inbox' && (
                    <button
                      onClick={() => {
                        handleStatusChange(selectedMessage.id, 'replied');
                        setSelectedMessage({ ...selectedMessage, status: 'replied' });
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Markeer als beantwoord
                    </button>
                  )}
                  
                  {selectedMessage.status !== 'archived' && (
                    <button
                      onClick={() => {
                        handleStatusChange(selectedMessage.id, 'archived');
                        setSelectedMessage({ ...selectedMessage, status: 'archived' });
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Archiveer
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
