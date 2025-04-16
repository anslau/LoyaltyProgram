//import LoginForm from "../components/Auth/LoginForm";
import {useState, useContext} from "react";
import {Box, Button, Container, TextField, Typography, Alert, Paper, Link as MuiLink} from "@mui/material";
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
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Box sx={{ bgcolor: "#ebc2c2", p: 3 }}>
              <Typography variant="h4" align="center" color="rgb(101, 82, 82)">
                Login
              </Typography>
            </Box>
            <Box
              component="form"
              onSubmit={handleLogin}
              sx={{
                p: 4,
                display: "flex",
                flexDirection: "column",
                gap: 2
              }}
            >
              <TextField
                label="Utorid"
                type="text"
                value={utorid}
                placeholder="Enter your utorid"
                onChange={(e) => setUtorid(e.target.value)}
                required
                fullWidth
                autoFocus
                sx={{
                  "& .MuiOutlinedInput-root.Mui-focused": {
                    "& fieldset": { borderColor: "rgb(101, 82, 82)" }
                  },
                  "& label.Mui-focused": { color: "rgb(101, 82, 82)" }
                }}
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root.Mui-focused": {
                    "& fieldset": { borderColor: "rgb(101, 82, 82)" }
                  },
                  "& label.Mui-focused": { color: "rgb(101, 82, 82)" }
                }}
              />
              {error && <Alert severity="error">{error}</Alert>}
                <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "#ebc2c2",
                  color: "rgb(101, 82, 82)",
                  "&:hover": { backgroundColor: "#c48f8f" }
                }}
              >
                  Login
                </Button>
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <MuiLink component={Link} to="/reset-request" variant="body2" color="rgb(101, 82, 82)">
                  Forgot password?
                </MuiLink>
              </Box>
            </Box>
          </Paper>
        </Container>
    );
}

