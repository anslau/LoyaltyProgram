import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, CircularProgress, Paper, Chip, Divider, Grid, IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { useParams } from 'react-router-dom';
import '../../styles/auth.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const UserDetail = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const { token } = useContext(AuthContext);
    const [user, setUser] = useState(null);

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ editMode, setEditMode ] = useState(false);

    // Dropdown constants
    const userRoles = [
        { value: 'regular', label: 'Regular' },
        { value: 'cashier', label: 'Cashier' },
        { value: 'manager', label: 'Manager' },
        { value: 'superuser', label: 'Superuser' },
    ];

    const chipColour = (type) => {
        switch (type) {
            case 'regular': return 'success';
            case 'cashier': return 'error';
            case 'manager': return 'warning';
            case 'superuser': return 'info';
        }
    };

    // getting the user details
    useEffect(() => {
        const fetchUserDetails = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${BACKEND_URL}/users/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user details');
                }

                const data = await response.json();
                setUser(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [userId, token]);

    const handleEditToggle = () => {
        setEditMode(!editMode);
    }

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate('/users')} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4">User Details</Typography>
            </Box>

            {loading ? (
                <Typography variant="body1"><CircularProgress /></Typography>
            ) : error ? (
                <Typography variant="body1" color="error">{error}</Typography>
            ) : !user ? (
                <Typography variant="body1">User not found</Typography>
            ) : (
                <>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                            <Box>
                                <Typography variant="h5" gutterBottom>{user.name}</Typography>
                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <Chip
                                        label={user.role}
                                        color={chipColour(user.role)}
                                        size="small"
                                    />
                                    <Chip
                                        label={user.verified ? 'Verified' : 'Not Verified'}
                                        color={user.verified ? 'success' : 'error'}
                                        variant="outlined"
                                        size="small"
                                    />
                                </Box>
                            </Box>

                            <Box>
                                <IconButton color="primary" onClick={handleEditToggle} title="Edit">
                                    <EditIcon />
                                </IconButton>
                            </Box>

                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" color="text.secondary">Utorid</Typography>
                            <Typography variant="body1" paragraph>{user.utorid}</Typography>
                        </Grid>

                        {user.email !== '' && (
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" color="text.secondary">Email</Typography>
                                <Typography variant="body1">{user.email || 'N/A'}</Typography>
                            </Grid>
                        )}

                        {user.birthday && (
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" color="text.secondary">Birthday</Typography>
                                <Typography variant="body1">{user.birthday}</Typography>
                            </Grid>
                        )}


                        <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle1" color="text.secondary">Points</Typography>
                            <Typography variant="body1">{user.points}</Typography>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle1" color="text.secondary">Created At</Typography>
                            <Typography variant="body1">{user.createdAt}</Typography>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle1" color="text.secondary">Last Login</Typography>
                            <Typography variant="body1">{user.lastLogin || 'Never'}</Typography>
                        </Grid>


                        {user.promotions && user.promotions.length > 0 && (
                            <Grid item xs={12} sm={4}>
                                <Typography variant="subtitle1" color="text.secondary">Promotions</Typography>
                                {user.promotions.map((promo, index) => (
                                    <Typography key={index} variant="body1">
                                        {promo.name}
                                    </Typography>
                                ))}
                            </Grid>
                        )}
                    </Grid>
                </Paper>
        </>
    )
}

        </Box >
    );
}

export default UserDetail;