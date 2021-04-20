import React, { useState, useContext } from 'react'
import { useHistory } from 'react-router-dom';

//import { ipcRenderer as ipc } from 'electron';

import AlertSmall from '../../components/Alert/AlertSmall'
import { AuthContext } from '../../../services/AuthContext';
import { makeStyles } from '@material-ui/core/styles';


import { Button, Container, TextField, Grid} from '@material-ui/core'

import img1 from '../../assets/Login/graphic1.svg'

const { ipcRenderer } = window.require('electron')

let userLogged: any[] = []

const useStyles = makeStyles((theme) => ({
   formsContainer: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
   },
   container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      width: '100%',
      overflow: 'hidden',
   },
   paper: {
      alignItems: 'left',
      display: 'flex',
      flexDirection: 'column',
      width: 300
   },
   avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
      width: theme.spacing(7),
      height: theme.spacing(7),
   },
   form: {
      width: 'auto',
      height: 'auto',
      margin: 10,
      alignItems: 'center',
   },

   imgHolder: {
      width: 550,
      backgroundColor: '#FAFAFA',
   },
   imgHolderBg: {
      opacity: 1,
      backgroundImage: 'none'
   },
   infoHolder: {
      paddingTop: '15%',
      marginBottom: '15%',
      color: '#000',
      alignContent: 'left',
   },
   pageLinks: {
      fontFamily: 'Roboto',
      color: '#000',
      fontWeight: 'bold',
      marginLeft: 20
   },
   font: {
      fontFamily: 'Roboto',
      fontStyle: 'normal',
      fontWeight:'bold',
      fontSize: 30,
   },
   font2:{
      fontFamily: 'Roboto',
      fontStyle: 'normal',
   },
   font3:{
      display: 'flex',
      alignItems: 'center',
      fontFamily: 'Roboto',
      fontStyle: 'normal',
      fontWeight:'bold',
      fontSize: 15,
   },
   font4:{
      fontFamily: 'Roboto',
      fontStyle: 'normal',
      marginLeft: 10,
      fontSize: 14,
   },
   textField: {
      //backgroundColor: "#f0f0f0",
      margin: 10,
      position: 'relative',
      boxShadow: 'none',
   },
   submit: {
      //margin: theme.spacing(3, 0, 2),
      backgroundColor: "#0093FF",
      fontSize: 12,
      margin: 10,
      padding: '10px 0px',
      borderRadius: 10,
      width: '30%',
      height: 38
   },

}));

const LoginPage = () => {
   const { setUser } = useContext(AuthContext)
   const classes = useStyles();
   let history = useHistory();

   const [form, setForm] = useState({
      username: '',
      password: ''
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
      else if (form.password === '') AlertSmall('info', 'Llena el campo de contraseña.')
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
      <>
         <Grid container className={classes.formsContainer} item={true} justify="center" direction="row" alignItems="center">
            <div className={classes.imgHolder}>
               <div className={classes.imgHolderBg}></div>
               <div className={classes.infoHolder}>
                  <img src={img1} alt="" />
               </div>
            </div>
            <Container className={classes.container} maxWidth="xs">
               <div className={classes.paper}>
                  <h3 className={classes.font}> La inspiración existe, pero te encontrará trabajando.</h3>
                  {/*<p className={classes.font2}> Crea tu propia guía de estilo. Que sea única e identificable por los demás.</p>*/}
                  <div>
                     <span className={classes.pageLinks}>Login</span>
                  </div>
                  <form className={classes.form} noValidate>
                     <Grid container item={true} direction="row">
                        <TextField
                           fullWidth
                           label="Usuario"
                           name="username"
                           variant="outlined"
                           size="small"
                           value={form.username}
                           onChange={updateField}
                           className={classes.textField}
                        />
                        <TextField
                           fullWidth
                           label="Contraseña"
                           name="password"
                           type="password"
                           variant="outlined"
                           size="small"
                           value={form.password}
                           onChange={updateField}
                           className={classes.textField}
                        />
                        <Button
                           type="submit"
                           variant="contained"
                           color="primary"
                           className={classes.submit}
                           onClick={loginButton}
                        >
                           Ingresar
                        </Button>
                        {/*<a className={classes.font3}>No tienes cuenta?</a><a className={classes.font4}>Contacta con un Administrador</a>*/}
                     </Grid>
                  </form>
               </div>
            </Container>
         </Grid>
      </>
   )
}
export default LoginPage