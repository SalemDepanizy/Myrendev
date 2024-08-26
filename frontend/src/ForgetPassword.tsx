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
import { Link as RouterLink } from "react-router-dom";
import { fetcher } from "./axios";
import { useNavigate } from "react-router-dom";
import { styledToast } from "./components/ui/toasting";
import { CheckCheck } from "lucide-react";
import { Alert } from "antd";
import { AlertTitle } from "@mui/material";
import backgroundImage from "./assets/loginbackround.jpg"; // Update the path accordingly
import Button from "./components/Button";
import logo from "./assets/logo.png"; // Update the path accordingly


function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetcher.post("/users/forget-password", { email });

      if (response.status === 200) {
        // console.log("Email de réinitialisation envoyé avec succès.");
        setSuccessMessage(
          "Email de réinitialisation envoyé avec succès, verifiez votre boite mail s'il vous plait"
        );
      } else {
        console.error("Échec de l'envoi de l'email de réinitialisation.");
      }
    } catch (error) {
      console.error(
        "Erreur lors de la réinitialisation du mot de passe:",
        error
      );
      setErrorMessage("Ce mail n'existe pas.");
    }
  };

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
            {/* <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar> */}
            <img src={logo} className="w-20" alt="" />
            <Typography component="h1" variant="h5">
              Mot de passe oublié?
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Adresse Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {successMessage && (
                <Alert type="success" showIcon message={successMessage} />
              )}

              {errorMessage && (
                <Alert type="error" showIcon message={errorMessage} />
              )}

              <Button
                type="submit"
               
                className= "text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-4 py-2.5 text-center me-2 mb-2"
              >
                Envoyer le lien de récupération
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

export default ForgotPassword;
