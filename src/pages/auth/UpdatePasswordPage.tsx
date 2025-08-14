import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSupabaseAuthActions } from '../../hooks/useSupabaseAuthActions';
import { supabase } from '../../config/supabase.config';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [resetEmail, setResetEmail] = useState<string>('');
  const { loading, error } = useSupabaseAuthActions();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  // Check if this is a token-based reset or regular password update
  useEffect(() => {
    const checkAccess = async () => {
      if (token && emailParam) {
        // This is a token-based reset from email link
        // Token validity will be checked when submitting
        setTokenValid(true);
        setResetEmail(emailParam);
      } else {
        // Regular password update - check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth/login');
        } else {
          setTokenValid(true);
        }
      }
    };
    checkAccess();
  }, [navigate, token, emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validate passwords
    if (password !== confirmPassword) {
      setLocalError("De wachtwoorden komen niet overeen");
      return;
    }

    if (password.length < 6) {
      setLocalError("Het wachtwoord moet minimaal 6 tekens bevatten");
      return;
    }

    try {
      if (token && emailParam) {
        // Token-based reset: First sign in the user temporarily, then update password
        // For this to work, we need to either:
        // 1. Use a backend service to update the password
        // 2. Or use a simpler approach with a verification code
        
        // For now, let's create a simplified approach - just update the password via our backend
        const response = await fetch('/api/update-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: token,
            email: emailParam,
            newPassword: password
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update password');
        }

        // Token is automatically cleaned up on the server
        setSuccess(true);
      } else {
        // Regular password update for logged-in user
        const { error: updateError } = await supabase.auth.updateUser({
          password: password
        });

        if (updateError) {
          throw new Error(updateError.message);
        }

        setSuccess(true);
      }
    } catch (err) {
      console.error('Password update error:', err);
      if (err instanceof Error) {
        setLocalError(err.message);
      } else {
        setLocalError('Er is een fout opgetreden bij het bijwerken van uw wachtwoord');
      }
    }
  };

  // Show loading state while checking token validity
  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Verificatie in uitvoering...</p>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Link verlopen
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {localError || 'Deze reset link is verlopen of ongeldig.'}
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/auth/reset-password')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Nieuwe reset aanvragen
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Wachtwoord gewijzigd
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {token ? 
                `Uw wachtwoord voor ${resetEmail} is succesvol gewijzigd. U kunt nu inloggen met uw nieuwe wachtwoord.` :
                'Uw wachtwoord is succesvol gewijzigd.'
              }
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/auth/login')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ga naar inlogpagina
              </button>
            </div>
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
            {token ? 'Nieuw wachtwoord instellen' : 'Wachtwoord wijzigen'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {token ? 
              `Voer een nieuw wachtwoord in voor ${resetEmail}` :
              'Voer uw nieuwe wachtwoord in'
            }
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="sr-only">
                Nieuw wachtwoord
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Nieuw wachtwoord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Bevestig wachtwoord
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Bevestig wachtwoord"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
              />
            </div>
          </div>

          {(error || localError) && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error || localError}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Wachtwoord wijzigen...' : 'Wachtwoord wijzigen'}
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
      </div>
    </div>
  );
}