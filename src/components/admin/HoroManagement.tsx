import { useState, useEffect } from 'react';
import { Trash2, Search, UserPlus, RefreshCw, Edit2, Save, X } from 'lucide-react';
import { supabase } from '../../config/supabase.config';
import { toast } from 'react-hot-toast';

interface HoroUser {
  id: string;
  email: string;
  display_name: string;
  phone?: string;
  address?: string;
  company?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export function HoroManagement() {
  const [horos, setHoros] = useState<HoroUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<HoroUser>>({});
  const [newHoroForm, setNewHoroForm] = useState({
    email: '',
    display_name: '',
    phone: '',
    address: '',
    company: ''
  });

  const fetchHoros = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'horo')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHoros(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching horos:', err);
      setError('Fout bij het ophalen van horo gebruikers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoros();
  }, []);

  const filteredHoros = searchTerm
    ? horos.filter(
        horo =>
          horo.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          horo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          horo.company?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : horos;

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Weet je zeker dat je ${name} wilt verwijderen? Dit zal de horo rol verwijderen maar het account blijft bestaan.`)) {
      setDeletingId(id);
      try {
        // Instead of deleting the profile, change role to 'user'
        const { error } = await supabase
          .from('profiles')
          .update({ role: 'user' })
          .eq('id', id);

        if (error) throw error;
        
        toast.success(`${name} horo rol is succesvol verwijderd`);
        await fetchHoros();
      } catch (error: any) {
        console.error('Error removing horo role:', error);
        if (error?.code === '42501') {
          toast.error('Je hebt geen toestemming om horo rollen te verwijderen. Alleen admins kunnen dit doen.');
        } else {
          toast.error(`Fout bij het verwijderen van horo rol: ${error?.message || 'Onbekende fout'}`);
        }
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleEdit = (horo: HoroUser) => {
    setEditingId(horo.id);
    setEditForm(horo);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editForm.display_name,
          phone: editForm.phone,
          address: editForm.address,
          company: editForm.company,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingId);

      if (error) throw error;
      
      toast.success('Horo profiel bijgewerkt');
      setEditingId(null);
      setEditForm({});
      await fetchHoros();
    } catch (error: any) {
      console.error('Error updating horo:', error);
      toast.error(`Fout bij het bijwerken: ${error?.message || 'Onbekende fout'}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleAddHoro = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newHoroForm.email || !newHoroForm.display_name) {
      toast.error('Email en naam zijn verplicht');
      return;
    }

    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('email', newHoroForm.email)
        .single();

      if (existingProfile) {
        // Update existing profile to horo role
        const { error } = await supabase
          .from('profiles')
          .update({
            role: 'horo',
            display_name: newHoroForm.display_name,
            phone: newHoroForm.phone || null,
            address: newHoroForm.address || null,
            company: newHoroForm.company || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProfile.id);

        if (error) throw error;
        toast.success('Bestaand profiel bijgewerkt naar horo rol');
      } else {
        // Create new profile with horo role
        const { error } = await supabase
          .from('profiles')
          .insert({
            email: newHoroForm.email,
            role: 'horo',
            display_name: newHoroForm.display_name,
            phone: newHoroForm.phone || null,
            address: newHoroForm.address || null,
            company: newHoroForm.company || null
          });

        if (error) throw error;
        toast.success('Nieuwe horo gebruiker aangemaakt');
      }

      setNewHoroForm({
        email: '',
        display_name: '',
        phone: '',
        address: '',
        company: ''
      });
      setShowAddForm(false);
      await fetchHoros();
    } catch (error: any) {
      console.error('Error adding horo:', error);
      toast.error(`Fout bij het toevoegen: ${error?.message || 'Onbekende fout'}`);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchHoros();
      toast.success('Horo gebruikers bijgewerkt');
    } catch (error) {
      toast.error('Fout bij het ophalen van horo gebruikers');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Horo Gebruikers Beheren</h2>
        <div className="flex gap-3">
          <button
            className="flex items-center gap-1 text-purple-600 hover:text-purple-800"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Vernieuwen</span>
          </button>
          <button
            className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700"
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
            placeholder="Zoek horo gebruikers..."
            className="w-full px-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
        <div className="mb-6 bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Nieuwe Horo Gebruiker Toevoegen</h3>
          <form onSubmit={handleAddHoro} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newHoroForm.email}
                  onChange={e => setNewHoroForm({...newHoroForm, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Naam *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newHoroForm.display_name}
                  onChange={e => setNewHoroForm({...newHoroForm, display_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefoon</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newHoroForm.phone}
                  onChange={e => setNewHoroForm({...newHoroForm, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrijf</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newHoroForm.company}
                  onChange={e => setNewHoroForm({...newHoroForm, company: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newHoroForm.address}
                  onChange={e => setNewHoroForm({...newHoroForm, address: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
              >
                Toevoegen
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Annuleren
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : filteredHoros.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'Geen horo gebruikers gevonden voor je zoekopdracht' : 'Geen horo gebruikers beschikbaar'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Naam</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefoon</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bedrijf</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acties</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHoros.map(horo => (
                <tr key={horo.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {editingId === horo.id ? (
                      <input
                        type="text"
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={editForm.display_name || ''}
                        onChange={e => setEditForm({...editForm, display_name: e.target.value})}
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{horo.display_name || horo.email}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{horo.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {editingId === horo.id ? (
                      <input
                        type="text"
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={editForm.phone || ''}
                        onChange={e => setEditForm({...editForm, phone: e.target.value})}
                      />
                    ) : (
                      <div className="text-sm text-gray-500">{horo.phone || '-'}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {editingId === horo.id ? (
                      <input
                        type="text"
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={editForm.company || ''}
                        onChange={e => setEditForm({...editForm, company: e.target.value})}
                      />
                    ) : (
                      <div className="text-sm text-gray-500">{horo.company || '-'}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    {editingId === horo.id ? (
                      <div className="flex gap-2">
                        <button
                          className="text-green-600 hover:text-green-900"
                          onClick={handleSaveEdit}
                        >
                          <Save size={18} />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          onClick={handleCancelEdit}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          className="text-purple-600 hover:text-purple-900"
                          onClick={() => handleEdit(horo)}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          className={`transition-colors ${
                            deletingId === horo.id 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-red-600 hover:text-red-900'
                          }`}
                          onClick={() => handleDelete(horo.id, horo.display_name || horo.email)}
                          disabled={deletingId === horo.id}
                        >
                          {deletingId === horo.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-red-600"></div>
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    )}
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