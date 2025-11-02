import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSupabaseAuthActions } from '../../hooks/useSupabaseAuthActions';
import { AlertCircle } from 'lucide-react';
import { supabase } from '../../config/supabase.config';
import { HCaptchaComponent } from '../../components/security/HCaptcha';
import { requireCaptcha } from '../../utils/captchaVerification';
import { toast } from 'react-hot-toast';

export function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [captchaToken, setCaptchaToken] = useState('');
  const { resetPassword, loading, error, resetSent } = useSupabaseAuthActions();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if we have a token in the URL (from email link)
    const checkEmailLink = async () => {
      if (searchParams.has('type') && searchParams.get('type') === 'recovery') {
        console.log('Recovery flow detected');
        navigate('/auth/update-password');
      }
    };

    checkEmailLink();
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verify captcha before sending reset email
    if (!captchaToken) {
      toast.error('Voltooi alstublieft de CAPTCHA verificatie');
      return;
    }

    const captchaValid = await requireCaptcha(captchaToken);
    if (!captchaValid) {
      toast.error('CAPTCHA verificatie mislukt. Probeer het opnieuw.');
      setCaptchaToken('');
      return;
    }

    await resetPassword(email);
  };

  const testConnection = async () => {
    try {      setConnectionStatus('Testing connection...');
      console.log('Testing Supabase connection...');
      console.log('Environment variables:', {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'not set',
        hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
      });
      
      // Test if we can connect to Supabase
      const { data, error: profileError } = await supabase.from('profiles').select('count').limit(1);
      
      if (profileError) {
        console.error('Connection test failed:', profileError);
        setConnectionStatus(`Connection failed: ${profileError.message}`);
        return;
      }

      // Test auth service
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      console.log('Connection test results:', {
        profiles: data,
        auth: authData,
        hasAuthError: !!authError
      });

      setConnectionStatus('Connection successful!');
    } catch (err) {
      console.error('Connection test error:', err);
      setConnectionStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (resetSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Reset verzoek verzonden
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Als uw email adres bekend is in ons systeem, ontvangt u instructies om uw wachtwoord te resetten.
            </p>
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>✅ Email verzonden!</strong><br />
                Controleer uw inbox (en spam/junk map) voor instructies om uw wachtwoord te resetten.
                De email komt van het Bonaire Makelaars systeem.
              </p>
            </div>
          </div>
          
          <div className="mt-4 text-center space-y-2">
            <button
              onClick={() => navigate('/auth/login')}
              className="text-blue-600 hover:text-blue-500 text-sm block w-full"
            >
              Terug naar inloggen
            </button>
            <button
              onClick={() => window.location.reload()}
              className="text-gray-600 hover:text-gray-500 text-sm"
            >
              Probeer opnieuw
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Wachtwoord resetten
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Voer uw e-mailadres in om uw wachtwoord te resetten
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              E-mailadres
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="E-mailadres"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-center">
            <HCaptchaComponent
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken('')}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !captchaToken}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Bezig met verzenden...' : 'Reset instructies versturen'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/auth/login')}
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Terug naar inloggen
            </button>
          </div>
        </form>

        {/* Connection status section */}
        <div className="mt-8 text-center">
          <button
            onClick={testConnection}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Test Supabase Verbinding
          </button>
          {connectionStatus && (
            <p className="mt-2 text-sm text-gray-600">
              {connectionStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
