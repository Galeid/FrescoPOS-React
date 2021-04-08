import React, { useState, useEffect } from 'react';
//import { ipcRenderer as ipc } from 'electron'

import { useHistory } from 'react-router-dom';
import {
   Box,
   Button,
   Card,
   CardContent,
   CardHeader,
   Divider,
   Grid,
   TextField,
   Select,
   MenuItem,
   Input,
   FormControl,
   FormHelperText,
   InputLabel
} from '@material-ui/core';

import AlertSmall from '../../Alert/AlertSmall'

const { ipcRenderer } = window.require('electron')

const CardUserDetails = (props: { idUser: any; }) => {
   let id = props.idUser;
   let history = useHistory()
   const [userDB, setUserDB] = useState({
      idUser: '',
      idRole: '2',
      nameUser: '',
      passwordUser: '',
      stateUser: 0,
      typedocUser: '',
      numdocUser: '',
      phoneUser: '',
      emailUser: ''
   })

   useEffect(() => {
      if (id !== 'null') {
            console.log('con id: ', props)
            getUser()
      } else {
            console.log('sin id: ', props)
      }
      // eslint-disable-next-line
   }, [])

   const handleChange = (event: React.ChangeEvent<{ name?: string | undefined; value: unknown; }>) => {
      setUserDB({...userDB,
         [event.target.name as string]: event.target.value as string
      });
   };

   const getUser = () => {
      const prepareData = {
         Entry: { value: props.idUser },
         spName: 'spSearchIdUser'
      }
      ipcRenderer.invoke('searchidproduct', prepareData)
         .then((user: any) => {
            setUserDB(user[0])
         })
   }

   const insertUser = () => {
      const prepareData = {
         Idrole: { value: userDB.idRole},
         Name: { value: userDB.nameUser},
         Password: { value: userDB.passwordUser},
         State: { value: userDB.stateUser},
         Typedoc: { value: 'DNI' },
         Numdoc: { value: userDB.numdocUser},
         Phone: { value: userDB.phoneUser},
         Email: { value: userDB.emailUser},
         spName: 'spInsertUser'
      }
      console.log(prepareData)
      if (userDB.nameUser !== '' && userDB.emailUser !== '' && userDB.passwordUser !== '') {
          ipcRenderer.invoke('insertuser', prepareData)
              .then(() => {
                  AlertSmall('success', 'Se agrego el usuario con exito')
                  history.push('/users')
              }).catch((err: any) => {
                  AlertSmall('error', `Ha ocurrido un error, ${err}`)
              })
      } else {
          AlertSmall('error', 'Le falta completar algunos campos')
      }
   }
  
   const updateUser = () => {
      const prepareData = {
         Iduser: { value: userDB.idUser },
         Idrole: { value: userDB.idRole },
         Name: { value: userDB.nameUser },
         Password: { value: userDB.passwordUser },
         State: { value: userDB.stateUser },
         Typedoc: { value: userDB.typedocUser },
         Numdoc: { value: userDB.numdocUser },
         Phone: { value: userDB.phoneUser },
         Email: { value: userDB.emailUser },
         spName: 'spUpdateUser'
      }
      ipcRenderer.invoke('updateuser', prepareData)
          .then((message: any) => {
              console.log(message)
              AlertSmall('success', 'Se han guardado los cambios con exito')
          }).catch((err: any) => AlertSmall('error', `Ha ocurrido un error, ${err}`))
   }

   return (
      <form autoComplete="off" noValidate>
         <Card>
            <CardHeader
               subheader="Nota: Debe llenar obligatoriamente los campos del usuario"
               title={id !== 'null' ? 'Editar Usuario' : 'Insertar Usuario'}
            />
            <Divider />
            <CardContent>
               <Grid container spacing={3}>
                  <Grid item md={6} xs={12}>
                     <TextField
                        fullWidth
                        label="Nombre del Usuario"
                        onChange={handleChange}
                        value={userDB.nameUser || ''}
                        name="nameUser"
                        variant="outlined"
                     />
                  </Grid>
                  <Grid item md={6} xs={12}>
                     <TextField
                        fullWidth
                        required
                        label="Correo Personal"
                        onChange={handleChange}
                        value={userDB.emailUser || ''}
                        name="emailUser"
                        variant="outlined"
                     />
                  </Grid>
                  <Grid item md={6} xs={12}>
                     <TextField
                        fullWidth
                        label="Contraseña"
                        onChange={handleChange}
                        value={userDB.passwordUser || ''}
                        name="passwordUser"
                        variant="outlined"
                     />
                  </Grid>
                  <Grid item md={6} xs={12}>
                     <TextField
                        fullWidth
                        required
                        label="Celular"
                        onChange={handleChange}
                        value={userDB.phoneUser || ''}
                        name="phoneUser"
                        type="number"
                        variant="outlined"
                     />
                  </Grid>
                  <Grid item md={6} xs={12}>
                     <TextField
                        fullWidth
                        required
                        label="N° Documento - DNI"
                        onChange={handleChange}
                        value={userDB.numdocUser || ''}
                        name="numdocUser"
                        variant="outlined"
                     />
                  </Grid>
                  <Grid item xs={3}>
                     <FormControl fullWidth>
                        <InputLabel disableAnimation={false}>
                           Rol del Usuario
                        </InputLabel>
                        <Select 
                           fullWidth
                           required
                           value={userDB.idRole || '2'}
                           onChange={handleChange}
                           input={<Input name="idRole"/>}
                        >
                           <MenuItem value={'1'}>Admin</MenuItem>
                           <MenuItem value={'2'}>Empleado</MenuItem>
                           <MenuItem value={'3'}>Almacenador</MenuItem>
                        </Select>
                        <FormHelperText>Selecciona al menos una opcion</FormHelperText>
                     </FormControl>
                  </Grid>
                  <Grid item xs={3}>
                     <FormControl fullWidth>
                        <InputLabel disableAnimation={false}>
                           Estado
                        </InputLabel>
                        <Select 
                           fullWidth
                           required
                           value={userDB.stateUser}
                           onChange={handleChange}
                           input={<Input name="stateUser"/>}
                        >
                           <MenuItem selected value={userDB.stateUser}>
                                 <em>{userDB.stateUser ? 'Activo' : 'Inactivo'}</em>
                           </MenuItem>
                           {
                              userDB.stateUser ?
                                 <MenuItem value={0}>Inactivo</MenuItem>
                                 :
                                 <MenuItem value={1}>Activo</MenuItem>
                           }
                        </Select>
                        <FormHelperText>Selecciona al menos una opcion</FormHelperText>
                     </FormControl>
                  </Grid>
               </Grid>
            </CardContent>
            <Divider />
            <Box display="flex" justifyContent="flex-end" p={2}>
               <Grid container justify="flex-end" spacing={3}>
                  <Grid item xs={3}>
                     <Button
                        color="default"
                        variant="contained"
                        onClick={() => {
                           history.push('/users')
                        }}
                     >
                        Regresar
                     </Button>
                  </Grid>
                  <Grid item xs={3}>
                     <Button
                        color="primary"
                        variant="contained"
                        onClick={id !== 'null' ? updateUser : insertUser}
                     >
                        {id !== 'null' ? 'Guardar' : 'Insertar'}
                     </Button>
                  </Grid>
               </Grid>
            </Box>
         </Card>
      </form >
   )
}

export default CardUserDetails
