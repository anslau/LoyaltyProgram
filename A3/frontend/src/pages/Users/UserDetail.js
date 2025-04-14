import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, CircularProgress, Paper, Chip, Divider, Grid, IconButton, TextField, Button, FormControlLabel, FormGroup, Checkbox, MenuItem, Alert } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { useParams } from 'react-router-dom';
import '../../styles/auth.css';
import UserAvatar from '../../components/UserAvatar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const UserDetail = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const { token } = useContext(AuthContext);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [updatedUser, setUpdatedUser] = useState({
        email: '',
        verified: '',
        suspicious: '',
        role: '',
    });
    // to manage the roles the user can select
    const [currentUserRole, setCurrentUserRole] = useState('');

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
                console.log('user', data);

                // initialize the form for the updated user
                setUpdatedUser({
                    email: data.email,
                    verified: data.verified,
                    suspicious: data.suspicious === true,
                    role: data.role,
                });

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [userId, token]);

    // getting the logged in user's role
    useEffect(() => {
        const fetchCurrentUserRole = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/users/me`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch current user role');
                }
                const data = await response.json();
                setCurrentUserRole(data.role);
            } catch (error) {
                setError(error.message);
            }
        };
        fetchCurrentUserRole();
    }, [token]);

    const handleEditToggle = () => {
        setEditMode(!editMode);
        setError(null);
    }

    const validateEmail = (email) => {
        const emailFormat = /^[a-zA-Z0-9._%+-]+@mail\.utoronto\.ca$/;
        return emailFormat.test(email);
    };

    // submitting the form
    const handleSubmit = async (e) => {
        e.preventDefault();

        // validate email format
        if (!validateEmail(updatedUser.email)) {
            setError('Invalid email format. Please use a University of Toronto email address.');
            return;
        }


        setLoading(true);

        const payload = {
            ...updatedUser,
            email: updatedUser.email,
            verified: updatedUser.verified,
            suspicious: updatedUser.suspicious,
            role: updatedUser.role
        }

        console.log('payload', payload);

        try {
            const response = await fetch(`${BACKEND_URL}/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update user');
            }

            // const data = await response.json();
            setUser({ ...user, email: updatedUser.email, verified: updatedUser.verified, suspicious: updatedUser.suspicious, role: updatedUser.role });
            setEditMode(false);
            setLoading(false);


        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

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
            ) : !user ? (
                <Typography variant="body1">User not found</Typography>
            ) : editMode ? (
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Box component={'form'} onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>Edit User</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    value={updatedUser.email}
                                    onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })}
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
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Role"
                                    name="role"
                                    value={updatedUser.role}
                                    onChange={(e) => setUpdatedUser({ ...updatedUser, role: e.target.value })}
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
                                >
                                    {userRoles.map((option) => {
                                        // disable the options based on the current user's role
                                        const isDisabled = currentUserRole === "manager" && (option.value === "manager" || option.value === "superuser");

                                        return (
                                            <MenuItem key={option.value} value={option.value} disabled={isDisabled}
                                            sx={{
                                                '&.Mui-selected': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
                                                '&.Mui-selected:hover': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
                                              }}
                                              >
                                                {option.label}
                                            </MenuItem>
                                        );
                                    })}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormGroup>
                                    <FormControlLabel
                                        control={
                                            <Checkbox checked={updatedUser.verified === true}
                                                disabled={user.verified}
                                                onChange={(e) => setUpdatedUser({ ...updatedUser, verified: e.target.checked })}
                                                sx={{
                                                    '&.Mui-checked': {
                                                      color: '#c48f8f',
                                                    },
                                                  }}
                                            />
                                        }
                                        label="Verify"
                                    />
                                </FormGroup>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormGroup>
                                    <FormControlLabel
                                        control={
                                            <Checkbox checked={updatedUser.suspicious === true}
                                                onChange={(e) => setUpdatedUser({ ...updatedUser, suspicious: e.target.checked })}
                                                sx={{
                                                    '&.Mui-checked': {
                                                      color: '#c48f8f',
                                                    },
                                                  }}
                                            />
                                        }
                                        label="Marked Suspicious"
                                    />
                                </FormGroup>
                            </Grid>

                            <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={handleEditToggle}
                                    disabled={loading}
                                    sx={{ px: 4, color: 'rgb(101, 82, 82)', borderColor: 'rgb(101, 82, 82)' }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={loading}
                                    sx={{ backgroundColor: '#ebc2c2', color: 'rgb(101, 82, 82)' }}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Grid>

                            {error && (
                                <Grid item xs={12} sx={{ mt: 2 }}>
                                    <Alert severity="error" sx={{ mt: 2 }}>
                                        {error}
                                    </Alert>
                                </Grid>
                            )}

                        </Grid>
                    </Box>
                </Paper>
            ) : (
                <>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                <UserAvatar
                                    name={user.name}
                                    avatarUrl={user.avatarUrl}
                                    size={70}
                                />
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
                                            variant="filled"
                                            size="small"
                                        />
                                        <Chip
                                            label={user.suspicious ? 'Suspicious' : 'Not Suspicious'}
                                            color={user.suspicious ? 'warning' : 'primary'}
                                            variant="filled"
                                            size="small"
                                        />
                                    </Box>
                                </Box>
                            </Box>

                            <Box>
                                <IconButton color="primary" onClick={handleEditToggle} title="Edit" sx={{ color: '#c48f8f' }}>
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
                                    <Typography variant="body1">{user.birthday ? user.birthday.slice(0, 10) : "N/A"}</Typography>
                                </Grid>
                            )}


                            <Grid item xs={12} sm={4}>
                                <Typography variant="subtitle1" color="text.secondary">Points</Typography>
                                <Typography variant="body1">{user.points || 0}</Typography>
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <Typography variant="subtitle1" color="text.secondary">Created At</Typography>
                                <Typography variant="body1">{user.createdAt.slice(0, 10)}</Typography>
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <Typography variant="subtitle1" color="text.secondary">Last Login</Typography>
                                <Typography variant="body1">{user.lastLogin ? user.lastLogin.slice(0, 10) : 'Never'}</Typography>
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