import React, { useState, useEffect } from 'react'
import { Grid, Card, CardContent, Button, Table, 
   TableBody, TableCell, TableContainer, TableHead, TableRow, 
   Typography, Divider } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import { KeyboardDatePicker, MuiPickersUtilsProvider  } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

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
   nameclientSale: string,
   qproductsSale: string,
   voucherSale: string,
   subtotalSale: string,
   taxSale: string,
   dateSale: Date,
   waytopaySale: string,
   stateSale: string
}
interface Order {
   idProduct: string,
   idSale: string,
   quantityOrder: string,
   nameProduct: string,
   priceSellProduct: string,
}

let salesFromDB: Sales[] = []
let orderFromDB: Order[] = []
let orderDataOrigin = {
   orderCode: '-',
   orderUser: '-',
   orderWay: '-',
   orderState: '-',
   orderDiscount: '-',
}

const SaleReports = () => {
   const classes = useStyles()

   const [salesDB, setSalesDB] = useState(salesFromDB)
   const [orderDB, setOrderDB] = useState(orderFromDB)
   const [orderData, setOrderData] = useState(orderDataOrigin)
   const [dateFrom, setDateFrom] = useState(new Date())
   const [dateTo, setDateTo] = useState(new Date())
   const [revenueSales, setRevenueSales] = useState(0)

   useEffect(() => {
      getSales()
      // eslint-disable-next-line
   }, [])

   const convertDateString = (saleDate: Date) => {
      let date = saleDate,
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
      return [day, mnth, date.getFullYear()].join("/");
   }

   const setSalesTableData = (sales: any) => {
      let newNum = 0
      for (let i = 0; i < sales.length; i++) {
         newNum = newNum + sales[i].subtotalSale;
      }
      setRevenueSales(newNum)
      setSalesDB(sales)
   }

   const resetOrders = () => {
      setOrderData(orderDataOrigin)
      setOrderDB(orderFromDB)
   }

   const getSales = () => {
      const prepareData = {
         spName: 'spListSales'
      }
      ipcRenderer.invoke('getsales', prepareData)
         .then((sales: any) => {
            setSalesTableData(sales)
            resetOrders()
         })
   }

   const getOrder = (s: any) => {
      const prepareData = {
         Entry: { value: s.idSale },
         spName: 'spListOrders'
      }
      ipcRenderer.invoke('getorders', prepareData)
         .then((orders: any) => {
            let orderNewData = {
               orderCode: s.idSale + '',
               orderUser: s.nameUser + '',
               orderWay: s.waytopaySale + '',
               orderState: s.stateSale ? 'Activo' : 'Inactivo',
               orderDiscount: s.discountSale + '',
            }
            setOrderData(orderNewData)
            setOrderDB(orders)
         })
   }

   const searchSalesDate = () => {
      const prepareData = {
         Datefrom: { value: dateFrom },
         Dateto: { value: dateTo },
         spName: 'spSearchSalesDates'
      }
      ipcRenderer.invoke('searchsales', prepareData)
         .then((sales: any) => {
            setSalesTableData(sales)
            resetOrders()
         })
   }

   return (
      <>
      <Card className={classes.root}>
         <CardContent>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
               <Grid container spacing={1} alignContent="center" alignItems="center">
                  <Grid item xs={3}>
                     <Button variant="contained" color="primary" onClick={getSales}>Todas las Ventas</Button>
                  </Grid>
                  <Grid item xs={3}>
                     <KeyboardDatePicker
                        margin="normal"
                        label="Desde la fecha:"
                        value={dateFrom}
                        onChange={date => setDateFrom(date as Date)}
                        format="dd/MM/yyyy"
                     />
                  </Grid>
                  <Grid item xs={3}>
                     <KeyboardDatePicker
                        margin="normal"
                        label="Hasta la fecha:"
                        value={dateTo}
                        onChange={date => setDateTo(date as Date)}
                        format="dd/MM/yyyy"
                     />
                  </Grid>
                  <Grid item xs={3}>
                     <Button variant="contained" color="primary" onClick={searchSalesDate}>Buscar por fecha</Button>
                  </Grid>
               </Grid>
            </MuiPickersUtilsProvider>
         </CardContent>
      </Card>

      <Grid container spacing={1}>
         <Grid item xs={8}>
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
                              <TableCell align="center">Total</TableCell>
                              <TableCell align="center">Impuestos</TableCell>
                              <TableCell align="center">Fecha</TableCell>
                           </TableRow>
                        </TableHead>
                        <TableBody>
                           {salesDB.map((s, index) => (
                              <TableRow hover key={index} onClick={() => getOrder(s)}>
                                 <TableCell align="center">{s.idSale}</TableCell>
                                 <TableCell align="center">{s.nameclientSale}</TableCell>
                                 <TableCell align="center">{s.qproductsSale}</TableCell>
                                 <TableCell align="center">{s.voucherSale}</TableCell>
                                 <TableCell align="center">S/ {s.subtotalSale}</TableCell>
                                 <TableCell align="center">S/ {s.taxSale}</TableCell>
                                 <TableCell align="center">{convertDateString(s.dateSale)}</TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </TableContainer>
               </CardContent>
            </Card>
         </Grid>
         <Grid item xs={4}>
            <Card className={classes.root} style={{marginBottom: '8px'}}>
               <CardContent>
                  <Typography variant="h6">Ingresos:</Typography>
                  <Typography variant="subtitle2" align="center">S/ {revenueSales}</Typography>
               </CardContent>
            </Card>
            <Card className={classes.root}>
               <CardContent>
                  <Typography variant="h6">Código de la Venta: {orderData.orderCode}</Typography>
                  <Typography variant="subtitle2">Vendedor: {orderData.orderUser}</Typography>
                  <Typography variant="subtitle2">Metodo de Pago: {orderData.orderWay}</Typography>
                  <Typography variant="subtitle2">Descuento: {orderData.orderDiscount}</Typography>
                  <Typography variant="subtitle2" style={{marginBottom:'8px'}}>Estado: {orderData.orderState}</Typography>
                  <Divider/>
                  <Typography variant="h6" style={{marginTop:'8px'}}>Lista de Productos:</Typography>
                  <TableContainer>
                     <Table>
                        <TableHead>
                           <TableRow>
                              <TableCell align="center">Nombre</TableCell>
                              <TableCell align="center">Cant.</TableCell>
                              <TableCell align="center">Precio</TableCell>
                           </TableRow>
                        </TableHead>
                        <TableBody>
                           {orderDB.map((s, index) => (
                              <TableRow key={index}>
                                 <TableCell align="center">{s.nameProduct}</TableCell>
                                 <TableCell align="center">{s.quantityOrder}</TableCell>
                                 <TableCell align="center">S/ {s.priceSellProduct}</TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </TableContainer>
               </CardContent>
            </Card>
         </Grid>
      </Grid>
      </>
   )
}

export default SaleReports
