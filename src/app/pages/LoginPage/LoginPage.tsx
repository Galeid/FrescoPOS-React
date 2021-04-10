import React, { useState, useContext } from 'react'
import { useHistory } from 'react-router-dom';

//import { ipcRenderer as ipc } from 'electron';

import AlertSmall from '../../components/Alert/AlertSmall'
import { AuthContext } from '../../../services/AuthContext';
import { makeStyles } from '@material-ui/core/styles';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

const { ipcRenderer } = window.require('electron')

let userLogged: any[] = []

const useStyles = makeStyles((theme) => ({
   paper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
   },
   avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
      width: '100px', //theme.spacing(7),
      height: '100px',//theme.spacing(7),
   },
   form: {
      width: '100%',
      marginTop: theme.spacing(1),
   },
   submit: {
      margin: theme.spacing(3, 0, 2),
      padding: '10px 0px'
   },

}));

const LoginPage = () => {
   const { setUser } = useContext(AuthContext)
   const classes = useStyles();
   let history = useHistory();

   const [form, setForm] = useState({
      username: 'admin',
      password: 'admin'
   });

   const updateField = (event: { target: { name: any; value: any; }; }) => {
      setForm({
         ...form,
         [event.target.name]: event.target.value
      });
   };

   const validateUser = () => {
      if (form.username.length === 0 && form.password.length === 0) AlertSmall('info', 'Formulario vacio')
      else if (form.username === '') AlertSmall('info', 'Llena el campo de usuario.')
      else if(form.password === '') AlertSmall('info', 'Llena el campo de contraseña.')
      else {
         const prepareData = {
            Nameuser: {
               value: form.username
            },
            Passworduser: {
               value: form.password
            },
            spName: 'spValidateUser'
         }

         ipcRenderer.invoke('validateuser', prepareData)
            .then((user: any) => {
               userLogged = user.slice()
               if (userLogged.length > 0) {
                  setUser(userLogged[0]) 
                  //console.log(userLogged[0])
                  history.push('/dashboard');
               } else {
                  AlertSmall('error', 'El usuario no se encuentra en la base de datos')
                  //console.log('validateUser(): El usuario no se encuentra en la base de datos')
               }
            }).catch((err: any) => AlertSmall('error', `Ha ocurrido un error, ${err}`))
      }
   }

   const loginButton = (event: { preventDefault: () => void; }) => {
      validateUser();
      event.preventDefault()
   }

   return (
      <Container maxWidth="xs">
         <div className={classes.paper}>
            <Avatar className={classes.avatar} />
            <Typography component="h1" variant="h3">
               Inicio de Sesion
            </Typography>
            <form className={classes.form} noValidate>
               <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Usuario"
                  name="username"
                  autoComplete="user"
                  onChange={updateField}
                  value={form.username}
                  autoFocus
               />
               <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type="password"
                  onChange={updateField}
                  value={form.password}
                  autoComplete="current-password"
               />
               <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  onClick={loginButton}
               >
                  Ingresar
               </Button>
            </form>
         </div>
      </Container>
   )
}

/*const LoginMUI = () => {
   return(
      <div className="AppContent">
         <form className="form-signin">
            <div className="form-inner">
            <h1 className="h3 mb-3 font-weight-normal">Inicio de Sesion</h1>
            <img className="mb-4" src="https://img.icons8.com/bubbles/2x/login-rounded-right.png"/>
               <div className="form-group">
                  <label htmlFor="user">User: </label>
                  <input type="user" className="form-control"
                  placeholder="Username" name="username" onChange={updateField} value={form.username}></input>
               </div>
               <div className="form-group">
                  <label htmlFor="password">Password:</label>
                  <input type="password" name="password" className="form-control" placeholder="Password" onChange={updateField} value={form.password}></input>
               </div>
               <input className="btn btn-lg btn-primary btn-block" type="submit" onClick={handleSubmit} value="LOGIN"></input>
            </div>
         </form>
      </div>
   )
}
*/
export default LoginPage