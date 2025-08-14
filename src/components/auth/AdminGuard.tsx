import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUserRole } from '../../hooks/useUserRole';
import { LoadingSpinner } from '../LoadingSpinner';

export function AdminGuard() {
  const { isAdmin, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
