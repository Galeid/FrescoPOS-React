import React, { useState, useEffect } from 'react'
import { Box, Grid, Card, CardContent, Button,
   TextField, Table, TableBody, TableCell, TableContainer,
   TableHead, TableRow, Typography, Divider, FormControl, 
   FormControlLabel, RadioGroup, Radio, FormLabel } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';

const { ipcRenderer } = window.require('electron')

const useStyles = makeStyles(() => ({
   root: {
         flexGrow: 1,
         margin: '10px',
   },
}));

interface Sales {
   idSale: string,
   nameUser: string,
   qproductsSale: string,
   voucherSale: string,
   subtotalSale: string,
   taxSale: string,
   dateSale: string,
   waytopaySale: string,
   stateSale: string
}
let salesFromDB: Sales[] = []

const SaleReports = () => {
   const classes = useStyles()

   const [salesDB, setSalesDB] = useState(salesFromDB)

   useEffect(() => {
      getSales()
   }, [])

   const getSales = () => {
      const prepareData = {
         spName: 'spListSales'
     }
     ipcRenderer.invoke('getsales', prepareData)
         .then((sales: any) => {
            setSalesDB(sales)
         })
   }

   return (
      <>
      <Card className={classes.root}>
         <CardContent>
            opciones de fecha
         </CardContent>
      </Card>

      <Card className={classes.root}>
         <CardContent>
            <TableContainer>
               <Table>
                  <TableHead>
                     <TableRow>
                        <TableCell align="center">Id</TableCell>
                        <TableCell align="center">Cliente</TableCell>
                        <TableCell align="center">N° Productos</TableCell>
                        <TableCell align="center">Voucher</TableCell>
                        <TableCell align="center">Venta Total</TableCell>
                        <TableCell align="center">Impuestos</TableCell>
                        <TableCell align="center">Fecha de Venta</TableCell>
                        <TableCell align="center">Método de Pago</TableCell>
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {salesDB.map((s, index) => (
                        <TableRow key={index}>
                           <TableCell align="center">{s.idSale}</TableCell>
                           <TableCell align="center">{s.nameUser}</TableCell>
                           <TableCell align="center">{s.qproductsSale}</TableCell>
                           <TableCell align="center">{s.voucherSale}</TableCell>
                           <TableCell align="center">{s.subtotalSale}</TableCell>
                           <TableCell align="center">{s.taxSale}</TableCell>
                           <TableCell align="center">{s.dateSale}</TableCell>
                           <TableCell align="center">{s.waytopaySale}</TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </TableContainer>
         </CardContent>
      </Card>
      </>
   )
}

export default SaleReports
