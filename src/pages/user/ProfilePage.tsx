import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { SupabaseService } from '../../services/supabaseService';
import { useUserRole } from '../../hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { DeleteAccountButton } from '../../components/auth/DeleteAccountButton';

const supabaseService = SupabaseService.getInstance();

export function ProfilePage() {
  const { user, actions } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ display_name: string | null }>({ display_name: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect admin users to the admin profile page
  useEffect(() => {
    if (isAdmin && user?.email === 's.admin@bonairemakelaars.com') {
      navigate('/admin/profiel');
    }
  }, [isAdmin, user, navigate]);

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        try {
          const userProfile = await supabaseService.getProfile(user.id);
          setProfile(userProfile);
        } catch (error) {
          console.error('Error loading profile:', error);
          toast.error('Error loading profile');
        }
      }
    }
    loadProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await actions.updateProfile({ display_name: profile.display_name || '' });
      toast.success('Profiel succesvol bijgewerkt');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Er is een fout opgetreden bij het bijwerken van uw profiel');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Wachtwoorden komen niet overeen');
      return;
    }

    setLoading(true);
    try {
      await actions.changePassword(newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Wachtwoord succesvol gewijzigd');
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Er is een fout opgetreden bij het wijzigen van uw wachtwoord');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mijn Profiel</h1>

      <div className="grid gap-8">
        {/* Persoonlijke Gegevens */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Persoonlijke Gegevens</h2>
          </div>
          <form onSubmit={handleUpdateProfile} className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mailadres
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Naam
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={profile.display_name || ''}
                    onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                Wijzigingen opslaan
              </button>
            </div>
          </form>
        </div>

        {/* Wachtwoord Wijzigen */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Wachtwoord Wijzigen</h2>
          </div>
          <form onSubmit={handleChangePassword} className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Huidig wachtwoord
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nieuw wachtwoord
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bevestig nieuw wachtwoord
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                Wachtwoord wijzigen
              </button>
            </div>
          </form>
        </div>

        {/* Account Verwijderen */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-red-200">
          <div className="p-6 border-b bg-red-50">
            <h2 className="text-xl font-semibold text-red-800">Gevaarlijke Zone</h2>
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Account permanent verwijderen
                </h3>
                <p className="text-sm text-gray-600">
                  Verwijder uw account en alle bijbehorende gegevens. Deze actie kan niet ongedaan worden gemaakt.
                </p>
              </div>
              <div className="ml-4">
                <DeleteAccountButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
