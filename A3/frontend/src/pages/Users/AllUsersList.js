import { useEffect, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { Link } from "react-router-dom";
import LogoutButton from "../../components/auth/LogoutButton";
import "../../styles/auth.css";
import UserListTable from "../../components/UserListTable";
import { Container } from "@mui/material";


const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const AllUsersList = () => {
    const { token } = useContext(AuthContext);
    
    const fetchUsers = async (filters) => {
        // reset the filters
        window.history.pushState(null, '', `/users?`); 
        
        // build the query string from filters
        const queryString = {};
        Object.keys(filters).forEach(key => {
            if (filters[key] !== '') {
                queryString[key] = filters[key];
            }
        });
        const query = new URLSearchParams(queryString).toString();
        window.history.pushState(null, '', `/users?${query}`); 

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
            <nav className="dashboard-nav">
                <div className="nav-content">
                    <h1 className="dashboard-title">User Register</h1>
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
                <UserListTable
                    fetchFunction={fetchUsers}
                    title="All Users"
                    columns={[
                        {
                            key: "id",
                            label: "Details",
                            render: (value) => (
                                <Link to={`/users/${value}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
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