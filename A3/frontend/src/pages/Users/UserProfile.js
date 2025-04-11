import { useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import LogoutButton from '../../components/auth/LogoutButton';
import QrCode from '../../components/qrCode';
import { Box, CircularProgress, Button, IconButton, Grid, Typography, TextField, styled, Alert } from '@mui/material';
import { Edit as EditIcon, CloudUpload, Done as DoneIcon } from '@mui/icons-material';
import UserAvatar from '../../components/UserAvatar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const UserProfile = () => {
    const { token } = useContext(AuthContext);
    const [user, setUser] = useState({});
    const [userForm, setUserForm] = useState({
        name: '',
        email: '',
        birthday: '',
        avatar: '',
    });
    const [qrCodeOpen, setQrCodeOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [avatarUploaded, setAvatarUploaded] = useState(false);

    // fetching the logged in user details
    useEffect(() => {
        setLoading(true);
        fetch(`${BACKEND_URL}/users/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setUser(data);
                setUserForm({
                    name: data.name,
                    email: data.email,
                    birthday: data.birthday,
                    avatar: data.avatarUrl,
                });
                setLoading(false);
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false);
            })
    }, [token]);

    //////// FROM MUI BUTTON DOCUMENTATION //////////
    // https://mui.com/material-ui/react-button/
    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });
    /////////////////////////////////////////////////

    const handleEditToggle = () => {
        setEditMode(!editMode);
        setError(null);
        setSuccess(false);
    }

    const validateInputs = () => {
        const nameRegex = /^[a-zA-Z ]{1,50}$/;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@mail\.utoronto\.ca$/;

        if (userForm.name !== '' && !nameRegex.test(userForm.name)) {
            setError('Name must be 1-50 characters long.');
            return false;
        } else if (userForm.email !== '' && !emailRegex.test(userForm.email)) {
            setError('Email must be a valid UofT email address.');
            return false;
        } else {
            return true;
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateInputs()) {
            return;
        }

        try {
            const payload = {
                name: userForm.name,
                email: userForm.email !== user.email ? userForm.email : '',
                birthday: userForm.birthday,
                avatar: userForm.avatar
            };

            console.log(payload);

            const response = await fetch(`${BACKEND_URL}/users/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message);
                return;
            }
            const data = await response.json();
            setUser(data);
            setLoading(false);
            setEditMode(false);
            setSuccess(true);

        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    }

    return (
        <div className="user-profile-container">
            <nav className="dashboard-nav">
                <div className="nav-content">
                    <h1 className="dashboard-title">My Profile</h1>
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

            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 2, gap: 4 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <div className="user-profile-details">
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 2, borderRadius: 2, gap: 2 }}>
                                <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size={256} />
                                <Button variant="outlined" onClick={() => setQrCodeOpen(true)} style={{ marginRight: '20px' }}>
                                    QR Code
                                </Button>
                            </Box>
                            <QrCode open={qrCodeOpen} onClose={() => setQrCodeOpen(false)} user={user} />
                        </div>

                        <div className="user-profile-info">
                            <Box component={"form"} onSubmit={handleSubmit} sx={{ padding: 2, backgroundColor: '#f5f5f5', borderRadius: 2, position: 'relative' }}>
                                <IconButton color="primary" onClick={handleEditToggle} title="Edit" sx={{ position: 'absolute', top: 0, right: 0 }}>
                                    {!editMode && (<EditIcon />)}
                                </IconButton>

                                <Grid container spacing={1} direction={'column'} alignItems="flex-start">
                                    <Grid item xs={12}>
                                        <h2>{editMode ? 'Edit Profile' : 'Profile Details'}</h2>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="h6">
                                            <strong>Name:</strong> {editMode ? (
                                                <TextField
                                                    type="text"
                                                    size="medium"
                                                    value={userForm.name}
                                                    onChange={(e) => {
                                                        setUserForm({ ...userForm, name: e.target.value });
                                                        setError('');
                                                        setSuccess(false);
                                                    }}
                                                />
                                            ) : user.name}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="h6">
                                            <strong>Utorid: </strong>{user.utorid}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} sx={{ maxWidth: 400, width: '100%' }}>
                                        <Typography variant="h6">
                                            <strong>Email: </strong> {editMode ? (
                                                <TextField
                                                    type="text"
                                                    value={userForm.email}
                                                    onChange={(e) => {
                                                        setUserForm({ ...userForm, email: e.target.value });
                                                        setError('');
                                                        setSuccess(false);
                                                    }}
                                                />
                                            ) : user.email}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} sx={{ maxWidth: 400, width: '100%' }}>
                                        <Typography variant="h6">
                                            <strong>Birthday: </strong> {editMode ? (
                                                <TextField
                                                    type="date"
                                                    value={userForm.birthday}
                                                    onChange={
                                                        (e) => {
                                                            setUserForm({ ...userForm, birthday: e.target.value });
                                                            setError('');
                                                            setSuccess(false);
                                                        }

                                                    }
                                                />
                                            ) : user.birthday || 'N/A'}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="h6">
                                            <strong>Role: </strong>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="h6">
                                            <strong>Points: </strong>{user.points}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="h6">
                                            <strong>Created At: </strong>{user.createdAt}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="h6">
                                            <strong>Last Login: </strong>{user.lastLogin}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="h6">
                                            <strong>Verified: </strong>{user.verified === true ? 'Yes' : 'No'}
                                        </Typography>
                                    </Grid>

                                    {editMode && (
                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Button
                                                    variant="contained"
                                                    component="label"
                                                    startIcon={<CloudUpload />}
                                                    sx={{ marginTop: 2 }}
                                                >
                                                    Upload Avatar
                                                    <VisuallyHiddenInput
                                                        type="file"
                                                        multiple
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    setUserForm({ ...userForm, avatar: reader.result });
                                                                    setAvatarUploaded(true);
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                </Button>
                                                {avatarUploaded && (
                                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                                        <DoneIcon />
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Grid>
                                    )}

                                    {editMode && (
                                        <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                            <Button
                                                variant="outlined"
                                                onClick={handleEditToggle}
                                                disabled={loading}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                disabled={loading}
                                            >
                                                {loading ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                        </Grid>
                                    )}

                                </Grid>
                            </Box>

                            {error && (
                                <Grid item xs={12} sx={{ mt: 2 }}>
                                    <Alert severity="error" sx={{ mt: 2 }}>
                                        {error}
                                    </Alert>
                                </Grid>
                            )}

                            {success && (
                                <Grid item xs={12} sx={{ mt: 2 }}>
                                    <Alert severity="success" sx={{ mt: 2 }}>
                                        Profile updated successfully!
                                    </Alert>
                                </Grid>
                            )}
                        </div>
                    </>
                )}
            </Box>

        </div>
    );
}

export default UserProfile;