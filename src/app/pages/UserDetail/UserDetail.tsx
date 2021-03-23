import React from 'react'
import { useParams } from 'react-router-dom'
import {
   Container,
   Grid,
   makeStyles
} from '@material-ui/core';
import CardUserDetails from '../../components/Cards/Users/CardUserDetails';


const useStyles = makeStyles((theme) => ({
    root: {
        margin: '10px',
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    }
}));
const UserDetail = () => {
   const classes = useStyles()
   const { idUser } = useParams<{ idUser: string }>();
    return (
      <Grid className={classes.root}>
         <Container maxWidth="lg">
            <Grid container spacing={3} >
               <Grid item lg={12} md={12} xs={12}>
                  {idUser ?
                     <CardUserDetails idUser={idUser} />
                     :
                     <CardUserDetails idUser={null} />
                  }
               </Grid>
            </Grid>
         </Container>
      </Grid>
    )
}

export default UserDetail
