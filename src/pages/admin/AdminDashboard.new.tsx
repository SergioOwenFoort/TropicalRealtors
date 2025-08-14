import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Star, Edit, Building2, Users, Trash2, FileText, User, Settings, AlertCircle, Shield, Database } from 'lucide-react';
import { PropertyStatusBadge } from '../../components/realtor/PropertyStatusBadge';
import { useProperties } from '../../hooks/useProperties';
import { Property } from '../../types';
import { UserManagement } from './UserManagement';
import { CsvUploader } from '../../components/realtor/CsvUploader';
import { ListingUrlInput } from '../../components/realtor/ListingUrlInput';
import { WebhookTest } from '../../components/realtor/WebhookTest';
import { useSupabaseAuthActions } from '../../hooks/useSupabaseAuthActions';
import { ProfileSearch } from '../../components/admin/ProfileSearch';
import { ContentEditor } from '../../components/admin/ContentEditor';
import { DatabaseMaintenance } from '../../components/admin/DatabaseMaintenance';
import { useAuth } from '../../hooks/useAuth';
import { useUserRole } from '../../hooks/useUserRole';
import { supabase } from '../../config/supabase.config';

type Tab = 'properties' | 'users' | 'profiles' | 'content' | 'tools' | 'maintenance';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { properties, toggleFeatured, deleteProperty } = useProperties();
  const { updateAdminEmail, loading, error } = useSupabaseAuthActions();
  const [statusFilter, setStatusFilter] = useState<Property['status'] | 'alle'>('alle');
  const [activeTab, setActiveTab] = useState<Tab>('properties');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const { user } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();

  // Redirect non-admin users
  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, roleLoading, navigate]);

  const filteredProperties = properties.filter(
    p => statusFilter === 'alle' || p.status === statusFilter
  );

  const handleEditProperty = (propertyId: string) => {
    navigate(`/admin/woning/${propertyId}/bewerken`);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm('Weet u zeker dat u deze woning wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) {
      await deleteProperty(propertyId);
    }
  };

  const handleToggleFeatured = async (propertyId: string) => {
    await toggleFeatured(propertyId);
  };
  const handleUpdateAdminEmail = async () => {
    const email = window.prompt('Vul het nieuwe e-mailadres voor de admin in:', 's.admin@abcmakelaars.com');
    if (email) {
      await updateAdminEmail(email);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    }
  };

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex space-x-3">
          {activeTab === 'properties' && (
            <Link
              to="/admin/woning/nieuw"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
            >
              <Plus className="w-5 h-5 mr-1" /> Nieuwe Woning
            </Link>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('properties')}
              className={`${
                activeTab === 'properties'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-1`}
            >
              <Building2 className="w-4 h-4" />
              Woningen
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-1`}
            >
              <Users className="w-4 h-4" />
              Gebruikers
            </button>
            <button
              onClick={() => setActiveTab('profiles')}
              className={`${
                activeTab === 'profiles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-1`}
            >
              <User className="w-4 h-4" />
              Profielenbeheer
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`${
                activeTab === 'content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-1`}
            >
              <FileText className="w-4 h-4" />
              Content Editor
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`${
                activeTab === 'tools'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-1`}
            >
              <Settings className="w-4 h-4" />
              Tools
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`${
                activeTab === 'maintenance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-1`}
            >
              <Database className="w-4 h-4" />
              Database Beheer
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'properties' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setStatusFilter('alle')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  statusFilter === 'alle'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Alle
              </button>
              <button
                onClick={() => setStatusFilter('actief')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  statusFilter === 'actief'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Actief
              </button>
              <button
                onClick={() => setStatusFilter('verkocht')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  statusFilter === 'verkocht'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Verkocht
              </button>
              <button
                onClick={() => setStatusFilter('verhuurd')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  statusFilter === 'verhuurd'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Verhuurd
              </button>
              <button
                onClick={() => setStatusFilter('concept')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  statusFilter === 'concept'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Concept
              </button>
              <button
                onClick={() => setStatusFilter('ingetrokken')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  statusFilter === 'ingetrokken'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Ingetrokken
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Titel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Adres
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prijs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProperties.map((property) => (
                    <tr key={property.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative">
                            <img
                              className="h-10 w-10 rounded object-cover"
                              src={property.images?.[0] || '/placeholder-house.jpg'}
                              alt=""
                            />
                            {property.featured && (
                              <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                                <Star className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                              {property.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{property.address}</div>
                        <div className="text-sm text-gray-500">{property.city}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          € {property.price.toLocaleString('nl-NL')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PropertyStatusBadge status={property.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleToggleFeatured(property.id)}
                            title={property.featured ? "Verwijder van uitgelicht" : "Maak uitgelicht"}
                            className={`p-1.5 rounded-md ${
                              property.featured ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'
                            } hover:bg-opacity-80`}
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditProperty(property.id)}
                            className="p-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-md"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(property.id)}
                            className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-md"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'users' ? (
        <UserManagement />
      ) : activeTab === 'profiles' ? (
        <ProfileSearch />
      ) : activeTab === 'content' ? (
        <ContentEditor />
      ) : activeTab === 'maintenance' ? (
        <DatabaseMaintenance />
      ) : (
        <div className="space-y-8 mb-8">
          <ListingUrlInput />
          <WebhookTest />
          <CsvUploader />
        </div>
      )}
    </main>
  );
}
