import { useState, useEffect } from 'react';
import { 
  Mail, 
  Calendar, 
  User, 
  Home, 
  ArchiveIcon,
  Eye,
  RefreshCw,
  Send,
  Reply
} from 'lucide-react';
import { MessageService } from '../../services/messageService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

interface MessageData {
  id: string;
  property_id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  message: string;
  message_type: 'inquiry' | 'viewing_request' | 'general';
  status: 'unread' | 'read' | 'archived';
  contact_info: any;
  created_at: string;
  updated_at: string;
  read_at?: string;
  properties?: { title: string };
  sender?: { display_name: string; email: string };
  recipient?: { display_name: string; email: string };
}

interface SimpleMessagesDashboardProps {
  title?: string;
  className?: string;
}

export function SimpleMessagesDashboard({ title = "Berichten", className = "" }: SimpleMessagesDashboardProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<MessageData | null>(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [stats, setStats] = useState({ total: 0, unread: 0, archived: 0 });
  
  const [filters, setFilters] = useState({
    folder: 'inbox' as 'inbox' | 'sent' | 'all',
    status: undefined as 'unread' | 'read' | 'archived' | undefined,
  });

  useEffect(() => {
    if (user) {
      loadMessages();
      loadStats();
    }
  }, [user, filters]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const result = await MessageService.getMessages(filters, 50, 0);
      if (result.success && result.messages) {
        setMessages(result.messages);
      } else {
        console.error('Failed to load messages:', result.error);
        toast.error('Kon berichten niet laden');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Fout bij het laden van berichten');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await MessageService.getMessageStats();
      if (result.success && result.stats) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const result = await MessageService.markAsRead(messageId);
      if (result.success) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, status: 'read' as const, read_at: new Date().toISOString() }
              : msg
          )
        );
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(prev => prev ? { ...prev, status: 'read' as const } : null);
        }
        loadStats();
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Kon bericht niet als gelezen markeren');
    }
  };

  const handleStatusChange = async (messageId: string, status: 'unread' | 'read' | 'archived') => {
    try {
      const result = await MessageService.updateMessageStatus(messageId, status);
      if (result.success) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, status }
              : msg
          )
        );
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(prev => prev ? { ...prev, status } : null);
        }
        loadStats();
        toast.success('Status bijgewerkt');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Kon status niet bijwerken');
    }
  };

  const handleRefresh = () => {
    loadMessages();
    loadStats();
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyMessage.trim()) {
      toast.error('Voer een bericht in');
      return;
    }

    setSendingReply(true);
    try {
      const result = await MessageService.replyToMessage(selectedMessage.id, replyMessage);
      if (result.success) {
        toast.success('Antwoord verzonden!');
        setReplyMessage('');
        setShowReplyForm(false);
        // Refresh messages to show the new reply
        loadMessages();
      } else {
        toast.error('Kon antwoord niet verzenden');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Fout bij verzenden antwoord');
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusColor = (status: string) => {
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

  const getSenderName = (message: MessageData) => {
    if (filters.folder === 'sent') {
      return message.recipient?.display_name || message.recipient?.email || 'Onbekend';
    } else {
      return message.sender?.display_name || message.sender?.email || 'Onbekend';
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
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mt-4">
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
            value={filters.folder}
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
            <option value="archived">Gearchiveerd</option>
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
                message.status === 'unread' ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
              onClick={() => {
                setSelectedMessage(message);
                if (message.status === 'unread') {
                  handleMarkAsRead(message.id);
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900 truncate">
                      {getSenderName(message)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(message.status)}`}>
                      {message.status === 'unread' ? 'Ongelezen' : 
                       message.status === 'read' ? 'Gelezen' : 'Gearchiveerd'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {message.properties?.title || 'Eigendom'}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-gray-900 mb-1">{message.subject}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                </div>
                
                <div className="ml-4 flex flex-col items-end gap-2">
                  <span className="text-xs text-gray-500">
                    {new Date(message.created_at).toLocaleDateString('nl-NL')}
                  </span>
                  
                  <div className="flex gap-1">
                    {message.status !== 'read' && filters.folder === 'inbox' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(message.id);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Markeer als gelezen"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(message.id, message.status === 'archived' ? 'read' : 'archived');
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title={message.status === 'archived' ? 'Uit archief halen' : 'Archiveren'}
                    >
                      <ArchiveIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedMessage.subject}</h3>
                <button
                  onClick={() => {
                    setSelectedMessage(null);
                    setShowReplyForm(false);
                    setReplyMessage('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Van: {getSenderName(selectedMessage)} • {new Date(selectedMessage.created_at).toLocaleString('nl-NL')}
              </div>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Home className="w-4 h-4" />
                  <span>{selectedMessage.properties?.title || 'Eigendom'}</span>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              
              {selectedMessage.contact_info?.viewing_date && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Calendar className="w-4 h-4" />
                    <span>Bezichtigingsverzoek</span>
                  </div>
                  <div className="mt-1 text-sm">
                    Datum: {new Date(selectedMessage.contact_info.viewing_date).toLocaleDateString('nl-NL')}
                    {selectedMessage.contact_info.viewing_time && ` om ${selectedMessage.contact_info.viewing_time}`}
                  </div>
                  {selectedMessage.contact_info.viewing_notes && (
                    <div className="mt-1 text-sm">
                      Opmerkingen: {selectedMessage.contact_info.viewing_notes}
                    </div>
                  )}
                </div>
              )}

              {/* Reply Form */}
              {showReplyForm && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Reply className="w-4 h-4" />
                    Antwoord versturen
                  </h4>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Typ uw antwoord hier..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleSendReply}
                      disabled={sendingReply || !replyMessage.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                      {sendingReply ? 'Verzenden...' : 'Verzenden'}
                    </button>
                    <button
                      onClick={() => {
                        setShowReplyForm(false);
                        setReplyMessage('');
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Annuleren
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex gap-3">
              {!showReplyForm && (
                <button
                  onClick={() => setShowReplyForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  Antwoorden
                </button>
              )}
              {selectedMessage.status === 'unread' && (
                <button
                  onClick={() => handleMarkAsRead(selectedMessage.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Markeer als gelezen
                </button>
              )}
              
              <button
                onClick={() => {
                  const newStatus = selectedMessage.status === 'archived' ? 'read' : 'archived';
                  handleStatusChange(selectedMessage.id, newStatus);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {selectedMessage.status === 'archived' ? 'Uit archief halen' : 'Archiveren'}
              </button>
              
              <button
                onClick={() => {
                  setSelectedMessage(null);
                  setShowReplyForm(false);
                  setReplyMessage('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
