import logo from './logo.svg';
import './App.css';
import React from 'react'; 
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import Login from './pages/Login'; 
import Dashboard from './pages/Dashboard'; 
import Transactions from './pages/Transactions';

function App() { 
    return ( 
    <BrowserRouter> <Routes> 
        <Route path="/login" element={<Login />} /> 
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/transactions" element={<Transactions />} /> 
    </Routes> </BrowserRouter> 
    ); 
}

// setup uses react-router-dom to change the browser URL 
// when navigating between pages and allows back/forward navigation.

export default App;





