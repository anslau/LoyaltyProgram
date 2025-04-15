import './styles/App.css';
import React from 'react'; 
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; 
import { ActiveRoleProvider } from './context/ActiveRoleContext';

import Registration from './pages/Login/Register'; 
import Login from './pages/Login/Login'; 
import Dashboard from './pages/Dashboard'; 
import PastTransactions from './pages/Transactions/PastTransactions';
import AllTransactionsList from './pages/Transactions/AllTransactionsList';
import TransactionDetail from './pages/Transactions/TransactionDetail';
import PerksPage from './pages/Perks/PerksPage';
import EventDetail from './pages/Perks/Events/EventDetail';
import CreatePromotion from './pages/Perks/Promotions/CreatePromotion';
import PromotionDetail from './pages/Perks/Promotions/PromotionDetail';
import CreateEvent from './pages/Perks/Events/CreateEvent';
import PromotionsPage from './pages/Perks/Promotions/PromotionsPage';
import EventsPage from './pages/Perks/Events/EventsPage';
import ProtectedRoute from './route/ProtectedRoute';
import AllUsersList from './pages/Users/AllUsersList';
import OrganizerEvents from './pages/Organizer/OrganizerEvents';
import EventManage     from './pages/Organizer/EventManage';
import ResetRequest from './pages/Login/ResetRequest';
import ResetConfirm from './pages/Login/ResetConfirm';
import UserDetail from './pages/Users/UserDetail';
import TransferPoints from './pages/TransferPoints';
import UserProfile from './pages/Users/UserProfile';
import RegularUserPromotionPage from './pages/Perks/Promotions/RegularUserPromotionPage';
import RegularUserPerksPage from './pages/Perks/RegularUserPerksPage';

function App() { 
    return ( 
        <ActiveRoleProvider>
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
                    <Route path="/perks" element={<PerksPage />} />
                    <Route path="/regularperks" element={<RegularUserPerksPage />} />
                    <Route path="/promotions" element={<PromotionsPage />} />
                    <Route path="/regularpromotions" element={<RegularUserPromotionPage />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/events/:eventId" element={<EventDetail />} />
                    <Route path="/events/create" element={<CreateEvent />} />
                    <Route path="/promotions/create" element={<CreatePromotion />} />
                    <Route path="/promotions/:promotionId" element={<PromotionDetail />} />
                    <Route path="/users/me/transactions" element={<PastTransactions />} />
                    <Route path="/transactions" element={<AllTransactionsList />} />
                    <Route path="/transactions/:transactionId" element={<TransactionDetail />} />
                    <Route path="/users" element={<AllUsersList />} />
                    <Route path="/users/:userId" element={<UserDetail />} />
                    <Route path="/transfer" element={<TransferPoints />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/register" element={<Register />} />
                </Route>

                {/* Organizer/Manager event management page */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/organizer/events" element={<OrganizerEvents />} />
                    <Route path="/organizer/events/:eventId" element={<EventManage />} />
                </Route>

                <Route path="/reset-request" element={<ResetRequest />} />
                <Route path="/reset-confirm/:resetToken" element={<ResetConfirm />} />


                {/* Fallback for unmatched routes */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
        </ActiveRoleProvider>
    ); 
}
  

// setup uses react-router-dom to change the browser URL 
// when navigating between pages and allows back/forward navigation.

export default App;