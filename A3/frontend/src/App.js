import './styles/App.css';
import React from 'react'; 
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; 

import Login from './pages/Login/Login'; 
import Dashboard from './pages/Dashboard'; 
import Transactions from './pages/Transactions';
import PerksPage from './pages/Perks/PerksPage';
import EventDetail from './pages/Perks/Events/EventDetail';
import ProtectedRoute from './route/ProtectedRoute';
import OrganizerEvents from './pages/Organizer/OrganizerEvents';
import EventManage     from './pages/Organizer/EventManage';

function App() { 
    return ( 
        <BrowserRouter>
            <Routes> 
                {/* Redirect to dashboard if authenticated, otherwise to login */} 
                <Route path="/" element={
                    <ProtectedRoute>
                        <Navigate to="/dashboard" />
                    </ProtectedRoute>
                }/>
                <Route path="/login" element={<Login />} /> 

                <Route element={<ProtectedRoute />} >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/perks" element={<PerksPage />} />
                    <Route path="/events/:eventId" element={<EventDetail />} />
                </Route>
                
                {/* Fallback for unmatched routes */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    ); 
}
  

// setup uses react-router-dom to change the browser URL 
// when navigating between pages and allows back/forward navigation.

export default App;
