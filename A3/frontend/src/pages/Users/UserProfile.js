import { useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import LogoutButton from '../../components/auth/LogoutButton';
import QrCode from '../../components/qrCode';
import { Box, CircularProgress, Button, IconButton, Grid, Typography, TextField, styled, Alert, InputAdornment } from '@mui/material';
import { Edit as EditIcon, CloudUpload, Done as DoneIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import RoleSwitcher from '../../components/RoleSwitcher';
import UserAvatar from '../../components/UserAvatar';
import ActiveRoleContext from '../../context/ActiveRoleContext';
import '../../styles/auth.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const UserProfile = () => {
    const { token } = useContext(AuthContext);
    const { activeRole } = useContext(ActiveRoleContext);
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

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [passwordForm, setPasswordForm] = useState({
        old: '',
        new: '',
    });
    const [changePassword, setChangePassword] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const navLinkStyle = {
        textDecoration: 'none',
        color: '#c48f8f',
        fontWeight: 'bold',
        fontSize: '0.9rem',
    };

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

    // const validateNewPassword = () => {
    // };
    const handleChangePassword = () => {
        setChangePassword(!changePassword);
        setPasswordError(null);
        setPasswordSuccess(false);
    }

    const handlePasswordReset = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                old: passwordForm.old,
                new: passwordForm.new,
            };

            const response = await fetch(`${BACKEND_URL}/users/me/password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setPasswordError(errorData.message);
                setPasswordForm({ old: '', new: '' });
                return;
            }

            setLoading(false);
            setChangePassword(false);
            setPasswordSuccess(true);

        } catch (error) {
            setPasswordError(error.message);

            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
        <div className="nav-content">
          <h1 className="dashboard-title">Your Profile</h1>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/dashboard" style={{ marginRight: '20px', textDecoration: 'none', color: '#c48f8f', fontWeight: 'bold' }}>
              Dashboard
            </Link>
            <Link to="/perks" style={{ marginRight: '20px', textDecoration: 'none', color: '#c48f8f', fontWeight: 'bold' }}>
                What's New
            </Link>
            <RoleSwitcher />
            <LogoutButton />
          </div>
        </div>
      </nav>

            <Box sx={{
                display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'center', alignItems: { xs: 'center', md: 'flex-start' },
                padding: 2, gap: 1, overflowX: 'hidden', minHeight: '100vh'
            }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <div className="user-profile-details">
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 2, borderRadius: 2, gap: 2 }}>
                                <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size={256} />
                                <Button variant="contained" onClick={() => setQrCodeOpen(true)} style={{ marginRight: '20px', backgroundColor: '#c48f8f', color: '#FFFFFF' }}>
                                    QR Code
                                </Button>
                            </Box>
                            <QrCode open={qrCodeOpen} onClose={() => setQrCodeOpen(false)} user={user} />
                        </div>

                        <div className="user-profile-info">
                            <Box component={"form"} onSubmit={handleSubmit} sx={{
                                padding: 2, backgroundColor: '#FFFFFF', borderRadius: 2, position: 'relative', minWidth: { xs: '100%', md: 450 },
                                width: { xs: '100%', md: '450' }, maxWidth: { xs: '100%', md: 450 }
                            }}>
                                <IconButton color="#c48f8f" onClick={handleEditToggle} title="Edit" sx={{ position: 'absolute', top: 0, right: 0, color: '#c48f8f' }}>
                                    {!editMode && (<EditIcon />)}
                                </IconButton>

                                <Grid container spacing={1} direction={'column'} alignItems="flex-start">
                                    <Grid item xs={12}>
                                        <h2>{editMode ? 'Edit Profile' : 'Profile Details'}</h2>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="h6">
                                            <strong>Name: </strong>
                                            {editMode ? (
                                                <TextField
                                                    type="text"
                                                    fullWidth
                                                    value={userForm.name}
                                                    onChange={(e) => {
                                                        setUserForm({ ...userForm, name: e.target.value });
                                                        setError('');
                                                        setSuccess(false);
                                                    }}
                                                    sx={{
                                                        mb: 1,
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
                                                    fullWidth
                                                    onChange={(e) => {
                                                        setUserForm({ ...userForm, email: e.target.value });
                                                        setError('');
                                                        setSuccess(false);
                                                    }}
                                                    sx={{
                                                        mb: 1,
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
                                            ) : user.email}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} sx={{ maxWidth: 400, width: '100%' }}>
                                        <Typography variant="h6">
                                            <strong>Birthday: </strong> {editMode ? (
                                                <TextField
                                                    type="date"
                                                    value={userForm.birthday}
                                                    fullWidth
                                                    onChange={
                                                        (e) => {
                                                            setUserForm({ ...userForm, birthday: e.target.value });
                                                            setError('');
                                                            setSuccess(false);
                                                        }
                                                    }
                                                    sx={{
                                                        mb: 1,
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
                                            ) : user.birthday ? user.birthday.slice(0, 10) : 'N/A'}
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
                                            <strong>Created At: </strong>{user.createdAt.slice(0, 10)}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="h6">
                                            <strong>Last Login: </strong>{user.lastLogin.slice(0, 10)}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="h6">
                                            <strong>Verified: </strong>{user.verified === true ? 'Yes' : 'No'}
                                        </Typography>
                                    </Grid>

                                    {editMode && (
                                        // <Grid item xs={12}>
                                        //     <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        //         <Button
                                        //             variant="contained"
                                        //             component="label"
                                        //             startIcon={<CloudUpload />}
                                        //             sx={{ marginTop: 2, backgroundColor: '#ebc2c2', color: 'rgb(101, 82, 82)' }}
                                        //         >
                                        //             Upload Avatar
                                        //             <VisuallyHiddenInput
                                        //                 type="file"
                                        //                 multiple
                                        //                 onChange={(e) => {
                                        //                     const file = e.target.files[0];
                                        //                     if (file) {
                                        //                         const reader = new FileReader();
                                        //                         reader.onloadend = () => {
                                        //                             setUserForm({ ...userForm, avatar: reader.result });
                                        //                             setAvatarUploaded(true);
                                        //                         };
                                        //                         reader.readAsDataURL(file);
                                        //                     }
                                        //                 }}
                                        //             />
                                        //         </Button>
                                        //         {avatarUploaded && (
                                        //             <Typography variant="body2" sx={{ mt: 1 }}>
                                        //                 <DoneIcon />
                                        //             </Typography>
                                        //         )}
                                        //     </Box>
                                        // </Grid>

                                        <Grid item xs={12} sx={{ maxWidth: 400, width: '100%' }}>
                                            <Typography variant="h6">
                                                <strong>Avatar URL: </strong> {
                                                    <TextField
                                                        type="text"
                                                        fullWidth
                                                        value={userForm.avatar}
                                                        onChange={
                                                            (e) => {
                                                                setUserForm({ ...userForm, avatar: e.target.value });
                                                                setError('');
                                                                setSuccess(false);
                                                            }
                                                        }
                                                        sx={{
                                                            mb: 1,
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
                                                }
                                            </Typography>
                                        </Grid>
                                    )}

                                    {editMode && (
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
                                                sx={{ backgroundColor: '#ebc2c2', color: 'rgb(101, 82, 82)' }}
                                                disabled={loading}
                                            >
                                                {loading ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                        </Grid>
                                    )}

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

                                </Grid>
                            </Box>

                            <div className="user-profile-password">
                                <Grid item xs={12} sx={{ mt: 2 }}>
                                    <Button onClick={handleChangePassword} sx={{ color: 'rgb(101, 82, 82)' }}>
                                        Change Password
                                    </Button>
                                </Grid>

                                {changePassword && (
                                    <Box component={"form"} onSubmit={handlePasswordReset} 
                                    sx={{ padding: 2, backgroundColor: '#FFFFFF', borderRadius: 2,  minWidth: { xs: '100%', md: 450 },
                                    width: '100%', maxWidth: {xs: '100%', md:450}, mx: 'auto', mt: 2 }}>
                                        <Grid container spacing={1} direction={'column'} alignItems="flex-start">
                                            <Grid item xs={12}>
                                                <h2>Reset Password</h2>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Typography variant="h6">
                                                    <strong>Old Password:</strong>
                                                    <TextField
                                                        type={showOldPassword ? 'text' : 'password'}
                                                        size="medium"
                                                        fullWidth
                                                        value={passwordForm.old}
                                                        onChange={(e) => {
                                                            setPasswordForm({ ...passwordForm, old: e.target.value });
                                                            setPasswordError('');
                                                            setPasswordSuccess(false);
                                                        }}
                                                        InputProps={{
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <IconButton
                                                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                                                        onMouseDown={(e) => e.preventDefault()}
                                                                        edge="end"
                                                                    >
                                                                        {showOldPassword ? <VisibilityOff /> : <Visibility />}
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            )
                                                        }}
                                                        sx={{
                                                            mb: 1,
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
                                                </Typography>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Typography variant="h6">
                                                    <strong>New Password:</strong>
                                                    <TextField
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        size="medium"
                                                        fullWidth
                                                        value={passwordForm.new}
                                                        onChange={(e) => {
                                                            setPasswordForm({ ...passwordForm, new: e.target.value });
                                                            setPasswordError('');
                                                            setPasswordSuccess(false);
                                                        }}
                                                        InputProps={{
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <IconButton
                                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                                        onMouseDown={(e) => e.preventDefault()}
                                                                        edge="end"
                                                                    >
                                                                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            )
                                                        }}
                                                        sx={{
                                                            mb: 1,
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
                                                </Typography>
                                            </Grid>
                                        </Grid>

                                        <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
                                            <Button
                                                variant="outlined"
                                                onClick={handleChangePassword}
                                                disabled={loading}
                                                sx={{ px: 4, color: 'rgb(101, 82, 82)', borderColor: 'rgb(101, 82, 82)' }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                disabled={loading}
                                                sx={{ backgroundColor: '#ebc2c2', color: 'rgb(101, 82, 82)' }}
                                            >
                                                {loading ? 'Resetting...' : 'Reset'}
                                            </Button>
                                        </Grid>

                                        {passwordError && (
                                            <Grid item xs={12} sx={{ mt: 2 }}>
                                                <Alert severity="error" sx={{ mt: 2, wordWrap: 'break-word', whiteSpace: 'normal' }}>
                                                    {passwordError}
                                                </Alert>
                                            </Grid>
                                        )}

                                        {/* {passwordSuccess && (
                                            <Grid item xs={12} sx={{ mt: 2 }}>
                                                <Alert severity="success" sx={{ mt: 2 }}>
                                                    Password updated successfully!
                                                </Alert>
                                            </Grid>
                                        )} */}

                                    </Box>
                                )}
                                {passwordSuccess && (
                                    <Grid item xs={12} sx={{ mt: 2 }}>
                                        <Alert severity="success" sx={{ mt: 2 }}>
                                            Password updated successfully!
                                        </Alert>
                                    </Grid>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </Box>
        </div>
    );
}

export default UserProfile;