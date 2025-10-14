import React, { useState, useEffect } from 'react';
import { UserProperties } from '../../components/admin/UserProperties';
import { Users, Building2, Mail, Calendar, Trash2, Edit2, Shield, AlertTriangle, Search } from 'lucide-react';
import { SupabaseService } from '../../services/supabaseService';
import { UserRole } from '../../types';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  display_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

interface EditRoleModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, newRole: UserRole) => void;
}

function EditRoleModal({ user, isOpen, onClose, onSave }: EditRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(user.id, selectedRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Rol wijzigen voor {user.display_name || user.email}</h3>
        
        <div className="space-y-3 mb-6">
          {(['admin', 'realtor', 'horo', 'owner', 'user'] as UserRole[]).map((role) => (
            <label key={role} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                value={role}
                checked={selectedRole === role}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="text-blue-600"
              />
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded ${
                  role === 'admin' 
                    ? 'bg-purple-100 text-purple-600'
                    : role === 'realtor'
                    ? 'bg-blue-100 text-blue-600'
                    : role === 'horo'
                    ? 'bg-purple-100 text-purple-600'
                    : role === 'owner'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {role === 'admin' ? (
                    <Shield className="w-4 h-4" />
                  ) : role === 'realtor' ? (
                    <Building2 className="w-4 h-4" />
                  ) : role === 'horo' ? (
                    <Building2 className="w-4 h-4" />
                  ) : role === 'owner' ? (
                    <Building2 className="w-4 h-4" />
                  ) : (
                    <Users className="w-4 h-4" />
                  )}
                </div>
                <span className="capitalize font-medium">
                  {role === 'owner' ? 'Home Owner' : role === 'horo' ? 'HoRe' : role}
                </span>
              </div>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}

interface DeleteConfirmModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string) => void;
}

function DeleteConfirmModal({ user, isOpen, onClose, onConfirm }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 text-red-600 rounded">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold">Gebruiker verwijderen</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Weet je zeker dat je <strong>{user.display_name || user.email}</strong> wilt verwijderen? 
          Deze actie kan niet ongedaan worden gemaakt.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuleren
          </button>
          <button
            onClick={() => onConfirm(user.id)}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Verwijderen
          </button>
        </div>
      </div>
    </div>
  );
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const supabaseService = SupabaseService.getInstance();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const userData = await supabaseService.getAllUsers();
      setUsers(userData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Fout bij het laden van gebruikers');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await supabaseService.updateUserRole(userId, newRole);
      toast.success('Rol succesvol bijgewerkt');
      loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Fout bij het bijwerken van de rol');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await supabaseService.deleteUser(userId);
      toast.success('Gebruiker succesvol verwijderd');
      setDeletingUser(null);
      loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Fout bij het verwijderen van de gebruiker');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesSearch = searchTerm === '' || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.display_name && user.display_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRole && matchesSearch;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Gebruikers laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Gebruikers beheer</h2>
          <p className="text-sm text-gray-500">
            {filteredUsers.length} van {users.length} gebruikers
            {searchTerm && ` (gefilterd op "${searchTerm}")`}
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Zoeken op naam, email of rol..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>

      <div className="p-4 border-b bg-gray-50">
        <div className="flex gap-2">
          {(['all', 'admin', 'realtor', 'horo', 'owner', 'user'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                roleFilter === role
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {role === 'all' ? 'Alle gebruikers' : role === 'owner' ? 'Home Owner' : role === 'horo' ? 'HoRe' : role.charAt(0).toUpperCase() + role.slice(1)}
              {role !== 'all' && (
                <span className="ml-1 text-xs opacity-75">
                  ({users.filter(u => {
                    const matchesRole = u.role === role;
                    const matchesSearch = searchTerm === '' || 
                      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (u.display_name && u.display_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      u.role.toLowerCase().includes(searchTerm.toLowerCase());
                    return matchesRole && matchesSearch;
                  }).length})
                </span>
              )}
              {role === 'all' && (
                <span className="ml-1 text-xs opacity-75">
                  ({filteredUsers.length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y">
        {filteredUsers.map((user) => (
          <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-600'
                    : user.role === 'realtor'
                    ? 'bg-blue-100 text-blue-600'
                    : user.role === 'owner'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {user.role === 'admin' ? (
                    <Shield className="w-6 h-6" />
                  ) : user.role === 'realtor' ? (
                    <Building2 className="w-6 h-6" />
                  ) : user.role === 'owner' ? (
                    <Building2 className="w-6 h-6" />
                  ) : (
                    <Users className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {user.display_name || 'Onbekende naam'}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Lid sinds {new Date(user.created_at).toLocaleDateString('nl-NL')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'realtor'
                        ? 'bg-blue-100 text-blue-800'
                        : user.role === 'owner'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'owner' ? 'Home Owner' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingUser(user)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Rol bewerken"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingUser(user)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Gebruiker verwijderen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>
              {searchTerm 
                ? `Geen gebruikers gevonden voor "${searchTerm}"` 
                : 'Geen gebruikers gevonden voor het geselecteerde filter'
              }
            </p>
            {searchTerm && (
              <p className="text-sm mt-2">Probeer een andere zoekterm of wijzig het filter</p>
            )}
          </div>
        )}
      </div>

      {selectedUserId && (
        <UserProperties 
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}

      {editingUser && (
        <EditRoleModal
          user={editingUser}
          isOpen={true}
          onClose={() => setEditingUser(null)}
          onSave={handleRoleChange}
        />
      )}

      {deletingUser && (
        <DeleteConfirmModal
          user={deletingUser}
          isOpen={true}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDeleteUser}
        />
      )}
    </div>
  );
}
