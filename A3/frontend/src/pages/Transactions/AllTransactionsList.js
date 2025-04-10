import { useEffect, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { Link } from "react-router-dom";
import LogoutButton from "../../components/auth/LogoutButton";
import "../../styles/auth.css";
import TransactionTable from "../../components/TransactionTable";
import { Container, FormControlLabel, FormGroup, Checkbox, TextField } from "@mui/material";


const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const AllTransactionsList = () => {
    const { token } = useContext(AuthContext);
    
    const fetchTransactions = async (filters) => {
        // reset the filters
        window.history.pushState(null, '', `/transactions?`); 
        
        // build the query string from filters
        const queryString = {};
        Object.keys(filters).forEach(key => {
            if (filters[key] !== '') {
                queryString[key] = filters[key];
            }
        });
        const query = new URLSearchParams(queryString).toString();
        window.history.pushState(null, '', `/transactions?${query}`); 

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

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <div className="nav-content">
                    <h1 className="dashboard-title">Transaction History</h1>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Link to="/dashboard" style={{ marginRight: '20px', textDecoration: 'none', color: '#1976d2', fontWeight: 'bold' }}>
                        Dashboard
                        </Link>
                        <Link to="/perks" style={{ marginRight: '20px', textDecoration: 'none', color: '#1976d2', fontWeight: 'bold' }}>
                        What's New
                        </Link>
                        <LogoutButton />
                    </div>
                </div>
            </nav>

            <Container maxWidth="lg" sx={{ padding: 1 }}>
                <TransactionTable
                    fetchFunction={fetchTransactions}
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
                                <Link to={`/transactions/${value}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
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
                                setFilters({ ...filters, createBy: e.target.value });
                            }}
                            helperText="User who created the transaction"
                        />

                        <TextField
                            label="Name/Utorid"
                            onChange={(e) => {
                                setFilters({ ...filters, name: e.target.value });
                            }}
                            helperText="User who made the transaction"
                        />
                        
                        <FormGroup>
                            <FormControlLabel control={
                                <Checkbox checked={filters.suspicious || false}
                                onChange={(e) => {
                                    setFilters({ ...filters, suspicious: e.target.checked });
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