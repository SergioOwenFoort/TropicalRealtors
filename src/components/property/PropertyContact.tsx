import React, { useState, useRef, useEffect } from 'react';
import { Phone, Mail, Calendar, X } from 'lucide-react';
import { Property } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

interface PropertyContactProps {
  property: Property;
  disableSticky?: boolean;
}

interface ViewingFormData {
  date: string;
  time: string;
  notes: string;
}

interface MessageFormData {
  message: string;
}

export function PropertyContact({ property, disableSticky = false }: PropertyContactProps) {
  const { user } = useAuth();
  const [showViewingForm, setShowViewingForm] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const viewingModalRef = useRef<HTMLDivElement>(null);
  const messageModalRef = useRef<HTMLDivElement>(null);
  const [viewingData, setViewingData] = useState<ViewingFormData>({
    date: '',
    time: '',
    notes: ''
  });
  const [messageData, setMessageData] = useState<MessageFormData>({
    message: ''
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showViewingForm && viewingModalRef.current && !viewingModalRef.current.contains(event.target as Node)) {
        setShowViewingForm(false);
      }
      if (showMessageForm && messageModalRef.current && !messageModalRef.current.contains(event.target as Node)) {
        setShowMessageForm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showViewingForm, showMessageForm]);

  useEffect(() => {
    if (showViewingForm || showMessageForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showViewingForm, showMessageForm]);

  const handleViewingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('U moet ingelogd zijn om een bezichtiging aan te vragen');
      return;
    }

    // In een echte applicatie zou dit een API call zijn
    console.log('Viewing request:', {
      propertyId: property.id,
      userId: user.id,
      ...viewingData
    });

    toast.success('Bezichtiging aangevraagd! We nemen zo snel mogelijk contact met u op.');
    setShowViewingForm(false);
    setViewingData({ date: '', time: '', notes: '' });
  };

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('U moet ingelogd zijn om een bericht te sturen');
      return;
    }

    // In een echte applicatie zou dit een API call zijn
    console.log('Message sent:', {
      propertyId: property.id,
      userId: user.id,
      ...messageData
    });

    toast.success('Bericht verzonden! De makelaar neemt zo snel mogelijk contact met u op.');
    setShowMessageForm(false);
    setMessageData({ message: '' });
  };

  return (
    <>
      <div className={`bg-white p-6 rounded-lg shadow-sm ${disableSticky ? '' : 'sticky top-4'}`}>
        <h2 className="text-xl font-semibold mb-6">Contact opnemen</h2>
        
        <div className="space-y-4">
          <button 
            onClick={() => setShowMessageForm(true)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Mail className="w-5 h-5" />
            <span>Stuur bericht</span>
          </button>
          
          <button
            onClick={() => setShowViewingForm(true)}
            className="w-full bg-white text-blue-600 border-2 border-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            <span>Plan bezichtiging</span>
          </button>

          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-2">Direct contact</h3>
            <p className="text-gray-600 text-sm mb-4">
              Liever telefonisch contact? Onze makelaars staan voor u klaar.
            </p>
            <a
              href="tel:+31201234567"
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              <span>Bel makelaar</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bezichtiging Modal */}
      {showViewingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 md:p-8">
          <div 
            ref={viewingModalRef}
            className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto relative"
          >
            <div className="p-6">
              <button
                onClick={() => setShowViewingForm(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold mb-6">Plan een bezichtiging</h2>

              <form onSubmit={handleViewingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Datum
                  </label>
                  <input
                    type="date"
                    required
                    value={viewingData.date}
                    onChange={(e) => setViewingData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tijd
                  </label>
                  <input
                    type="time"
                    required
                    value={viewingData.time}
                    onChange={(e) => setViewingData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opmerkingen (optioneel)
                  </label>
                  <textarea
                    value={viewingData.notes}
                    onChange={(e) => setViewingData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Bezichtiging aanvragen
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

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
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold mb-6">Stuur een bericht</h2>

              <form onSubmit={handleMessageSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Uw bericht
                  </label>
                  <textarea
                    required
                    value={messageData.message}
                    onChange={(e) => setMessageData({ message: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    rows={6}
                    placeholder="Schrijf hier uw bericht aan de makelaar..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Verstuur bericht
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
