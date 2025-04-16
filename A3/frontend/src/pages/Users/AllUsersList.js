import { useEffect, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { Link } from "react-router-dom";
import LogoutButton from "../../components/auth/LogoutButton";
import "../../styles/auth.css";
import UserListTable from "../../components/UserListTable";
import RoleSwitcher from '../../components/RoleSwitcher';
import { Box, Typography, Container } from '@mui/material';
import DashboardHeader from '../../components/dashboardHeader';

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
        <DashboardHeader
            title="All Users"
        />

            <Container maxWidth="lg" sx={{ padding: 1 }}>
                <UserListTable
                    fetchFunction={fetchUsers}
                    title="All Users"
                    columns={[
                        {
                            key: "id",
                            label: "Details",
                            render: (value) => (
                                <Link to={`/users/${value}`} className='details-link' style={{ textDecoration: 'none', fontWeight: 'bold' }}>
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