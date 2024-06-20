import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from './UserContext';

const AdminRoute = () => {
  const { user } = useUser();

  return user && user.user.is_admin ? <Outlet /> : <Navigate to="/" />;
};

const UserRoute = () => {
  const { user } = useUser();

  return user && !user.user.is_admin ? <Outlet /> : <Navigate to="/" />;
};

export { AdminRoute, UserRoute };