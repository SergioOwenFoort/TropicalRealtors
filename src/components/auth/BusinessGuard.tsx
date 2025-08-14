import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUserRole } from '../../hooks/useUserRole';
import { LoadingSpinner } from '../LoadingSpinner';

export function BusinessGuard() {
  const { isBusiness, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isBusiness) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}
