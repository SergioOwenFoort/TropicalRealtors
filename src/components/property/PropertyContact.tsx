import React, { useState, useRef, useEffect } from 'react';
import { Phone, Mail, X } from 'lucide-react';
import { Property } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { MessageService } from '../../services/messageService';

interface PropertyContactProps {
  property: Property;
  disableSticky?: boolean;
}

interface MessageFormData {
  message: string;
}

export function PropertyContact({ property, disableSticky = false }: PropertyContactProps) {
  const { user } = useAuth();
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const messageModalRef = useRef<HTMLDivElement>(null);
  const [messageData, setMessageData] = useState<MessageFormData>({
    message: ''
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMessageForm && messageModalRef.current && !messageModalRef.current.contains(event.target as Node)) {
        setShowMessageForm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMessageForm]);

  useEffect(() => {
    if (showMessageForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMessageForm]);

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('U moet ingelogd zijn om een bericht te sturen');
      return;
    }

    if (!property.makelaarId) {
      toast.error('Eigenaar informatie niet beschikbaar');
      return;
    }

    setSubmitting(true);

    try {
      const result = await MessageService.sendMessage({
        property_id: property.id,
        recipient_id: property.makelaarId,
        message: messageData.message,
        message_type: 'inquiry',
        subject: `Interesse in: ${property.title}`
      });

      if (result.success) {
        toast.success('Bericht verzonden! De eigenaar ontvangt uw bericht en neemt contact met u op.');
        setShowMessageForm(false);
        setMessageData({ message: '' });
      } else {
        toast.error(result.error || 'Er is een fout opgetreden bij het versturen van uw bericht');
      }
    } catch (error) {
      toast.error('Er is een fout opgetreden bij het versturen van uw bericht');
      console.error('Error sending message:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className={`bg-white p-6 rounded-lg shadow-sm ${disableSticky ? '' : 'sticky top-4'}`}>
        <h2 className="text-xl font-semibold mb-6">Contact opnemen</h2>
        
        <div className="space-y-4">
          <button 
            onClick={() => setShowMessageForm(true)}
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail className="w-5 h-5" />
            <span>Stuur bericht</span>
          </button>

          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-2">Direct contact</h3>
            <p className="text-gray-600 text-sm mb-4">
              Liever telefonisch contact? Onze makelaars staan voor u klaar.
            </p>
            {property.phone_number ? (
              <a
                href={`tel:${property.phone_number}`}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                <span>Bel makelaar</span>
              </a>
            ) : (
              <button
                disabled
                className="w-full bg-gray-400 text-white py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                title="Telefoonnummer niet beschikbaar"
              >
                <Phone className="w-5 h-5" />
                <span>Telefoonnummer niet beschikbaar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bericht Modal */}
      {showMessageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 md:p-8">
          <div 
            ref={messageModalRef}
            className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto relative"
          >
            <div className="p-6">
              <button
                onClick={() => setShowMessageForm(false)}
                disabled={submitting}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold mb-6">Stuur een bericht</h2>
              
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Eigendom:</strong> {property.title}
                </p>
                <p className="text-sm text-blue-600">
                  Uw bericht wordt direct naar de eigenaar/makelaar gestuurd via het dashboard.
                </p>
              </div>

              <form onSubmit={handleMessageSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Uw bericht
                  </label>
                  <textarea
                    required
                    disabled={submitting}
                    value={messageData.message}
                    onChange={(e) => setMessageData({ message: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 disabled:opacity-50"
                    rows={6}
                    placeholder="Schrijf hier uw bericht aan de eigenaar/makelaar..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !messageData.message.trim()}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Versturen...' : 'Verstuur bericht'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
