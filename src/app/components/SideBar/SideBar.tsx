import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom';

import {
   Typography,
   Drawer,
   ListItem,
   List,
   ListItemIcon,
   ListItemText,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { AuthContext } from '../../../services/AuthContext';
import logo from './Logo3.png';
//Icons
import HomeIcon from '@material-ui/icons/Home';
import LocalGroceryStoreIcon from '@material-ui/icons/LocalGroceryStore';
import AddCircleIcon from '@material-ui/icons/AddCircle'

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
});

const SideBar = () => {
   const { user } = useContext(AuthContext)
   let history = useHistory();
   const classes = useStyles();

   const itemsList = [
      {
         text: 'Dashboard',
         icon: <HomeIcon className={classes.itemIcon} />,
         onClick: () => history.push('/dashboard'),
         userRole: [1, 2, 3]
      },
      {
         text: 'Ventas (Beta)',
         icon: <LocalGroceryStoreIcon className={classes.itemIcon} />,
         onClick: () => history.push('/sale'),
         userRole: [1, 2]
      },
      {
         text: 'Usuarios',
         icon: <AddCircleIcon className={classes.itemIcon} />,
         onClick: () => history.push('/users'),
         userRole: [1]
      },
      {
         text: 'Categorías',
         icon: <AddCircleIcon className={classes.itemIcon} />,
         onClick: () => history.push('/categories'),
         userRole: [1]
      },
      {
         text: 'Productos',
         icon: <AddCircleIcon className={classes.itemIcon} />,
         onClick: () => history.push('/products'),
         userRole: [1, 2, 3]
      },
   ];

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
      </Drawer>
   );
};

export default SideBar;