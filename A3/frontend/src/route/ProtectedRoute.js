import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

// Set this to true to bypass authentication in development
const BYPASS_AUTH = process.env.REACT_APP_BYPASS_AUTH === 'true';

const ProtectedRoute = ({ children, roles = [] }) => {
    // Bypass authentication if environment variable is set
    if (BYPASS_AUTH && process.env.NODE_ENV === 'development') {
        console.log('Authentication bypassed for development');
        if (children) {
            return children;
        }
        return <Outlet />;
    }

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