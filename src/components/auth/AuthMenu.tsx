import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, X, LayoutDashboard, Building2, Settings, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUserRole } from '../../hooks/useUserRole';
import { useSupabaseAuthActions } from '../../hooks/useSupabaseAuthActions';

interface AuthMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthMenu({ isOpen, onClose }: AuthMenuProps) {
  const { user } = useAuth();
  const { isAdmin, isRealtor, isHoro } = useUserRole();
  const { logout } = useSupabaseAuthActions();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      
      // Add a small delay to ensure auth state is updated
      setTimeout(() => {
        navigate('/');
      }, 100);
    } catch (error) {
      console.error('AuthMenu: Logout error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Account</h2>

        <div className="space-y-4">
          {user ? (
            <>
              <div className="mb-6">
                <p className="text-lg font-medium">{user.user_metadata.displayName || user.email}</p>
                <p className="text-gray-600">{user.email}</p>
              </div>

              <Link
                to="/profiel"
                className="flex items-center gap-3 w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={onClose}
              >
                <User className="w-5 h-5" />
                <span>Mijn Profiel</span>
              </Link>

              {!isRealtor && !isHoro && (
                <Link
                  to="/account"
                  className="flex items-center gap-3 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={onClose}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
              )}

              {isRealtor && (
                <Link
                  to="/makelaar"
                  className="flex items-center gap-3 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={onClose}
                >
                  <Building2 className="w-5 h-5" />
                  <span>Makelaarsdashboard</span>
                </Link>
              )}

              {isHoro && (
                <Link
                  to="/horo"
                  className="flex items-center gap-3 w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  onClick={onClose}
                >
                  <Building2 className="w-5 h-5" />
                  <span>HoRe Dashboard</span>
                </Link>
              )}

              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 w-full px-4 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                    onClick={onClose}
                  >
                    <Settings className="w-5 h-5" />
                    <span>Admin Dashboard</span>
                  </Link>
                  <Link
                    to="/admin/profiel"
                    className="flex items-center gap-3 w-full px-4 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                    onClick={onClose}
                  >
                    <User className="w-5 h-5" />
                    <span>Admin Profiel</span>
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Uitloggen
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="flex items-center gap-3 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={onClose}
              >
                <LogIn className="w-5 h-5" />
                <span>Inloggen</span>
              </Link>
              
              <Link
                to="/auth/registreren"
                className="flex items-center gap-3 w-full px-4 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                onClick={onClose}
              >
                <UserPlus className="w-5 h-5" />
                <span>Registreren</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
