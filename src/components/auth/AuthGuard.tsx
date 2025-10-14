import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoadingSpinner } from '../LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { useUserRole } from '../../hooks/useUserRole';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireRealtor?: boolean;
  requireOwner?: boolean;
  requireBusiness?: boolean;
  requireHoro?: boolean;
}

export function AuthGuard({ 
  children, 
  requireAuth = true,
  requireAdmin = false,
  requireRealtor = false,
  requireOwner = false,
  requireBusiness = false,
  requireHoro = false
}: AuthGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isRealtor, isOwner, isBusiness, isHoro, isLoading: roleLoading } = useUserRole();
  const location = useLocation();

  // Show loading spinner while checking auth and role
  if (authLoading || roleLoading) {
    return <LoadingSpinner />;
  }

  if (requireAuth && !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireRealtor && !isRealtor) {
    return <Navigate to="/" replace />;
  }

  if (requireOwner && !isOwner) {
    return <Navigate to="/" replace />;
  }

  if (requireBusiness && !isBusiness) {
    return <Navigate to="/" replace />;
  }

  if (requireHoro && !isHoro) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
