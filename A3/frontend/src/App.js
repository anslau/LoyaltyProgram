import './styles/App.css';
import React from 'react'; 
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; 

import Login from './pages/Login/Login'; 
import Dashboard from './pages/Dashboard'; 
import Transactions from './pages/Transactions';
import ProtectedRoute from './route/ProtectedRoute';
import OrganizerEvents from './pages/Organizer/OrganizerEvents';
import EventManage     from './pages/Organizer/EventManage';

function App() {
    return (
      <BrowserRouter>
        <Routes>
          {/* public */}
          <Route path="/login" element={<Login />} />
  
          {/* protected */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/transactions"
            element={<ProtectedRoute><Transactions /></ProtectedRoute>}
          />
  
          {/* organizer */}
          <Route
            path="/organizer/events"
            element={<ProtectedRoute><OrganizerEvents /></ProtectedRoute>}
          />
          <Route
            path="/organizer/events/:id"
            element={<ProtectedRoute><EventManage /></ProtectedRoute>}
          />
  
          {/* default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    );
}
  

// setup uses react-router-dom to change the browser URL 
// when navigating between pages and allows back/forward navigation.

export default App;





