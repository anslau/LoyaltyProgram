import { useEffect, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { Link } from "react-router-dom";
import LogoutButton from "../../components/auth/LogoutButton";
import "../../styles/auth.css";
import TransactionTable from "../../components/TransactionTable";
import { Container } from "@mui/material";
import RoleSwitcher from '../../components/RoleSwitcher';
import { Box, Typography } from '@mui/material';

const navLinkStyle = {
    textDecoration: 'none',
    color: '#c48f8f',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  };

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
      <Box sx={{ maxWidth: '800px', margin: '0 auto' }}>
        <Box
          className="dashboard-nav"
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            paddingY: 2,
            paddingX: 3,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            borderRadius: 2,
            marginBottom: 3,
            backgroundColor: '#ffffff',
          }}
        >
          {/* Left Side: Title + Links */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Past Transactions
            </Typography>
            <Link to="/perks" style={navLinkStyle}>What's New</Link>
            <Link to="/profile" style={navLinkStyle}>Profile</Link>
            <Link to="/dashboard" style={navLinkStyle}>Dashboard</Link>
          </Box>

          {/* Right Side: Role Switch + Logout */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <RoleSwitcher />
            <LogoutButton />
          </Box>
        </Box>
      </Box>

      {/* === Main Content === */}
      <Box sx={{ maxWidth: '800px', margin: '0 auto', px: 2 }}>
        <TransactionTable
          fetchFunction={fetchTransactions}
          title="Your Transaction History"
        />
      </Box>
    </div>
  );
};

export default PastTransactions;