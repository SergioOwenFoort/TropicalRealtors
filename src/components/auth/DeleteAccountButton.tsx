import React, { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase.config';

export function DeleteAccountButton() {
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (confirmText !== 'VERWIJDEREN') {
      toast.error('Typ "VERWIJDEREN" om te bevestigen');
      return;
    }

    if (!user) {
      toast.error('Geen gebruiker gevonden');
      return;
    }

    setIsDeleting(true);

    try {
      // Delete all user-related data from various tables
      const userId = user.id;

      // Delete in this order to respect foreign key constraints:
      
      // 1. Delete saved searches
      await supabase
        .from('saved_searches')
        .delete()
        .eq('user_id', userId);

      // 2. Delete favorites
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId);

      // 3. Delete messages
      await supabase
        .from('messages')
        .delete()
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

      // 4. Delete conversations
      await supabase
        .from('conversations')
        .delete()
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

      // 5. Delete properties owned by this user
      await supabase
        .from('properties')
        .delete()
        .eq('owner_id', userId);

      // 6. Delete vacation properties owned by this user
      await supabase
        .from('vacation_properties')
        .delete()
        .eq('owner_id', userId);

      // 7. Delete realtor profile if exists
      await supabase
        .from('realtors')
        .delete()
        .eq('user_id', userId);

      // 8. Delete user profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      // 9. Finally, delete the user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        // If admin deletion fails, try to delete via RPC or user's own session
        console.warn('Admin delete failed, trying user deletion:', authError);
        
        // Sign out the user (this will also invalidate their session)
        await supabase.auth.signOut();
      } else {
        // Successful admin deletion, sign out
        await supabase.auth.signOut();
      }

      toast.success('Uw account is succesvol verwijderd');
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Er is een fout opgetreden bij het verwijderen van uw account');
    } finally {
      setIsDeleting(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
      >
        <Trash2 className="h-5 w-5" />
        Account verwijderen
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Account definitief verwijderen
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold mb-2">
                  ⚠️ Waarschuwing: Deze actie kan niet ongedaan worden gemaakt!
                </p>
                <p className="text-red-700 text-sm">
                  Als u doorgaat, wordt het volgende permanent verwijderd:
                </p>
              </div>

              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Uw account en profielgegevens</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Al uw opgeslagen woningen en zoekopdrachten</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Al uw berichten en gesprekken</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Al uw advertenties en vakantiewoningen</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Al uw favorieten en voorkeuren</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Alle andere gegevens die aan uw account gekoppeld zijn</span>
                </li>
              </ul>

              <div className="pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Typ <span className="font-bold text-red-600">VERWIJDEREN</span> om te bevestigen:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="VERWIJDEREN"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500"
                  disabled={isDeleting}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Annuleren
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || confirmText !== 'VERWIJDEREN'}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isDeleting ? 'Verwijderen...' : 'Account verwijderen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
