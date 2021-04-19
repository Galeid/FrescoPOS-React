import React, { useState, useEffect } from 'react'
import {
   Grid, Card, CardContent, Button, Table, TableBody, Tooltip,
   TableCell, TableContainer, TableHead, TableRow, TablePagination
} from '@material-ui/core'
import DateFnsUtils from '@date-io/date-fns'
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import { makeStyles } from '@material-ui/core/styles'
import RedoIcon from '@material-ui/icons/Redo'

import { useHistory } from 'react-router-dom'

const { ipcRenderer } = window.require('electron')

const useStyles = makeStyles(() => ({
   root: {
      flexGrow: 1,
      margin: '10px',
   },
   tfInputmargin: {
      padding: '9px 9px 9px 9px'
   },
   tflabel: {
      transform: 'translate(10px, 12px) scale(1)'
   },
   nomargin: {
      margin: 0
   },
   rootbutton: {
      minWidth: 'auto',
      padding: '6px 8px 6px 8px'
   }
}));

interface Shift {
   idShift: string,
   startShift: Date,
   endShift: Date,
   nameUser: string
   startAmount: string,
   endAmount: string,
}

let shiftFromDB: Shift[] = []

const ShiftsList = () => {
   let history = useHistory()
   const classes = useStyles()
   const [page, setPage] = useState(0);
   const [rowsPerPage, setRowsPerPage] = React.useState(5);
   const [shiftDB, setShiftDB] = useState(shiftFromDB)
   const [dateFrom, setDateFrom] = useState(new Date(new Date().setHours(0, 0, 0, 0)))
   const [dateTo, setDateTo] = useState(new Date(new Date().setHours(23, 59, 59, 999)))

   const FormatDay = (d: Date) => {
      let dformat = [d.getUTCFullYear(),
         d.getUTCMonth() + 1,
         d.getUTCDate()].join('-') + ' ' +
         [d.getUTCHours(),
         d.getUTCMinutes(),
         d.getUTCSeconds()].join(':');
      return dformat
   }

   const getShift = () => {
      const prepareData = {
         spName: 'spListShifts'
      }
      ipcRenderer.invoke('listshifts', prepareData)
         .then((shift: any) => {
            setShiftDB(shift)
         })
   }

   const searchShiftDate = () => {
      const prepareData = {
         Datefrom: { value: dateFrom },
         Dateto: { value: dateTo },
         spName: 'spSearchShiftDates'
      }
      ipcRenderer.invoke('searchshift', prepareData)
         .then((shift: any) => {
            setShiftDB(shift)
         })
   }

   const handleChangePage = (e: any, newPage: number) => {
      setPage(newPage);
   }

   const handleChangeRowsPerPage = (e: any) => {
      setRowsPerPage(parseInt(e.target.value, 10));
      setPage(0);
   }

   const goCashmoves = ( id: any ) => {
      history.push(`/cashmoves/${id}`)
   }
   
   useEffect(() => {
      //getSales()
      getShift()
      // eslint-disable-next-line
   }, [])

   return (
      <>
         <Card className={classes.root}>
            <CardContent>
               <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <Grid container spacing={4} alignContent="center" alignItems="center">
                     <Grid item xs={3}>
                        <Button fullWidth variant="contained" color="primary" onClick={getShift} style={{ marginBottom: '8px' }}>Todas los turnos</Button>
                        <Button fullWidth variant="contained" color="primary" onClick={searchShiftDate}>Buscar por fecha</Button>
                     </Grid>
                     <Grid item xs={4}>
                        <KeyboardDatePicker
                           margin="normal"
                           label="Desde la fecha:"
                           value={dateFrom}
                           onChange={date => {
                              let ndate = date as Date
                              ndate.setHours(0, 0, 0, 0)
                              setDateFrom(ndate as Date)
                           }}
                           format="dd/MM/yyyy"
                        />
                     </Grid>
                     <Grid item xs={4}>
                        <KeyboardDatePicker
                           margin="normal"
                           label="Hasta la fecha:"
                           value={dateTo}
                           onChange={date => {
                              let ndate = date as Date
                              ndate.setHours(23, 59, 59, 999)
                              setDateTo(ndate as Date)
                           }}
                           format="dd/MM/yyyy"
                        />
                     </Grid>
                  </Grid>
               </MuiPickersUtilsProvider>
            </CardContent>
         </Card>
         <Grid container spacing={1}>
            <Grid item xs={12}>
               <Card className={classes.root}>
                  <CardContent>
                     <TableContainer>
                        <Table>
                           <TableHead>
                              <TableRow>
                                 <TableCell align="center">Id</TableCell>
                                 <TableCell align="center">Apertura de Turno</TableCell>
                                 <TableCell align="center">Cierre de Turno</TableCell>
                                 <TableCell align="center">Usuario</TableCell>
                                 <TableCell align="center">Monto Inicial</TableCell>
                                 <TableCell align="center">Monto Final</TableCell>
                                 <TableCell align="center">Detalles</TableCell>
                              </TableRow>
                           </TableHead>
                           <TableBody>
                              {shiftDB
                                 .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                 .map((s, index) => (
                                    <TableRow hover key={index}>
                                       <TableCell align="center">{s.idShift}</TableCell>
                                       <TableCell align="center">{FormatDay(s.startShift)}</TableCell>
                                       <TableCell align="center">{(s.endShift) ? FormatDay(s.endShift) : 'Turno no Terminado'}</TableCell>
                                       <TableCell align="center">{s.nameUser}</TableCell>
                                       <TableCell align="center">{s.startAmount}</TableCell>
                                       <TableCell align="center">{s.endAmount}</TableCell>
                                       <TableCell align="center">
                                          <Tooltip title="Turno">
                                             <Button variant="contained" classes={{startIcon: classes.nomargin, root: classes.rootbutton}} color="primary" onClick={()=> goCashmoves(s.idShift)}><RedoIcon /></Button>
                                          </Tooltip>
                                       </TableCell>
                                    </TableRow>
                                 ))}
                           </TableBody>
                        </Table>
                     </TableContainer>
                     <TablePagination
                        rowsPerPageOptions={[5, 10, 25, shiftDB.length]}
                        component="div"
                        count={shiftDB.length}
                        //count={productDB.length === -1 ? 1 * 10 + 1 : productDB.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        //page={( page > 0 && productDB.length === rowsPerPage ) ? 0 : page}
                        onChangePage={handleChangePage}
                        onChangeRowsPerPage={handleChangeRowsPerPage}
                     />
                  </CardContent>
               </Card>
            </Grid>
         </Grid>
      </>
   )
}

export default ShiftsList
