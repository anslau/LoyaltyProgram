import { useEffect, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { Link } from "react-router-dom";
import LogoutButton from "../../components/auth/LogoutButton";
import "../../styles/auth.css";
import TransactionTable from "../../components/TransactionTable";
import { Container } from "@mui/material";
import RoleSwitcher from '../../components/RoleSwitcher';
import { Box, Typography } from '@mui/material';
import DashboardHeader from '../../components/dashboardHeader';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const PastTransactions = () => {
    const { token } = useContext(AuthContext);
    
    const fetchTransactions = async (filters) => {
        // reset the filters
        // window.history.pushState(null, '', `/users/me/transactions?`); 
        
        // build the query string from filters
        const queryString = {};
        Object.keys(filters).forEach(key => {
            if (filters[key] !== '') {
                queryString[key] = filters[key];
            }
        });
        const query = new URLSearchParams(queryString).toString();
        // window.history.pushState(null, '', `/users/me/transactions?${query}`); 

        const newUrl = `/users/me/transactions?${query ? `${query}` : ''}`;

        if (window.location.pathname + window.location.search !== newUrl) {
            window.history.pushState(null, '', newUrl);
        }

        // fetch the transactions with the filters applied
        const response = await fetch(`${BACKEND_URL}/users/me/transactions?${query}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            console.error(response);
            throw new Error('Failed to fetch transactions');
        }

        return await response.json();
    }; 

    return (
        <div className="dashboard-container">
            <DashboardHeader
            title="Your Transactions"
            />


      {/* === Main Content === */}
      <Box sx={{ maxWidth: '800px', margin: '0 auto', px: 2 }}>
        <TransactionTable
          fetchFunction={fetchTransactions}
          title="Your Transactions"
        />
      </Box>
    </div>
  );
};

export default PastTransactions;