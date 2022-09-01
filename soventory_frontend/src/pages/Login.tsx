import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import SoventoryIcon from "../logo/plussegaush.png"

import MuiAlert, { AlertProps } from '@mui/material/Alert';
import env from "../env.json"
const theme = createTheme();

export default function SignIn() {
    const [name, setName] = React.useState('');
    const [password, setPassword] = React.useState('');
  
  const handleConnection : () => Promise<void> =  async () => {
    
    if(name && password && name != "" && password != "")
    {
      const query = await fetch("http://localhost:3001/user/login",{
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({nom_utilisateur:name,mot_de_passe:password})
        
      })
      const response = await query.json();
      console.log(response);
      if(response.success)
      {
        console.log("success",response);
      }
    }
  };
  return (
    <ThemeProvider theme={theme}>
      <div>
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1,bgcolor:"transparent" }}>
            <img src={SoventoryIcon} style={{width:"100%"}} />
          </Avatar>
          <Typography component="h1" variant="h5">
            Se connecter
          </Typography>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              onChange={(e) => setName(e.target.value)}
              label="Nom d'utilisateur"
              name="name"
              autoComplete="name"
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
            <Button
            onClick={handleConnection}
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Se connecter
            </Button>
            <Grid container>
            </Grid>
          </Box>
        </Box>
      </div>
    </ThemeProvider>
  );
}