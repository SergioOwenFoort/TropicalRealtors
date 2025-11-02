import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Key } from 'lucide-react';
import { HCaptchaComponent } from '../../components/security/HCaptcha';
import { requireCaptcha } from '../../utils/captchaVerification';

export function ForgotPasswordResetPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get('email') || '';
  const token = searchParams.get('token');

  useEffect(() => {
    // Validate token presence
    if (!token) {
      setError('Ongeldige reset link. Vraag een nieuwe reset link aan.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Geen email adres gevonden. Vraag een nieuwe reset link aan.');
      return;
    }

    if (!token) {
      setError('Ongeldige reset link. Vraag een nieuwe reset link aan.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      return;
    }

    if (newPassword.length < 6) {
      setError('Wachtwoord moet minstens 6 karakters lang zijn');
      return;
    }

    // Verify captcha before proceeding
    if (!captchaToken) {
      setError('Voltooi alstublieft de CAPTCHA verificatie');
      return;
    }

    const captchaValid = await requireCaptcha(captchaToken);
    if (!captchaValid) {
      setError('CAPTCHA verificatie mislukt. Probeer het opnieuw.');
      setCaptchaToken('');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the new API endpoint for direct password reset
      const response = await fetch('/api/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          newPassword: newPassword
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update password');
      }

      setSuccess(true);
      
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Er is een fout opgetreden. Probeer het opnieuw of neem contact op met de beheerder.');
    } finally {
      setLoading(false);
    }
  };

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
              Uw wachtwoord is succesvol gewijzigd. U kunt nu inloggen met uw nieuwe wachtwoord.
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
        <div className="text-center">
          <Key className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Nieuw wachtwoord instellen
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Voor: <span className="font-medium text-gray-900">{email}</span>
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                Wachtwoord resetten
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                Voer hieronder uw nieuwe wachtwoord in om uw account toegang te herstellen.
              </p>
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Nieuw wachtwoord
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Voer nieuw wachtwoord in"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Bevestig wachtwoord
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Bevestig nieuw wachtwoord"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Fout</p>
                <p className="text-sm">{error}</p>
              </div>
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
              {loading 
                ? 'Bezig met verwerken...' 
                : 'Wachtwoord wijzigen'
              }
            </button>
          </div>

          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={() => navigate('/auth/login')}
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Terug naar inloggen
            </button>
            <br />
            <button
              type="button"
              onClick={() => navigate('/auth/reset-password')}
              className="text-gray-600 hover:text-gray-500 text-sm"
            >
              Nieuwe reset aanvragen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
