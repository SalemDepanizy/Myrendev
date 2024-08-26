// Import necessary libraries and components
import React, { useState } from "react";
import Avatar from "@mui/material/Avatar";

import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { NavigateFunction, Link as RouterLink } from "react-router-dom";
import { fetcher } from "./axios";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import useSWR from "swr";
import { Alert } from "antd";
import backgroundImage from "./assets/loginbackround.jpg"; // Update the path accordingly
import Button from "./components/Button";
import InputAdornment from "@mui/material/InputAdornment/InputAdornment";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { token } = useParams();
  const navigate: NavigateFunction = useNavigate();

  const { data, error, isLoading } = useSWR(
    `/users/isTokenValid/${token}`,
    async () => {
      if (!token) return null;
      const data = await fetcher.get(`/users/isTokenValid/${token}`);
      return data.data as {
        valid: boolean;
      };
    }
  );

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const [showPassword, setShowPassword] = useState(false);

  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrorMessage(""); // Clear the error message when the user starts typing
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
    setErrorMessage(""); // Clear the error message when the user starts typing
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  

    if (password !== confirmPassword) {
      setErrorMessage("Le mots de passe ne correspondent pas.");
      return; // Exit the function to prevent further execution
    }

    try {
      const response = await fetcher.post("/users/reset-password", {
        token: token,
        newPassword: password,
      });

      

      if (response.status === 200) {
        setSuccessMessage(
          "Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion."
        );
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setErrorMessage("Failed to reset password.");
      }
    } catch (error: any) {
      setErrorMessage(`Error resetting password: ${error.message}`);
    }
  };

  if (error) return <div>Not a Valid Token</div>;
  if (isLoading) return <div>Loading</div>;
  if (!data?.valid) return <div>Not a Valid Token</div>;
  return (
    <ThemeProvider theme={createTheme()}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: `url(${backgroundImage})`, // Updated line
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Réinitialiser le mot de passe
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="password"
                label="Nouveau mot de passe"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                autoFocus
                InputProps={{
                  endAdornment: (
                    <InputAdornment
                      position="end"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </InputAdornment>
                  ),
                }}
                onChange={handlePasswordChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="confirmPassword"
                label="Confirmer le nouveau mot de passe"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
              />

              {successMessage && (
                <Alert type="success" showIcon message={successMessage} />
              )}

              {errorMessage && (
                <Alert type="error" showIcon message={errorMessage} />
              )}

              <Button
                type="submit"

                className= "text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-4 py-2.5 text-center me-2 mb-2"              >

                Réinitialiser le mot de passe
              </Button>
              <Grid container spacing={2} mt={2}>
                <Grid item xs>
                  <Typography
                    variant="body2"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <RouterLink to="/login" className="underline">
                      Retour à la connexion
                    </RouterLink>
                  </Typography>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

export default ResetPassword;