import React, { useContext } from 'react'
import { AuthContext } from '../../../services/AuthContext';
import { useHistory } from 'react-router-dom'
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AlertSmall from '../../components/Alert/AlertSmall'

import AirportShuttle from '@material-ui/icons/AirportShuttle'
import MonetizationOn from '@material-ui/icons/MonetizationOn'
import AttachMoney from '@material-ui/icons/AttachMoney'
import ShowChart from '@material-ui/icons/ShowChart'
import LocalShipping from '@material-ui/icons/LocalShipping'
import Accessibility from '@material-ui/icons/Accessibility'
import Assignment from '@material-ui/icons/Assignment'
import Build from '@material-ui/icons/Build'
import Class from '@material-ui/icons/Class'

import CardsHeader from '../../components/Cards/Dashboard/CardsHeader'
import CardsWelcome from '../../components/Cards/Dashboard/CardsWelcome'

import urlProduct from '../../assets/Dashboard/GroceryShoppingIllustration.svg'
import urlSale from '../../assets/Dashboard/YoungManWorkingAsACashier.svg'
import urlCategory from '../../assets/Dashboard/WomanWithAnEcoFriendlyBagAtFoodStore.svg'
import urlStatistics from '../../assets/Dashboard/DevelopMoneyInvestment.svg'
import urlPurchaseOrder from '../../assets/Dashboard/DeliveryManAndCustomerOrderFood.svg'
import urlSupplier from '../../assets/Dashboard/BasketAndShoppingCartFilledWithProductsAndEmpty.svg'
import urlEmployee from '../../assets/Dashboard/ManUsingFaceMaskWithSalesman.svg'
import urlReport from '../../assets/Dashboard/AccountingWithSheetCalculatorsBookkeepingReport.svg'
import urlSupport from '../../assets/Dashboard/EngineerManDesignWorkerProfession.svg'
import imgBackDash from '../../assets/Dashboard/BackgroundDashboard.svg'

const useStyles = makeStyles(() => ({
   root: {
      flexGrow: 1,
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
   //const background = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgyWX6cbki1kb-4KGY5HXReTFzFIDPMYVZ6ZPWPh57LovxCY-5zSphka5h4UlxLF7GjYs&usqp=CAU'
   /*function handleClick() {
      setUser('')
      history.goBack();
   }*/

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
         text: 'Mostrar contenido',
         icon: <AirportShuttle className={classes.itemIcon} />,
         url: urlProduct,
         color: '2A265F',
         onClick: () => history.push('/products'),
         userRole: [1, 2, 3]
      },
      {
         title: 'Ventas',
         text: 'Mostrar contenido',
         icon: <MonetizationOn className={classes.itemIcon} />,
         url: urlSale,
         color: '2A265F',
         onClick: () => history.push('/sale'),
         userRole: [1, 2]
      },
      {
         title: 'Categorias',
         text: 'Mostrar contenido',
         icon: <Class className={classes.itemIcon} />,
         url: urlCategory,
         color: '2A265F',
         onClick: () => history.push('/categories'),
         userRole: [1]
      },
      {
         title: 'Estadisticas',
         text: 'Mostrar contenido',
         icon: <ShowChart className={classes.itemIcon} />,
         url: urlStatistics,
         color: '2A265F',
         onClick: () => {
            history.push('/dashboard')
            AlertSmall('info', 'En construccion, no disponible por el momento')
         },
         userRole: [1, 2]
      },
      {
         title: 'Orden de Compra',
         text: 'Mostrar contenido',
         icon: <AttachMoney className={classes.itemIcon} />,
         url: urlPurchaseOrder,
         color: '2A265F',
         onClick: () => {
            history.push('/dashboard')
            AlertSmall('info', 'En construccion, no disponible por el momento')
         },
         userRole: [1, 2, 3]
      },
      {
         title: 'Proveedores',
         text: 'Mostrar contenido',
         icon: <LocalShipping className={classes.itemIcon} />,
         url: urlSupplier,
         color: '2A265F',
         onClick: () => {
            history.push('/dashboard')
            AlertSmall('info', 'En construccion, no disponible por el momento')
         },
         userRole: [1, 2, 3]
      },
      {
         title: 'Mi Personal',
         text: 'Mostrar contenido',
         icon: <Accessibility className={classes.itemIcon} />,
         url: urlEmployee,
         color: '2A265F',
         onClick: () => {
            history.push('/dashboard')
            AlertSmall('info', 'En construccion, no disponible por el momento')
         },
         userRole: [1, 2, 3]
      },
      {
         title: 'Reportes',
         text: 'Mostrar contenido',
         icon: <Assignment className={classes.itemIcon} />,
         url: urlReport,
         color: '2A265F',
         onClick: () => {
            history.push('/dashboard')
            AlertSmall('info', 'En construccion, no disponible por el momento')
         },
         userRole: [1, 2, 3]
      },
      {
         title: 'Soporte',
         text: 'Mostrar contenido',
         icon: <Build className={classes.itemIcon} />,
         url: urlSupport,
         color: '2A265F',
         onClick: () => {
            history.push('/dashboard')
            AlertSmall('info', 'En construccion, no disponible por el momento')
         },
         userRole: [1, 2, 3]
      }
   ];
   return (user ?
      <>
         {/*
            <Grid container item className={classes.paper}>
               Good morning Mr {user.nameUser}
               <button type="button" style={{ height: 20 }} onClick={handleClick}>Go Back</button>
            </Grid>
             width: '100%', height: '100%'
         */}
         <Grid container spacing={3} justify="space-evenly" style={{backgroundImage: `url(${imgBackDash})`}} >
            <div style={{width: '90%'}}>
               <CardsWelcome user={user} />
            </div>
            <Grid container item={true} xs={12} spacing={2} direction="row" justify="space-evenly" alignItems="baseline">
               {itemsList.map((item) => {
                  const { icon, title, text, url, color, onClick, userRole } = item;
                  let visibility = false
                  if (userRole.includes(user.idRole)) visibility = true
                  return visibility && (
                     <Grid item key={title} >
                        <CardsHeader icono={icon} titulo={title} texto={text} url={url} color={color} onClick={onClick} />
                     </Grid>
                  )
               })}
            </Grid>
         </Grid>
      </>
      : handleClick2()
   )
}

export default MainPage
