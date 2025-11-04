import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserPlus, Mail, Lock, User, Home, Building2, Key, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useSupabaseAuthActions as useAuthActions } from '../../hooks/useSupabaseAuthActions';
import { toast } from 'react-hot-toast';
import { UserRole } from '../../types';
import { supabase } from '../../config/supabase.config';
import { Logo } from '../../components/ui/Logo';
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText } from '../../utils/passwordValidation';
import { sanitizeEmail, sanitizeText, sanitizePhoneNumber, isValidEmail } from '../../utils/inputSanitization';
import { HCaptchaComponent } from '../../components/security/HCaptcha';
import { requireCaptcha } from '../../utils/captchaVerification';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('user');
  const [passwordValidation, setPasswordValidation] = useState({ isValid: false, errors: [] as string[], strength: 'weak' as 'weak' | 'medium' | 'strong' });
  const [captchaToken, setCaptchaToken] = useState('');
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verify CAPTCHA first (only if configured)
    const captchaConfigured = import.meta.env.VITE_HCAPTCHA_SITE_KEY;
    if (captchaConfigured) {
      if (!captchaToken) {
        toast.error('Voltooi alstublieft de CAPTCHA verificatie');
        return;
      }

      // Verify captcha token on server side
      const captchaValid = await requireCaptcha(captchaToken);
      if (!captchaValid) {
        toast.error('CAPTCHA verificatie mislukt. Probeer het opnieuw.');
        setCaptchaToken(''); // Reset captcha
        return;
      }
    }
    
    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedName = sanitizeText(name);
    const sanitizedAddress = sanitizeText(address);
    const sanitizedPhone = sanitizePhoneNumber(phoneNumber);
    const sanitizedCountry = sanitizeText(country);
    
    // Validate email
    if (!isValidEmail(sanitizedEmail)) {
      toast.error('Voer een geldig email adres in');
      return;
    }
    
    // Validate password strength
    const validation = validatePassword(password);
    if (!validation.isValid) {
      toast.error(validation.errors[0]);
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Wachtwoorden komen niet overeen');
      return;
    }
    try {
      await register(sanitizedEmail, password);
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (session?.user) {
        // Update user profile with additional fields
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            display_name: sanitizedName, 
            email: sanitizedEmail, 
            role,
            address: sanitizedAddress,
            phone_number: sanitizedPhone,
            country: sanitizedCountry
          })
          .eq('id', session.user.id);
        
        if (profileError) {
          console.error('Profile update error:', profileError);
          toast.error('Account aangemaakt, maar profiel kon niet worden bijgewerkt');
        } else {
          toast.success('Account succesvol aangemaakt!');
        }
        
        const from = location.state?.from?.pathname || '/';
        navigate(from);
      }
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
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-gray-600 hover:text-blue-600">
            <Logo className="w-6 h-6" />
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
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">Naam</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Naam"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="sr-only">Adres</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Home className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Adres"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="sr-only">Telefoonnummer</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Telefoonnummer"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="country" className="sr-only">Land</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Home className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="country"
                  name="country"
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Land"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">Wachtwoord</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordValidation(validatePassword(e.target.value));
                  }}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Wachtwoord (min. 8 tekens, hoofdletter, cijfer, speciaal teken)"
                  disabled={loading}
                  minLength={8}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Wachtwoord sterkte:</span>
                    <span className={getPasswordStrengthColor(passwordValidation.strength) + ' font-medium'}>
                      {getPasswordStrengthText(passwordValidation.strength)}
                    </span>
                  </div>
                  {passwordValidation.errors.length > 0 && (
                    <ul className="text-xs text-red-600 space-y-1 mt-1">
                      {passwordValidation.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password" className="sr-only">Bevestig wachtwoord</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Bevestig wachtwoord"
                  disabled={loading}
                  minLength={6}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
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
          </div>

          {/* hCaptcha Verification */}
          <HCaptchaComponent
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken('')}
            onError={(error) => {
              console.error('hCaptcha error:', error);
              toast.error('CAPTCHA fout. Probeer het opnieuw.');
            }}
          />

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading || !captchaToken}
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
