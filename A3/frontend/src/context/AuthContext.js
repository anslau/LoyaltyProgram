import React, { createContext, useState, useEffect } from 'react'; 
import jwtDecode from 'jwt-decode';

// Create AuthContext
export const AuthContext = createContext();

// AuthProvider component to wrap app 
export const AuthProvider = ({ children }) => { 

    const [user, setUser] = useState(null); 
    const [token, setToken] = useState(null);

    // When component mounts, check localStorage for a token
    useEffect(() => { 
        const storedToken = localStorage.getItem('token'); 
        if (storedToken) { 
            setToken(storedToken); 
            try { 
                const decoded = jwtDecode(storedToken); 
                setUser(decoded); 
            } catch (error) { 
                console.error('Failed to decode token:', error); 
                localStorage.removeItem('token'); 
            } 
        } 
    }, []);

    // login: save token and update state 
    const login = (token) => { 
        localStorage.setItem('token', token); 
        setToken(token); 
        try { 
            const decoded = jwtDecode(token); 
            setUser(decoded); 
        } catch (error) { 
            console.error('Failed to decode token:', error); 
        } 
    };

    // logout: clear token and user state
    const logout = () => { 
        localStorage.removeItem('token'); 
        setToken(null); 
        setUser(null); 
    };

    return ( <AuthContext.Provider value={{ user, token, login, logout }}> {children} </AuthContext.Provider> ); 
};

export default AuthContext;