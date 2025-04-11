//import LoginForm from "../components/Auth/LoginForm";
import {useState, useContext} from "react";
import {Box, Button, Container, TextField, Typography, Alert, Link as MuiLink} from "@mui/material";
import {useNavigate, Link} from "react-router-dom";
import AuthContext from "../../context/AuthContext";

export default function Login() {
    const [ utorid, setUtorid ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ error, setError ] = useState("");
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleLogin = async (e) => {
      e.preventDefault();
        try{
          await login({utorid, password});

          // not implemented yet
          navigate("/dashboard");

        }catch(e){
          setError(e.message || "Invalid utorid or password");
        }
    };

    return (
      <Container>
        <Box>
          <Typography variant="h4">Login</Typography>
            <Box component="form" onSubmit={handleLogin}>
              <TextField
                label="Utorid"
                type="text"
                value={utorid}
                placeholder="Enter your utorid"
                onChange={(e) => setUtorid(e.target.value)}
                required
                fullWidth
                autoFocus
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Button type="submit" variant="contained" color="primary">
                Login
              </Button>
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <MuiLink component={Link} to="/reset-request" variant="body2">
                  Forgot password?
                </MuiLink>
              </Box>
            </Box>
        </Box>
      </Container>
    );
}

