import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom';

import {
   Drawer,
   ListItem,
   List,
   ListItemIcon,
   ListItemText,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { AuthContext } from '../../../services/AuthContext';

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
      backgroundColor: '#282C34',
      width: sideBarWidth
   }
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
         userRole: [1,2,3]
      },
      {
         text: 'Ventas (Beta)',
         icon: <LocalGroceryStoreIcon className={classes.itemIcon} />,
         onClick: () => history.push('/sale'),
         userRole: [1,2]
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
         userRole: [1,2,3]
      },
   ];

   return (
      <Drawer variant="permanent" className={classes.drawer} classes={{ paper: classes.paperDrawer }} anchor="left">
         <List>
            {itemsList.map((item) => {
               const { text, icon, onClick, userRole} = item;
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