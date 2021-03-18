import React from 'react'
import { useHistory } from 'react-router-dom';

import {
   Drawer,
   ListItem,
   List,
   ListItemIcon,
   ListItemText,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

//Icons
//import AccountCircleIcon from '@material-ui/icons/AccountCircle';
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
      backgroundColor: '#282C34',
      width: sideBarWidth
   }
});

const SideBar = () => {
   let history = useHistory();
   const classes = useStyles();

   const itemsList = [
      /*{
         text: 'Home',
         icon: <AccountCircleIcon className={classes.itemIcon} />,
         onClick: () => history.push('/')
      },*/
      {
         text: 'Dashboard',
         icon: <HomeIcon className={classes.itemIcon} />,
         onClick: () => history.push('/dashboard')
      },
      {
         text: 'Ventas (Beta)',
         icon: <LocalGroceryStoreIcon className={classes.itemIcon} />,
         onClick: () => history.push('/sale')
      },
      /*{
         text: 'User',
         icon: <AddCircleIcon className={classes.itemIcon} />,
         onClick: () => history.push('/users')
      },*/
      {
         text: 'Productos',
         icon: <AddCircleIcon className={classes.itemIcon} />,
         onClick: () => history.push('/products')
      },
      /*{
         text: 'ProductosDetails',
         icon: <AddCircleIcon className={classes.itemIcon} />,
         onClick: () => history.push('/productsDetails')
      }*/
   ];

   return (
      <Drawer variant="permanent" className={classes.drawer} classes={{ paper: classes.paperDrawer }} anchor="left">
         <List>
            {itemsList.map((item) => {
               const { text, icon, onClick } = item;
               return (
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