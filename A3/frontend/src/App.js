import logo from './assets/logo.svg';
import './styles/App.css';
import React from 'react'; 
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; 
import Login from './pages/Login/Login'; 
import Dashboard from './pages/Dashboard'; 
import Transactions from './pages/Transactions';
import ProtectedRoute from './route/ProtectedRoute';

function App() { 
    return ( 
        <BrowserRouter>
            <Routes> 
                <Route path="/login" element={<Login />} /> 
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } /> 
                <Route path="/transactions" element={
                    <ProtectedRoute>
                        <Transactions />
                    </ProtectedRoute>
                } />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter> 
    ); 
}

// setup uses react-router-dom to change the browser URL 
// when navigating between pages and allows back/forward navigation.

export default App;





