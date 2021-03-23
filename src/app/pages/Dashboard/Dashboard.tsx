import React, { useContext } from 'react'
import { AuthContext } from '../../../services/AuthContext';
import { useHistory } from 'react-router-dom'
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import AirportShuttle from '@material-ui/icons/AirportShuttle'
import MonetizationOn from '@material-ui/icons/MonetizationOn'
import AttachMoney from '@material-ui/icons/AttachMoney'
import ShowChart from '@material-ui/icons/ShowChart'
import LocalShipping from '@material-ui/icons/LocalShipping'
import Accessibility from '@material-ui/icons/Accessibility'
import Assignment from '@material-ui/icons/Assignment'
import Build from '@material-ui/icons/Build'
import Class from '@material-ui/icons/Class'

import CardsHeader from '../../components/Cards/CardsHeader';


const useStyles = makeStyles(() => ({
   root: {
      flexGrow: 1
   },
   iconos: {
      color: 'white'
   },
   container: {
      paddingTop: '40px',
      alignItems: 'center'
   },
   containerTabla: {
      marginTop: '40px'
   },
   paper: {
      height: 50,
      width: '100%',
   },
   itemIcon: {
      color: 'white'
   },
}));

const MainPage = () => {
   const classes = useStyles();
   const { user /*, setUser*/ } = useContext(AuthContext)
   let history = useHistory()

   /*function handleClick() {
      setUser('')
      history.goBack();
   }*/

   const Alert = () => {
      const MySwal = withReactContent(Swal)
      MySwal.fire({
         toast: true,
         position: 'bottom-end',
         icon: 'info',
         title: <p>En construccion, no disponible por el momento</p>,
         timerProgressBar: true,
         timer: 5000
      })
   }

   function handleClick2() {
      return (
         <div className="AppContent">
            <h1>Lo siento, no tienes permiso para ver esto, Inicia Sesion primero</h1>
            <button type="button" onClick={() => history.push('/')}>Regresar a Login</button>
         </div>
      )
   }
   const itemsList = [
      {
         title: 'Productos',
         text: 'Ver',
         icon: <AirportShuttle className={classes.itemIcon} />,
         onClick: () => history.push('/products'),
         userRole: [1,2,3]
      },
      {
         title: 'Ventas (Beta)',
         text: 'Ver',
         icon: <MonetizationOn className={classes.itemIcon} />,
         onClick: () => history.push('/sale'),
         userRole: [1,2]
      },
      {
         title: 'Categorias',
         text: 'Ver',
         icon: <Class className={classes.itemIcon} />,
         onClick: () => history.push('/categories'),
         userRole: [1]
      },
      {
         title: 'Estadisticas',
         text: 'Ver',
         icon: <ShowChart className={classes.itemIcon} />,
         onClick: () => {
            history.push('/dashboard')
            Alert()
         },
         userRole: [1,2]
      },
      {
         title: 'Orden de Compra',
         text: 'Ver',
         icon: <AttachMoney className={classes.itemIcon} />,
         onClick: () => {
            history.push('/dashboard')
            Alert()
         },
         userRole: [1,2,3]
      },
      {
         title: 'Proveedores',
         text: 'Ver',
         icon: <LocalShipping className={classes.itemIcon} />,
         onClick: () => {
            history.push('/dashboard')
            Alert()
         },
         userRole: [1,2,3]
      },
      {
         title: 'Mi Personal',
         text: 'Ver',
         icon: <Accessibility className={classes.itemIcon} />,
         onClick: () => {
            history.push('/dashboard')
            Alert()
         },
         userRole: [1,2,3]
      },
      {
         title: 'Reportes',
         text: 'Ver',
         icon: <Assignment className={classes.itemIcon} />,
         onClick: () => {
            history.push('/dashboard')
            Alert()
         },
         userRole: [1,2,3]
      },
      {
         title: 'Soporte',
         text: 'Ver',
         icon: <Build className={classes.itemIcon} />,
         onClick: () => {
            history.push('/dashboard')
            Alert()
         },
         userRole: [1,2,3]
      }
   ];
   //sm={4} md={4} lg={4} xl={4}
   return (user ?
      <>
         {/*
            <Grid container item className={classes.paper}>
               Good morning Mr {user.nameUser}
               <button type="button" style={{ height: 20 }} onClick={handleClick}>Go Back</button>
            </Grid>
         */}
         <div className={classes.root}>
            <Grid container item={true} xs={12} spacing={3} direction="row" justify="space-evenly" alignItems="baseline">
               {itemsList.map((item) => {
                  const { icon, title, text, onClick, userRole } = item;
                  let visibility = false
                  if (userRole.includes(user.idRole)) visibility = true
                  return visibility && (
                     <Grid item key={title} xs={6} sm={3} >
                        <CardsHeader icono={icon} titulo={title} texto={text} onClick={onClick} color="rgba(248,80,50,1)" font="white" />
                     </Grid>
                  )
               })}

            </Grid>
         </div>
      </>
      : handleClick2()
   )
}

export default MainPage
