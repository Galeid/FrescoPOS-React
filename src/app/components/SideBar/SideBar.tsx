import React, { useContext, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom';

import {
   //Typography,
   Drawer,
   ListItem,
   List,
   ListItemIcon,
   ListItemText,
   Button
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { AuthContext } from '../../../services/AuthContext';
import logo from './Logo3.png';
//Icons
import HomeIcon from '@material-ui/icons/Home';
import LocalGroceryStoreIcon from '@material-ui/icons/LocalGroceryStore';
// import AddCircleIcon from '@material-ui/icons/AddCircle'
// import DescriptionIcon from '@material-ui/icons/Description';
import AssignmentInd from '@material-ui/icons/AssignmentInd';
import Category from '@material-ui/icons/Category';
import AirportShuttle from '@material-ui/icons/AirportShuttle';
import Assignment from '@material-ui/icons/Assignment';
import AlertSmall from '../Alert/AlertSmall';

const { ipcRenderer } = window.require('electron')

const sideBarWidth = 240
const useStyles = makeStyles({
   drawer: {
      width: sideBarWidth,
      flexShrink: 0,
   },
   itemIcon: {
      color: 'white'
   },
   itemText: {
      color: 'white'
   },
   paperDrawer: {
      backgroundColor: '#1e2022',
      width: sideBarWidth
   },
   root: {
      flexGrow: 1,
   },
   paper: {
      textAlign: 'center',
   },
   buttonShift: {
      marginTop: '16px',
      marginLeft: '30px',
      marginRight: '30px',
   }
});

const SideBar = () => {
   const { user, caja } = useContext(AuthContext)
   let history = useHistory();
   const classes = useStyles();
   const [inShift, setInShift] = useState(false)

   const itemsList = [
      {
         text: 'Inicio',
         icon: <HomeIcon className={classes.itemIcon} />,
         onClick: () => history.push('/dashboard'),
         userRole: [1, 2, 3]
      },
      {
         text: 'Ventas',
         icon: <LocalGroceryStoreIcon className={classes.itemIcon} />,
         onClick: () => history.push('/sale'),
         userRole: [1, 2]
      },
      {
         text: 'Usuarios',
         icon: <AssignmentInd className={classes.itemIcon} />,
         onClick: () => history.push('/users'),
         userRole: [1]
      },
      {
         text: 'Detalle de los Turnos',
         icon: <AssignmentInd className={classes.itemIcon} />,
         onClick: () => history.push('/shifts'),
         userRole: [1]
      },
      {
         text: 'Categorías',
         icon: <Category className={classes.itemIcon} />,
         onClick: () => history.push('/categories'),
         userRole: [1]
      },
      {
         text: 'Productos',
         icon: <AirportShuttle className={classes.itemIcon} />,
         onClick: () => history.push('/products'),
         userRole: [1, 2, 3]
      },
      {
         text: 'Reportes de Ventas',
         icon: <Assignment className={classes.itemIcon} />,
         onClick: () => history.push('/saleReports'),
         userRole: [1, 2]
      }
   ];

   useEffect(() => {
      checkShift()
      // eslint-disable-next-line
   }, [])

   const checkShift = () => {
      const prepareData = {
         spName: 'spCheckLastShift'
      }
      ipcRenderer.invoke('checklastshift', prepareData)
         .then((shifts: any) => {
            if(shifts[0]) {
               if (shifts[0].endShift == null){
                  //caso si no se finalizó el ultimo turno
                  setInShift(true)
               } else {
                  //caso si se finalizó el ultimo turno
                  setInShift(false)
               }
            } else {
               //caso si no existe
               setInShift(false)
            }
         })
   }

   const changeShifts = () => {
      const prepareData = {
         spName: 'spCheckLastShift'
      }
      ipcRenderer.invoke('checklastshift', prepareData)
         .then((shifts: any) => {
            if(shifts[0]) {
               if (shifts[0].endShift == null){
                  //caso si no se finalizó el ultimo turno
                  let inicio = shifts[0].startShift
                  let fin = new Date()
                  fin.setUTCHours(fin.getUTCHours() - 5)
                  let idu = shifts[0].idUser
                  let id = shifts[0].idShift
                  updateShift(inicio, fin, id, idu)
                  setInShift(false)
               } else {
                  //caso si se finalizó el ultimo turno
                  createShift()
                  setInShift(true)
               }
            } else {
               //caso si no existe
               createShift()
               setInShift(true)
            }
         })
   }

   const createShift = () => {
      let fecha = new Date()
      fecha.setUTCHours(fecha.getUTCHours() - 5)
      const prepareData = {
         Startshift: { value: fecha },
         Endshift: { value: null },
         Iduser: { value: user.idUser },
         StartAmount: { value: caja},
         spName: 'spCreateShift'
      }
      ipcRenderer.invoke('createshift', prepareData)
         .then((message: any) => {
            AlertSmall('success', 'Se inicio el turno correctamente')
         })
   }

   const updateShift = (inicioSh: any, finSh: any, idSh: any, idUs: any) => {
      const prepareData = {
         Startshift: { value: inicioSh },
         Endshift: { value: finSh },
         Iduser: { value: idUs },
         Idshift: { value: idSh },
         EndAmount: { value: caja},
         spName: 'spUpdateShift'
      }
      ipcRenderer.invoke('updateshift', prepareData)
         .then((message: any) => {
            AlertSmall('success', 'Se finalizó el turno correctamente')
         })
   }

   return (
      <Drawer variant="permanent" className={classes.drawer} classes={{ paper: classes.paperDrawer }} anchor="left">
         <div style={{display:"flex", justifyContent:"center", alignItems:"center", padding:"10px"}}>
            <img src={logo} alt="logo" width="100%" height="150px" />            
         </div>
         {/*
         <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
            <img src={logo} alt="logo" width="50px" height="50px"/>
            <Typography style={{color:"white"}}>FRESCO</Typography>
         </div>
         <Grid container spacing={3}>
            <Grid item xs={12}>
               <img src="https://www.ejemplos.co/wp-content/uploads/2015/11/Logo-Adidas.jpg" alt="logo" width="100%" height="150px"/>
            </Grid>
            <Grid item xs={12}>
               <h1>Buenas</h1>
            </Grid>
         </Grid>*/}
         <List>
            {itemsList.map((item) => {
               const { text, icon, onClick, userRole } = item;
               let visibility = false
               if (userRole.includes(user.idRole)) visibility = true
               return visibility && (
                  <ListItem button key={text} onClick={onClick}>
                     {icon && <ListItemIcon>{icon}</ListItemIcon>}
                     <ListItemText primary={text} className={classes.itemText} />
                  </ListItem>
               );
            })}
         </List>
         <Button variant="contained" color="primary" className={classes.buttonShift} onClick={changeShifts}>{inShift ? 'Terminar turno':'Iniciar turno'}</Button>
      </Drawer>
   );
};

export default SideBar;