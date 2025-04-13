import React, { createContext, useState, useEffect } from 'react'; 
import { jwtDecode } from 'jwt-decode';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

// Create AuthContext
export const AuthContext = createContext();

// AuthProvider component to wrap app 
export const AuthProvider = ({ children }) => { 

    const [user, setUser] = useState(null); 
    const [userDetails, setUserDetails] = useState(null);
    const [token, setToken] = useState(null);
    const [expiresAt, setExpiresAt] = useState(null);
    const [loading, setLoading] = useState(true);


    // When component mounts, check localStorage for a token
    useEffect(() => { 
        const storedToken = localStorage.getItem('token'); 
        const storedExpiry = localStorage.getItem('expiresAt'); 
        console.log('AuthContext loaded token:', storedToken, storedExpiry);

        if (storedToken && storedExpiry) { 
            console.log("Stored token:", storedToken);
            console.log("Stored expiry:", storedExpiry);

            const expiryDate = new Date(storedExpiry); 
            if (expiryDate > new Date()) {
                setToken(storedToken); 
                setExpiresAt(expiryDate); 
                try { 
                    const decoded = jwtDecode(storedToken); 
                    console.log("Decoded token:", decoded);

                    setUser(decoded); 

                    // Fetch user details
                    fetchUserDetails(storedToken);

                    // auto log out when token expires
                    const timeout = expiryDate.getTime() - new Date().getTime();
                    setTimeout(logout, timeout); 
                } catch (error) { 
                    console.error('Failed to decode token:', error); 
                    logout();
                }
            } else {
                // token expired
                logout(); 
            }
        }
        setLoading(false);
    }, []);

    // login: save credentials to backend, stores token and expiry
    const login = async (credentials) => {
        try { 
            const response = await fetch(
                'http://localhost:8000/auth/tokens',
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'}, 
                    body: JSON.stringify({
                        utorid: credentials.utorid, 
                        password: credentials.password
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Login failed'); 
            }

            const data = await response.json();
            // data should include token, expiresAt 
            localStorage.setItem('token', data.token);
            localStorage.setItem('expiresAt', data.expiresAt); 
            setToken(data.token); 
            setExpiresAt(new Date(data.expiresAt));
            const decoded = jwtDecode(data.token); 
            setUser(decoded); 

            // Fetch user details from /users/me
            await fetchUserDetails(data.token);

            // set up auto logout timer 
            const timeout = new Date(data.expiresAt).getTime() - new Date().getTime();
            setTimeout(logout, timeout); 
        } catch (error) { 
            console.error('Login error:', error); 
            throw error;
        } 
    };

    // Fetch user details from /users/me endpoint
    const fetchUserDetails = async (currentToken) => {
        try {
            const response = await fetch(`${BACKEND_URL}/users/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user details');
            }

            const userData = await response.json();
            setUserDetails(userData);
            return userData;
        } catch (error) {
            console.error('Error fetching user details:', error);
            return null;
        }
    };

    // logout: clear token and user state
    const logout = () => { 
        console.log('logout called');
        localStorage.removeItem('token'); 
        localStorage.removeItem('expiresAt'); 
        setToken(null); 
        setUser(null); 
        setUserDetails(null);
        setExpiresAt(null);
    };

    return (
        <AuthContext.Provider value={{ user, userDetails, token, expiresAt, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    ); 
};

export default AuthContext;


// Explanation: Authprovider checks for an exisitng token in local storage and verifies against expiration time. 
// If token valid, decoded to get user info and sets timer to log out automatically when token expires. 
// Login function sends user's credentials to auth/tokens endpoint, stores returned token and expireation time,
// decodes token to update user state. 
// Logout clears all token related data from both state AND local storage. 

// how to use AuthContext in components that are descendant of AuthProvider
// for example something like userstatus() 
//
// import React, { useContext } from 'react'; 
// import AuthContext from './context/AuthContext'; 

// const UserStatus = () => { 
//     const { user, login, logout } = useContext(AuthContext);
//     return (
//         <div>{user ? 'Welcome ' + user.utorid : 'Please log in'}</div>
//     ); 
// };

// export default UserStatus;