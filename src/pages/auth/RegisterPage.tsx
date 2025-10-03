import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserPlus, Home, Key, AlertCircle } from 'lucide-react';
import { useSupabaseAuthActions as useAuthActions } from '../../hooks/useSupabaseAuthActions';
import { toast } from 'react-hot-toast';
import { UserRole } from '../../types';
import { UserRegistrationForm } from '../../components/auth/UserRegistrationForm';
import { OwnerRegistrationForm } from '../../components/auth/OwnerRegistrationForm';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('user');
  
  // Owner-specific form data
  const [ownerFormData, setOwnerFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    countryOfResidence: ''
  });
  
  const { register, loginWithGoogle, error, loading } = useAuthActions();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state?.from?.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Wachtwoorden komen niet overeen');
      return;
    }

    // Validate owner-specific fields if role is owner
    if (role === 'owner') {
      if (!ownerFormData.firstName.trim()) {
        toast.error('Voornaam is verplicht');
        return;
      }
      if (!ownerFormData.lastName.trim()) {
        toast.error('Achternaam is verplicht');
        return;
      }
      if (!ownerFormData.phone.trim()) {
        toast.error('Telefoonnummer is verplicht');
        return;
      }
      if (!ownerFormData.address.trim()) {
        toast.error('Adres is verplicht');
        return;
      }
      if (!ownerFormData.countryOfResidence.trim()) {
        toast.error('Land van verblijf is verplicht');
        return;
      }
    }

    try {
      // Prepare profile data based on role
      const profileData = {
        role,
        display_name: role === 'owner' ? `${ownerFormData.firstName} ${ownerFormData.lastName}` : name,
        ...(role === 'owner' && {
          first_name: ownerFormData.firstName,
          last_name: ownerFormData.lastName,
          phone: ownerFormData.phone,
          address: ownerFormData.address,
          country_of_residence: ownerFormData.countryOfResidence
        })
      };
      
      await register(email, password, profileData);
      
      // Show email verification message
      toast.success(
        'Account aangemaakt! Controleer uw email en klik op de verificatielink om uw account te activeren.',
        { duration: 6000 }
      );
      
      // Note: We don't navigate immediately since the user needs to verify their email first
      // The profile will be created automatically when they click the verification link
      
    } catch (err) {
      console.error('Registration error:', err);
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      const from = location.state?.from?.pathname || '/';
      navigate(from);
    } catch (err) {
      console.error('Google login error:', err);
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const roleOptions = [
    { value: 'user', label: 'Woningzoekende', icon: Home },
    { value: 'owner', label: 'Huiseigenaar', icon: Key }
  ];

  if (user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className={`w-full space-y-8 bg-white p-8 rounded-lg shadow-sm ${
        role === 'owner' ? 'max-w-2xl' : 'max-w-md'
      }`}>
        <div className="flex justify-between items-center">
          <Link to="/" className="text-gray-600 hover:text-blue-600">
            <Home className="w-6 h-6" />
          </Link>
          <h2 className="text-center text-3xl font-bold text-gray-900">Account aanmaken</h2>
          <div className="w-6" />
        </div>

        <p className="mt-2 text-center text-sm text-gray-600">
          Of{' '}
          <Link to="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
            log in met een bestaand account
          </Link>
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {/* Role Selection */}
        <div className="flex justify-center gap-4 mb-6">
          {roleOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setRole(option.value as UserRole)}
                disabled={loading}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                  role === option.value
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>

        {/* Email Verification Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Email verificatie vereist</p>
              <p>
                Na registratie ontvangt u een verificatie-email. Klik op de link in de email om uw account te activeren 
                en in te kunnen loggen.
              </p>
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Conditional Form Rendering */}
          {role === 'user' ? (
            <UserRegistrationForm
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              loading={loading}
            />
          ) : (
            <OwnerRegistrationForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              formData={ownerFormData}
              setFormData={setOwnerFormData}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              loading={loading}
            />
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <UserPlus className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
              </span>
              {loading ? 'Account aanmaken...' : 'Account aanmaken'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Of ga door met</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Google
            </button>

            {/* Google registration info message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <p className="text-xs text-blue-700">
                <strong>Let op:</strong> Wanneer je registreert met Google word je automatisch aangemeld als <strong>woningzoekende</strong>. 
                Je kunt je rol later laten aanpassen voor je profiel.
              </p>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
