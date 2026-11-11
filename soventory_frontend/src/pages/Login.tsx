import * as React from 'react';
import {useEffect} from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import getIp from '../IP';
import SoventoryIcon from "../logo/plussegaush.png";
const theme = createTheme();

export default function SignIn() {
    const [name, setName] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [receivedData, setReceivedData] = React.useState(null);
    const [user,setUser] = React.useState(null);
    const [loggedIn, setLoggedIn] = React.useState(false);

    useEffect(() => {
     
      async function tryLogin()
      {
        const query = await fetch(getIp()+"/user/tryLogin", {
          method: "GET",
          credentials: "include",
          headers: {
          'Content-Type': 'application/json'
          },
        });
        const response = await query.json();
        console.log(response)
        if(response.logged)
        {
          setUser(response.user);
          setLoggedIn(true);
        }
      }
      tryLogin();
    },[]);
  
  const handleConnection : () => Promise<void> =  async () => {
    
    if(name && password && name != "" && password != "")
    {
      const query = await fetch(getIp()+"/user/login",{
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({nom_utilisateur:name,mot_de_passe:password})
        
      })
      const response = await query.json();
      if(response.refreshToken)
      {
        setReceivedData(response);
        setUser(response.user);
        setLoggedIn(true);
      }
    }
  };
  if(loggedIn)
  {
    return <Navigate to="/dashboard" state={{user:user}}  />
    
  }
  return (
    <ThemeProvider theme={theme}>
      <div className="login-page">
        <CssBaseline />
        <div className="login-shell">
          <section className="login-brand-panel">
            <div className="login-brand-lockup">
              <img className="brand-mascot" src={SoventoryIcon} alt="" />
              <span>Soventory</span>
            </div>
            <div className="login-brand-message">
              <span className="workspace-eyebrow">VOTRE PARC, EN UN SEUL ENDROIT</span>
              <Typography component="h1">Chaque équipement, bien suivi.</Typography>
              <p>Retrouvez les informations de votre parc matériel dans un seul espace.</p>
            </div>
            <div className="login-brand-footer">
              <span>INVENTAIRE</span><span>·</span><span>SUIVI</span><span>·</span><span>SÉRÉNITÉ</span>
            </div>
            <div className="login-brand-orbit login-brand-orbit-one" />
            <div className="login-brand-orbit login-brand-orbit-two" />
          </section>
          <section className="login-form-panel">
            <Box className="login-form">
              <span className="workspace-eyebrow">BIENVENUE</span>
              <Typography component="h2">Se connecter</Typography>
              <p className="login-form-intro">Accédez à votre espace de gestion.</p>
              <Box component="form" noValidate sx={{ mt: 3 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  onChange={(e) => setName(e.target.value)}
                  label="Nom d'utilisateur"
                  name="name"
                  autoComplete="username"
                  autoFocus
                  value={name}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  onChange={(e) => setPassword(e.target.value)}
                  label="Mot de passe"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                />
                <Button className="login-submit" onClick={handleConnection} fullWidth variant="contained">
                  Se connecter <span aria-hidden="true">→</span>
                </Button>
              </Box>
              <p className="login-security-note"><span aria-hidden="true">●</span> Votre espace est sécurisé</p>
              <RouterLink className="login-home-link" to="/">Retour à l’accueil</RouterLink>
            </Box>
          </section>
        </div>
      </div>
    </ThemeProvider>
  );
  }