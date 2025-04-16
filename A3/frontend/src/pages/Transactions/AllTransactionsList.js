import { useEffect, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { Link } from "react-router-dom";
import LogoutButton from "../../components/auth/LogoutButton";
import "../../styles/auth.css";
import TransactionTable from "../../components/TransactionTable";
import { Container, FormControlLabel, FormGroup, Checkbox, TextField } from "@mui/material";
import RoleSwitcher from '../../components/RoleSwitcher';
import { Box, Typography } from '@mui/material';
import DashboardHeader from '../../components/dashboardHeader';

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
            <DashboardHeader
            title="All Transactions"
            />


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
                                <Link to={`/transactions/${value}`} className='details-link' style={{ textDecoration: 'none', fontWeight: 'bold' }}>
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