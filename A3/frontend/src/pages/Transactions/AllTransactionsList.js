import { useEffect, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { Link } from "react-router-dom";
import LogoutButton from "../../components/auth/LogoutButton";
import "../../styles/auth.css";
import TransactionTable from "../../components/TransactionTable";
import { Container, FormControlLabel, FormGroup, Checkbox, TextField } from "@mui/material";
import RoleSwitcher from '../../components/RoleSwitcher';
import { Box, Typography } from '@mui/material';

const navLinkStyle = {
    textDecoration: 'none',
    color: '#c48f8f',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  };  

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const AllTransactionsList = () => {
    const { token } = useContext(AuthContext);
    
    const fetchTransactions = async (filters) => {
        // reset the filters
        // window.history.pushState(null, '', `/transactions?`); 
        
        // build the query string from filters
        const queryString = {};
        Object.keys(filters).forEach(key => {
            if (filters[key] !== '') {
                queryString[key] = filters[key];
            }
        });
        const query = new URLSearchParams(queryString).toString();
        // window.history.pushState(null, '', `/transactions?${query}`); 
        const newUrl = `/transactions?${query ? `${query}` : ''}`;

        if (window.location.pathname + window.location.search !== newUrl) {
            window.history.pushState(null, '', newUrl);
        }

        // fetch the transactions with the filters applied
        const response = await fetch(`${BACKEND_URL}/transactions?${query}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }

        return await response.json();
    }; 

    const fetchRelatedTransaction = async (transactionId) => {
        const response = await fetch(`${BACKEND_URL}/transactions/${transactionId}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch transaction');
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
                {/* Left: Title + Links */}
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Transaction History
                </Typography>
                <Link to="/perks" style={navLinkStyle}>What's New</Link>
                <Link to="/profile" style={navLinkStyle}>Profile</Link>
                <Link to="/dashboard" style={navLinkStyle}>Dashboard</Link>
                </Box>

                {/* Right: Role Switcher + Logout */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <RoleSwitcher />
                <LogoutButton />
                </Box>
            </Box>
            </Box>

            <Container maxWidth="lg" sx={{ padding: 1 }}>
                <TransactionTable
                    fetchFunction={fetchTransactions}
                    fetchRelatedFunction={fetchRelatedTransaction}
                    title="All Transactions"
                    columns={[
                        
                        {
                            key: "utorid",
                            label: "Utorid",
                            render: (value) => value,
                        },
                        {
                           key: "suspicious",
                           label: "Suspicious", 
                           render: (value) => value === true ? "Yes" : "No",
                        },
                        {
                            key: "id",
                            label: "Details",
                            render: (value) => (
                                <Link to={`/transactions/${value}`} style={{ textDecoration: 'none', color: '#c48f8f' }}>
                                    Details
                                </Link>
                            ),
                        }
                    ]}
                    additionalFilters={(filters, setFilters) => (
                        <>
                        <TextField
                            label="Created By"
                            onChange={(e) => {
                                setFilters({ ...filters, createdBy: e.target.value });
                            }}
                            helperText="User who created the transaction"
                            sx={{ mb: 1,
                                '& .MuiOutlinedInput-root.Mui-focused': {
                                  '& fieldset': {
                                    borderColor: 'rgb(101, 82, 82)', 
                                  },
                                },
                                '& label.Mui-focused': {
                                  color: 'rgb(101, 82, 82)', 
                                }
                              }}
                        />

                        <TextField
                            label="Name/Utorid"
                            onChange={(e) => {
                                setFilters({ ...filters, name: e.target.value });
                            }}
                            helperText="User who made the transaction"
                            sx={{ mb: 1,
                                '& .MuiOutlinedInput-root.Mui-focused': {
                                  '& fieldset': {
                                    borderColor: 'rgb(101, 82, 82)', 
                                  },
                                },
                                '& label.Mui-focused': {
                                  color: 'rgb(101, 82, 82)', 
                                }
                              }}
                        />
                        
                        <FormGroup>
                            <FormControlLabel control={
                                <Checkbox checked={filters.suspicious || false}
                                onChange={(e) => {
                                    setFilters({ ...filters, suspicious: e.target.checked });
                                }}
                                sx={{
                                    '&.Mui-checked': {
                                      color: '#c48f8f', 
                                    },
                                  }}
                                />
                            } 
                            label="Suspicious Transactions Only" 
                            />
                        </FormGroup>
                        </>
                    )}
                />
            </Container>
        </div>
    );
};

export default AllTransactionsList;