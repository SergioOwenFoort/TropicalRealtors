import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Save, Shield, AlertTriangle, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { supabase } from '../../config/supabase.config';
import { useNavigate } from 'react-router-dom';
import { SupabaseService } from '../../services/supabaseService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useUserRole } from '../../hooks/useUserRole';

const supabaseService = SupabaseService.getInstance();

export function AdminProfilePage() {
  const { user, actions } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ display_name: string | null, role: string | null }>({ display_name: '', role: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | null>(null);
  // Redirect non-admin users or enforce the correct admin email
  useEffect(() => {
    if (!roleLoading) {
      if (!isAdmin) {
        navigate('/');
      } else if (user?.email !== 's.admin@bonairemakelaars.com') {
        // If this is not the correct admin account, redirect to regular profile page
        navigate('/profiel');
      }
    }
  }, [isAdmin, roleLoading, navigate, user]);

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        try {
          const userProfile = await supabaseService.getProfile(user.id);
          setProfile(userProfile);
          setAdminEmail(user.email || '');
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
      toast.error('Kon profiel niet bijwerken');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      toast.error('Nieuwe wachtwoorden komen niet overeen');
      setLoading(false);
      return;
    }

    try {
      await actions.changePassword(newPassword);
      toast.success('Wachtwoord succesvol bijgewerkt');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Kon wachtwoord niet wijzigen');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAdminEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await actions.updateAdminEmail(adminEmail);
      if (success) {
        toast.success(`Admin email is bijgewerkt naar ${adminEmail}`);
      } else {
        toast.error('Kon admin email niet bijwerken');
      }
    } catch (error) {
      console.error('Admin email update error:', error);
      toast.error('Kon admin email niet bijwerken');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) throw error;
      
      setConnectionStatus(data ? 'success' : 'error');
      if (data) {
        toast.success('Verbinding met database is OK');
      } else {
        toast.error('Je hebt geen admin rechten in de database');
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setConnectionStatus('error');
      toast.error('Kon geen verbinding maken met de database');
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Show loading state while checking admin access
  if (roleLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Profiel</h1>

      <div className="bg-purple-100 p-4 rounded-lg border border-purple-300 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-purple-600 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-purple-700">Admin Account</h2>
            <p className="text-purple-700">Dit is een beheerders account met volledige rechten op de website.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Persoonlijke Informatie</h2>
          
          <form onSubmit={handleUpdateProfile}>
            <div className="space-y-4">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                  Naam
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="displayName"
                    type="text"
                    value={profile.display_name || ''}
                    onChange={(e) => setProfile({...profile, display_name: e.target.value})}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Uw naam"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="pl-10 w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none"
                    placeholder="Uw email adres"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-600">Email kan niet gewijzigd worden</p>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="role"
                    type="text"
                    disabled
                    value="Admin"
                    className="pl-10 w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button 
                type="submit" 
                className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                    Bezig...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Profiel opslaan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Verander wachtwoord</h2>
            
            <form onSubmit={handleChangePassword}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Nieuw wachtwoord
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nieuw wachtwoord"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Bevestig wachtwoord
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Bevestig wachtwoord"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={loading || !newPassword || !confirmPassword}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                      Bezig...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Wachtwoord wijzigen
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Admin Instellingen</h2>
            
            <form onSubmit={handleUpdateAdminEmail}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="adminEmail"
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Admin email adres"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  disabled={loading || !adminEmail}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                      Bezig...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Admin Email Bijwerken
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Database Verbinding Testen
              </h3>
              <button
                onClick={testConnection}
                className={`flex items-center justify-center gap-2 w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  connectionStatus === 'success' 
                    ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
                    : connectionStatus === 'error'
                    ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500'
                }`}
                disabled={isTestingConnection}
              >
                {isTestingConnection ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></span>
                    Testen...
                  </>
                ) : (
                  <>
                    {connectionStatus === 'success' ? 'Verbinding OK' : connectionStatus === 'error' ? 'Verbinding Fout' : 'Test Verbinding'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>      <div className="mt-6 flex justify-between">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Settings className="w-5 h-5" />
          Terug naar Admin Dashboard
        </button>
      </div>
    </main>
  );
}
