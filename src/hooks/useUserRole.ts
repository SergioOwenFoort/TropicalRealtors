import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../config/supabase.config';

export function useUserRole() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRealtor, setIsRealtor] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);
  const [isHoro, setIsHoro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getUserRole() {
      if (!user) {
        setIsAdmin(false);
        setIsRealtor(false);
        setIsOwner(false);
        setIsBusiness(false);
        setIsHoro(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          if (error.code === '500' || error.code === '42P17') {
            console.warn(`Server error when fetching role (${error.code}) - checking for admin email`);
            
            // Special check for admin email when we have policy issues
            if (user.email === 's.admin@bonairemakelaars.com') {
              console.log('Admin email detected, granting admin role as fallback');
              setIsAdmin(true);
              setIsRealtor(false);
              setIsOwner(false);
              setIsBusiness(false);
              setIsHoro(false);
            } else {
              setIsAdmin(false);
              setIsRealtor(false);
              setIsOwner(false);
              setIsBusiness(false);
              setIsHoro(false);
            }
          } else {
            throw error;
          }
        } else {
          const role = profile?.role || 'user';
          setIsAdmin(role === 'admin');
          setIsRealtor(role === 'realtor');
          setIsOwner(role === 'owner');
          setIsBusiness(role === 'business');
          setIsHoro(role === 'horo');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        
        // Handle policy recursion error specifically for admin email
        if (error && typeof error === 'object' && 'code' in error && error.code === '42P17' && 
            user.email === 's.admin@bonairemakelaars.com') {
          console.log('Policy recursion error, but admin email detected - granting admin access');
          setIsAdmin(true);
          setIsRealtor(false);
          setIsOwner(false);
          setIsBusiness(false);
          setIsHoro(false);
        } else {
          // Set all roles to false on error to prevent unauthorized access
          setIsAdmin(false);
          setIsRealtor(false);
          setIsOwner(false);
          setIsBusiness(false);
          setIsHoro(false);
        }
      } finally {
        setIsLoading(false);
      }
    }

    getUserRole();
  }, [user]);

  return { isAdmin, isRealtor, isOwner, isBusiness, isHoro, isLoading };
}
