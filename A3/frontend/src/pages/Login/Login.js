//import LoginForm from "../components/Auth/LoginForm";
import {useState} from "react";
import {Box, Button, Container, TextField, Typography, Alert} from "@mui/material";
import axios from "axios";
import {useNavigate} from "react-router-dom";

export default function Login() {
    const [ utorid, setUtorid ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ error, setError ] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
      e.preventDefault();
        try{
          const response = await axios.post("http://localhost:3000/auth/tokens", {
            utorid,
            password
          });

          const { token, tokenExpiry } = response.data;
          localStorage.setItem("token", token);
          localStorage.setItem("tokenExpiry", tokenExpiry);

          // not implemented yet
          //navigate("/dashboard");
          alert("Login successful");

        }catch(e){
          if (e.response && e.response.data && e.response.data.message) {
            setError(e.response.data.message);
            alert("Utorid or password is incorrect");
          }
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
            <Button type="submit" variant="contained" color="primary">
              Login
            </Button>
            </Box>
        </Box>
      </Container>
    );
}

