import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, Check, X } from 'lucide-react';
import { Property } from '../../types';
import { FEATURED_PROPERTIES } from '../../data/properties';

interface Appointment {
  id: string;
  propertyId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
}

// Demo data
const APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    propertyId: '1',
    clientName: 'Jan de Vries',
    clientEmail: 'jan@example.com',
    clientPhone: '0612345678',
    date: '2024-03-20',
    time: '14:00',
    status: 'confirmed',
    notes: 'Eerste bezichtiging'
  },
  {
    id: '2',
    propertyId: '2',
    clientName: 'Maria Jansen',
    clientEmail: 'maria@example.com',
    clientPhone: '0687654321',
    date: '2024-03-21',
    time: '10:30',
    status: 'pending'
  },
  {
    id: '3',
    propertyId: '1',
    clientName: 'Peter Bakker',
    clientEmail: 'peter@example.com',
    clientPhone: '0698765432',
    date: '2024-03-22',
    time: '15:45',
    status: 'cancelled',
    notes: 'Geannuleerd wegens ziekte'
  }
];

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
} as const;

const STATUS_LABELS = {
  pending: 'In afwachting',
  confirmed: 'Bevestigd',
  cancelled: 'Geannuleerd'
} as const;

export function RealtorAppointments() {
  const [statusFilter, setStatusFilter] = useState<Appointment['status'] | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const filteredAppointments = APPOINTMENTS.filter(appointment => {
    if (statusFilter !== 'all' && appointment.status !== statusFilter) return false;
    if (selectedDate && appointment.date !== selectedDate) return false;
    return true;
  });

  const getPropertyDetails = (propertyId: string) => {
    return FEATURED_PROPERTIES.find(p => p.id === propertyId);
  };

  const handleStatusChange = async (appointmentId: string, newStatus: Appointment['status']) => {
    // In een echte applicatie zou hier een API call komen
    console.log(`Updating appointment ${appointmentId} to status: ${newStatus}`);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Afspraken</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Vandaag</h3>
                <p className="text-2xl font-bold">
                  {APPOINTMENTS.filter(a => a.date === new Date().toISOString().split('T')[0]).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">In afwachting</h3>
                <p className="text-2xl font-bold">
                  {APPOINTMENTS.filter(a => a.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Bevestigd</h3>
                <p className="text-2xl font-bold">
                  {APPOINTMENTS.filter(a => a.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <h2 className="text-xl font-semibold">Geplande bezichtigingen</h2>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Appointment['status'] | 'all')}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              >
                <option value="all">Alle statussen</option>
                <option value="pending">In afwachting</option>
                <option value="confirmed">Bevestigd</option>
                <option value="cancelled">Geannuleerd</option>
              </select>
              
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="divide-y">
          {filteredAppointments.map((appointment) => {
            const property = getPropertyDetails(appointment.propertyId);
            if (!property) return null;

            return (
              <div key={appointment.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex gap-4">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold mb-1">{property.title}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{property.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(appointment.date).toLocaleDateString()} om {appointment.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{appointment.clientName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${STATUS_STYLES[appointment.status]}`}>
                      {STATUS_LABELS[appointment.status]}
                    </span>
                    
                    {appointment.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {appointment.notes && (
                  <div className="mt-4 pl-28">
                    <p className="text-sm text-gray-600">{appointment.notes}</p>
                  </div>
                )}
              </div>
            );
          })}

          {filteredAppointments.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Geen afspraken gevonden voor de geselecteerde filters
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
