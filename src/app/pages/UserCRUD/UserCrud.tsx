import React, { useEffect, useState } from 'react'
import { Card, CardContent, Typography, Button, Grid,
   TableContainer, Table, TableHead, TableRow, TableCell,
   TableBody, Chip, Tooltip } from '@material-ui/core'
import { Delete, Edit, Add, Block } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom'
import AlertSmall from '../../components/Alert/AlertSmall'
import AlertBig from '../../components/Alert/AlertBig'

const { ipcRenderer } = window.require('electron')

const useStyles = makeStyles(() => ({
   root: {
       flexGrow: 1,
       margin: '10px',
   },
   container: {
       paddingTop: '40px',
       alignItems: 'center'
   },
   containerTabla: {
       margin: '10px',
       alignItems: 'center'
   },
   buttonadd: {
      margin: '0 0 0 auto'
   },
   nomargin: {
       margin: 0
   },
   rootbutton: {
      minWidth: 'auto',
      padding: '6px 8px 6px 8px'
   }
}));

let usersFromDB: any[] = []

const rolesValues = ['Admin', 'Employee', 'Stocker']

const UserCrud = () => {
   let history = useHistory()
   const classes = useStyles()
   const [usersDB, setUsersDB] = useState(usersFromDB)
   const [show, setShow] = useState(false)

   useEffect(() => {
      getUsers()
      // eslint-disable-next-line
   }, [])

   const getUsers = () => {
      const prepareData = {
         spName: 'spListUsers'
      }
      ipcRenderer.invoke('getusers', prepareData)
         .then((users: any) => {
               setUsersDB(users)
               !show ? setShow(true) : console.log('getUsers(): Show es true')
         })
   }

   const changeStateUser = (u: any) => {
      let newState = !u.stateUser
      const prepareData = {
         Iduser: { value: u.idUser },
         Idrole: { value: u.idRole },
         Name: { value: u.nameUser },
         Password: { value: u.passwordUser },
         State: { value: newState },
         Typedoc: { value: u.typedocUser },
         Numdoc: { value: u.numdocUser },
         Phone: { value: u.phoneUser },
         Email: { value: u.emailUser },
         spName: 'spUpdateUser'
      }
      ipcRenderer.invoke('updateuser', prepareData)
         .then(() => {
            AlertSmall('success', 'Cambio de estado de usuario')
            //console.log(message + 'Cambio de estado de usuario')
            getUsers()
         })
   }

   const deleteUser = (u:any) => {
      AlertBig('Estas seguro de eliminar el producto?', 'Esta accion no se puede revertir!', 'warning', 'Si, deseo eliminarlo!').then((result: any) => {
         if (result.isConfirmed) {
            const prepareData = {
               Entry: { value: u.idUser},
               spName: 'spDeleteUser'
            }
            ipcRenderer.invoke('deleteuser', prepareData)
               .then((message: any) => {
                  console.log(message)
                  getUsers()
               })
         }
      })
   }

   return show ? (
      <>
      <Card className={classes.root}>
         <CardContent style={{ padding: '16px'}}>
            <Grid container spacing={2}>
               <Grid item xs={8}>
                  <Typography variant="h5" component="h2">Manejo de Usuarios:</Typography>
               </Grid>
               <Grid item xs={4}>
                  <Button
                     fullWidth
                     variant="contained"
                     color="primary"
                     className={classes.buttonadd}
                     startIcon={<Add />}
                     onClick={() => {
                        history.push(`/usersDetails/${null}`)
                     }}
                  >
                     Agregar
                  </Button>
               </Grid>
            </Grid>
         </CardContent>
      </Card>

      <Card className={classes.root}>
         <Grid item xs={12} className={classes.containerTabla}>
            <TableContainer>
               <Table>
                  <TableHead>
                     <TableRow>
                     <TableCell align="center">Tipo</TableCell>
                     <TableCell align="center">Nombre</TableCell>
                     <TableCell align="center">Correo</TableCell>
                     <TableCell align="center">Telefono</TableCell>
                     <TableCell align="center">N°Documento</TableCell>
                     <TableCell align="center">Estado</TableCell>
                     <TableCell align="center">Acciones</TableCell>
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {usersDB.map((u, index) => (
                        <TableRow key={index}>
                           <TableCell align="center">{rolesValues[u.idRole - 1]}</TableCell>
                           <TableCell align="center">{u.nameUser}</TableCell>
                           <TableCell align="center">{u.emailUser}</TableCell>
                           <TableCell align="center">{u.phoneUser}</TableCell>
                           <TableCell align="center">{u.numdocUser}</TableCell>
                           <TableCell align="center">{u.stateUser ?
                              <Chip
                                 color="primary"
                                 label="Activo"
                                 size="small"
                              /> :
                              <Chip
                                 color="secondary"
                                 label="Inactivo"
                                 size="small"
                              />}
                           </TableCell>
                           <TableCell align="center">
                              <Grid container spacing={2}>
                                 <Grid item xs={4}>
                                    <Tooltip title="Editar" placement="top">
                                       <Button
                                          variant="contained"
                                          color="default"
                                          startIcon={<Edit />}
                                          classes={{
                                             startIcon: classes.nomargin,
                                             root: classes.rootbutton
                                          }}
                                          onClick={() => {
                                          history.push(`/usersDetails/${u.idUser}`)
                                          }}
                                       />
                                    </Tooltip>
                                 </Grid>
                                 <Grid item xs={4}>
                                    <Tooltip title="Bloquear Acceso" placement="top">
                                       <Button
                                          variant="contained"
                                          color="secondary"
                                          onClick={() => changeStateUser(u)}
                                          classes={{
                                             startIcon: classes.nomargin,
                                             root: classes.rootbutton
                                          }}
                                          startIcon={<Block />}
                                       />
                                    </Tooltip>
                                 </Grid>
                                 <Grid item xs={4}>
                                    <Tooltip title="Eliminar" placement="top">
                                       <Button
                                          variant="contained"
                                          color="secondary"
                                          onClick={() => deleteUser(u)}
                                          classes={{
                                             startIcon: classes.nomargin,
                                             root: classes.rootbutton
                                          }}
                                          startIcon={<Delete />}
                                       />
                                    </Tooltip>
                                 </Grid>
                              </Grid>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </TableContainer>
         </Grid>
      </Card>
   </>
   ) : (<></>)
}

export default UserCrud
