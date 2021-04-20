import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
   Chip, Card, CardContent, Table, TableBody, 
   TableCell, TableContainer, TableHead, TableRow, FormControl,
   InputLabel, Select, MenuItem, Typography, Grid,
   TablePagination
} from '@material-ui/core'

const { ipcRenderer } = window.require('electron')

interface Activity {
   idActivity: number,
   idShift: number,
   idUser: number,
   nameActivity: string,
   amountActivity: number,
   operatorActivity: string,
   resultActivity: number,
   idMovement: number,
   dateActivity: Date,
   nameUser: string,
}

let cashActivity: Activity[] = []

const round2Decimals = (num: any) => {
   return Math.round((num + Number.EPSILON) * 100) / 100
}

const convertDateString = (saleDate: Date) => {
   if (saleDate === null) {
      return '-'
   }

   let date = saleDate,
      mnth = ("0" + (date.getUTCMonth() + 1)).slice(-2),
      day = ("0" + date.getUTCDate()).slice(-2);
   return [day, mnth, date.getUTCFullYear()].join("/");
}

const CashPage = () => {
   const [show, setShow] = useState(false)
   const [activityInfo, setActivityInfo] = useState(cashActivity)
   const [selectAction, setSelectAction] = useState('')
   const [page, setPage] = useState(0);
   const [rowsPerPage, setRowsPerPage] = React.useState(10);

   const { idShift } = useParams<{ idShift: string }>();
   //spSearchActivities searchactivities

   useEffect(() => {
      searchActivities()
      // eslint-disable-next-line
   }, [])
   
   const showChangeCash = (activity: any) => {
      let stringReturn = ''
      let am = activity.amountActivity
      let op = activity.operatorActivity
      let re = activity.resultActivity
      let ini = 0
      if (op === '+') {
         ini = re - am
      } else if (op === '-') {
         ini = re + am
      }
      stringReturn = 'S/ ' + round2Decimals(ini) + ' \t -> \t S/ ' + re
      return stringReturn
   }

   const chipActivity = (action: any) => {
      let colorS = 'primary'
      if (action === 'Retiro') {
         colorS = 'secondary'
      } else if (action === 'Devolucion') {
         colorS = 'secondary'
      } else if (action === 'Compra') {
         colorS = 'secondary'
      }
      return (<Chip color={colorS as "primary" | "secondary" | "default" | undefined} label={action} size="small" />)
   }

   const handleChangePage = (e: any, newPage: number) => {
      setPage(newPage);
   }

   const handleChangeRowsPerPage = (e: any) => {
      setRowsPerPage(parseInt(e.target.value, 10));
      setPage(0);
   }
   
   const searchActivities = () => {
      const prepareData = {
         spName: 'spSearchActivities'
      }
      ipcRenderer.invoke('searchactivities', prepareData)
         .then((act: any) => {
            if (idShift !== 'null') {
               let aux = []
               for (let i = 0; i < act.length; i++) {
                  if (act[i].idShift.toString() === idShift) {
                     aux.push(act[i])
                  }
               }
               setActivityInfo(aux as Activity[])
            } else {
               setActivityInfo(act as Activity[])
            }
            setShow(true)
         })
   }

   const handleSelectAction = (e: React.ChangeEvent<{ value: unknown }>) => {
      setSelectAction(e.target.value as string)
   }

   return show ? (
      <>
      <Card style={{marginBottom: '8px'}}>
         <CardContent>
            <Grid container spacing={2}>
               <Grid item xs={9}>
                  <Typography variant="h5" style={{marginTop: '16px'}}>Cambios de Caja</Typography>
               </Grid>
               <Grid item xs={3}>
                  <FormControl style={{minWidth: '200px'}}>
                     <InputLabel>Buscar por Accion</InputLabel>
                     <Select
                        value={selectAction}
                        onChange={handleSelectAction}
                     >
                        <MenuItem value={''}>Todo</MenuItem>
                        <MenuItem value={'Venta'}>Venta</MenuItem>
                        <MenuItem value={'Compra'}>Compra</MenuItem>
                        <MenuItem value={'Devolucion'}>Devolucion</MenuItem>
                        <MenuItem value={'Recarga'}>Recarga</MenuItem>
                        <MenuItem value={'Retiro'}>Retiro</MenuItem>
                     </Select>
                  </FormControl>
               </Grid>
            </Grid>
         </CardContent>
      </Card>
      <Card>
         <CardContent>
            <TableContainer>
               <Table>
                  <TableHead>
                     <TableRow>
                        <TableCell align="center">Cod.</TableCell>
                        <TableCell align="center">Turno</TableCell>
                        <TableCell align="center">Usuario</TableCell>
                        <TableCell align="center">Accion</TableCell>
                        <TableCell align="center">Monto</TableCell>
                        <TableCell align="center">Cambio en Caja</TableCell>
                        <TableCell align="center">Fecha</TableCell>
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {activityInfo.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((a, index) => {
                        if (selectAction === '') {
                           return (<TableRow key={index}>
                              <TableCell align="center">{a.idActivity}</TableCell>
                              <TableCell align="center">{a.idShift}</TableCell>
                              <TableCell align="center">{a.nameUser}</TableCell>
                              <TableCell align="center">{chipActivity(a.nameActivity)}</TableCell>
                              <TableCell align="center">{a.operatorActivity + ' ' + a.amountActivity}</TableCell>
                              <TableCell align="center">{showChangeCash(a)}</TableCell>
                              <TableCell align="center">{convertDateString(a.dateActivity)}</TableCell>
                           </TableRow>)
                        }
                        if (selectAction === a.nameActivity) {
                           return (<TableRow key={index}>
                              <TableCell align="center">{a.idActivity}</TableCell>
                              <TableCell align="center">{a.idShift}</TableCell>
                              <TableCell align="center">{a.nameUser}</TableCell>
                              <TableCell align="center">{chipActivity(a.nameActivity)}</TableCell>
                              <TableCell align="center">{a.operatorActivity + ' ' + a.amountActivity}</TableCell>
                              <TableCell align="center">{showChangeCash(a)}</TableCell>
                              <TableCell align="center">{convertDateString(a.dateActivity)}</TableCell>
                           </TableRow>)
                        }
                        return false
                     })}
                  </TableBody>
               </Table>
            </TableContainer>
            <TablePagination
               rowsPerPageOptions={[10, 25]}
               component="div"
               count={activityInfo.length}
               //count={productDB.length === -1 ? 1 * 10 + 1 : productDB.length}
               rowsPerPage={rowsPerPage}
               page={page}
               //page={( page > 0 && productDB.length === rowsPerPage ) ? 0 : page}
               onChangePage={handleChangePage}
               onChangeRowsPerPage={handleChangeRowsPerPage}
            />
         </CardContent>
      </Card>
      </>
   ) : (<div>Cargando</div>)
}

export default CashPage
