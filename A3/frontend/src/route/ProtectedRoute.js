import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ roles = [] }) => {
    const { token, user, expiresAt, logout, loading } = React.useContext(AuthContext);

    // loading state
    if (loading) {
        return <div>Loading...</div>;
    }

    // validate token and expiry
    const isTokenValid = token && new Date(expiresAt) > new Date();
    if (!isTokenValid) {
        logout();
        return <Navigate to="/login" />;
    }

    // user authentication
    if (!user) {
        return <Navigate to="/login" />;
    }

    // role-based authorization
    // if (roles.length > 0 && !roles.includes(user.role)) {
    //     return <Navigate to="/unauthorized" />;  # not implemented
    // }
    //
    // Usage:
    // <Route element={<ProtectedRoute roles={['Manager', 'Superuser']} />}>
    //     <Route path="/admin" element={<AdminDashboard />} />
    // </Route>

    return <Outlet />;
};

export default ProtectedRoute; 