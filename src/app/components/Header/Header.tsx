import React from 'react'

import AppBar from '@material-ui/core/AppBar';
import { makeStyles } from '@material-ui/core/styles';

import HeaderBody from '../HeaderBody/HeaderBody'

const sideBarWidth = 240
const useStyles = makeStyles({
   appBar: {
     width: `calc(100% - ${sideBarWidth}px)`,
     marginLeft: sideBarWidth
   }
 });

const Header = () => {
   const classes = useStyles();

   return (
      <AppBar position="fixed" className={classes.appBar}>
         <HeaderBody />
      </AppBar>
   )
}

export default Header
