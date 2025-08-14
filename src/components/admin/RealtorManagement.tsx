import { useState } from 'react';
import { Trash2, Search, UserPlus, RefreshCw } from 'lucide-react';
import { useRealtors } from '../../hooks/useRealtors';
import { RealtorUploader } from '../shared/RealtorUploader';
import { toast } from 'react-hot-toast';

export function RealtorManagement() {
  const { realtors, loading, error, deleteRealtor, refreshRealtors } = useRealtors();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredRealtors = searchTerm
    ? realtors.filter(
        realtor =>
          realtor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          realtor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          realtor.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          realtor.island.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : realtors;

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Weet je zeker dat je ${name} wilt verwijderen?`)) {
      setDeletingId(id);
      try {
        const success = await deleteRealtor(id);
        if (success) {
          toast.success(`${name} is succesvol verwijderd`);
          // Refresh the list to ensure consistency
          await refreshRealtors();
        }
      } catch (error: any) {
        console.error('Error deleting realtor:', error);
        if (error?.code === '42501') {
          toast.error('Je hebt geen toestemming om makelaars te verwijderen. Alleen admins kunnen dit doen.');
        } else if (error?.message?.includes('permission')) {
          toast.error('Geen toestemming om deze actie uit te voeren');
        } else {
          toast.error(`Fout bij het verwijderen van ${name}: ${error?.message || 'Onbekende fout'}`);
        }
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshRealtors();
      toast.success('Makelaars bijgewerkt');
    } catch (error) {
      toast.error('Fout bij het ophalen van makelaars');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Makelaars beheren</h2>
        <div className="flex gap-3">
          <button
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Vernieuwen</span>
          </button>
          <button
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Annuleren' : <><UserPlus size={18} /> <span>Toevoegen</span></>}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Zoek makelaars..."
            className="w-full px-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          {searchTerm && (
            <button
              className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchTerm('')}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="mb-6">
          <RealtorUploader />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : filteredRealtors.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'Geen makelaars gevonden voor je zoekopdracht' : 'Geen makelaars beschikbaar'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Naam</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefoon</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Locatie</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eiland</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acties</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRealtors.map(realtor => (
                <tr key={realtor.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-gray-50">
                        <img
                          className="h-full w-full object-cover object-center"
                          src={realtor.image_url}
                          alt={realtor.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/40x40/6B7280/FFFFFF?text=?';
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{realtor.name}</div>
                        <div className="text-xs text-gray-500">{realtor.specialization}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{realtor.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{realtor.phone}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{realtor.location}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          realtor.island === 'bonaire'
                            ? 'bg-blue-100 text-blue-800'
                            : realtor.island === 'aruba'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                    >
                      {realtor.island.charAt(0).toUpperCase() + realtor.island.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className={`mr-3 transition-colors ${
                        deletingId === realtor.id 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-red-600 hover:text-red-900'
                      }`}
                      onClick={() => handleDelete(realtor.id, realtor.name)}
                      disabled={deletingId === realtor.id}
                    >
                      {deletingId === realtor.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-red-600"></div>
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
