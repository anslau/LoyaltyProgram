import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
    const { token, user, expiresAt, logout } = React.useContext(AuthContext);

    // validate token and expiry
    const isTokenValid = token && new Date(expiresAt) > new Date();
    if (!isTokenValid) {
        logout();
        return <Navigate to="/login" />;
    }

    // user authentication
    // if (!user) {
    //     return <Navigate to="/login" />;
    // }
    
    // role-based authorization
    // if (roles.length > 0 && !roles.includes(user.role)) {
    //     return <Navigate to="/unauthorized" />;  # not implemented
    // }
    //
    // Usage:
    // <Route element={<ProtectedRoute roles={['Manager', 'Superuser']} />}>
    //     <Route path="/admin" element={<AdminDashboard />} />
    // </Route>

    // if this component is used as a wrapper (with children)
    if (children) {
        return children;
    }

    // if this component is used as an outlet wrapper
    return <Outlet />;
};

export default ProtectedRoute; 