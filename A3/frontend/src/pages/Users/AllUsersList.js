import { useEffect, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { Link } from "react-router-dom";
import LogoutButton from "../../components/auth/LogoutButton";
import "../../styles/auth.css";
import UserListTable from "../../components/UserListTable";
import RoleSwitcher from '../../components/RoleSwitcher';
import { Box, Typography, Container } from '@mui/material';

const navLinkStyle = {
    textDecoration: 'none',
    color: '#c48f8f',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  };  

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const AllUsersList = () => {
    const { token } = useContext(AuthContext);
    
    const fetchUsers = async (filters) => {
        // reset the filters
        // window.history.pushState(null, '', `/users?`); 
        
        // build the query string from filters
        const queryString = {};
        Object.keys(filters).forEach(key => {
            if (filters[key] !== '') {
                queryString[key] = filters[key];
            }
        });
        const query = new URLSearchParams(queryString).toString();
        // window.history.pushState(null, '', `/users?${query}`); 
        const newUrl = `/users?${query ? `${query}` : ''}`;

        if (window.location.pathname + window.location.search !== newUrl) {
            window.history.pushState(null, '', newUrl);
        }

        // fetch the transactions with the filters applied
        const response = await fetch(`${BACKEND_URL}/users?${query}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch users');
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
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    User Register
                </Typography>
                <Link to="/dashboard" style={navLinkStyle}>Dashboard</Link>
                <Link to="/perks" style={navLinkStyle}>What's New</Link>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <RoleSwitcher />
                <LogoutButton />
                </Box>
            </Box>
            </Box>


            <Container maxWidth="lg" sx={{ padding: 1 }}>
                <UserListTable
                    fetchFunction={fetchUsers}
                    title="All Users"
                    columns={[
                        {
                            key: "id",
                            label: "Details",
                            render: (value) => (
                                <Link to={`/users/${value}`} style={{ textDecoration: 'none', color: 'rgb(101, 82, 82)'}}>
                                    Details
                                </Link>
                            ),
                        }
                    ]}
                />
            </Container>
        </div>
    );
};

export default AllUsersList;