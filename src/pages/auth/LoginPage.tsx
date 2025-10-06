import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useSupabaseAuthActions as useAuthActions } from '../../hooks/useSupabaseAuthActions';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from '../../components/ui/Logo';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithGoogle, error, loading } = useAuthActions();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      // If the user was trying to access a specific page, redirect them there
      // Otherwise, send them to the account page which will route them based on their role
      const from = location.state?.from?.pathname || '/account';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state?.from?.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    // Don't navigate here - the useEffect will handle navigation when user state updates
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
    // Don't navigate here - the useEffect will handle navigation when user state updates
  };

  // If user is already authenticated, don't render the login form
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
          <h2 className="text-center text-3xl font-bold text-gray-900">Inloggen</h2>
          <div className="w-6" />
        </div>

        <p className="mt-2 text-center text-sm text-gray-600">
          Welcome at TropicalRealtors.com
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
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Wachtwoord"
                  disabled={loading}
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
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Onthoud mij
              </label>
            </div>

            <div className="text-sm">
              <Link to="/auth/reset-password" className="font-medium text-blue-600 hover:text-blue-500">
                Wachtwoord vergeten?
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LogIn className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
              </span>
              {loading ? 'Bezig met inloggen...' : 'Inloggen'}
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
              <img 
                className="h-5 w-5"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google logo"
              />
              <span className="ml-2">Inloggen met Google</span>
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Nog geen account?{' '}
          <Link to="/auth/registreren" className="font-medium text-blue-600 hover:text-blue-500">
            Registreer nu
          </Link>
        </p>
      </div>
    </main>
  );
}
