import React, { useState, useEffect, useContext, useMemo } from 'react'
import {
   Grid, Card, CardContent, Button, Table,
   TableBody, TableCell, TableContainer, TableHead, TableRow,
   Typography, Divider
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { PDFDownloadLink, Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { AuthContext } from '../../../services/AuthContext'

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

const round2Decimals = (num: any) => {
   return Math.round((num + Number.EPSILON) * 100) / 100
}

const convertDateString = (saleDate: Date) => {
   let date = saleDate,
      mnth = ("0" + (date.getUTCMonth() + 1)).slice(-2),
      day = ("0" + date.getUTCDate()).slice(-2);
   return [day, mnth, date.getUTCFullYear()].join("/");
}

const SaleReports = () => {
   const classes = useStyles()
   const { user } = useContext(AuthContext)

   const [salesDB, setSalesDB] = useState(salesFromDB)
   const [orderDB, setOrderDB] = useState(orderFromDB)
   const [orderData, setOrderData] = useState(orderDataOrigin)
   const [dateFrom, setDateFrom] = useState(new Date(new Date().setHours(0,0,0,0)))
   const [dateTo, setDateTo] = useState(new Date(new Date().setHours(0,0,0,0)))
   const [revenueSales, setRevenueSales] = useState(0)
   const [taxSales, setTaxSales] = useState(0)
   const [pdfInfo, setPdfInfo] = useState({
      revenue: revenueSales, //ingresos
      tax: taxSales,         //impuestos
      sales: salesDB,        //ventas
      dateFrom: convertDateString(dateFrom),//dia
      dateTo: convertDateString(dateTo),//noche
      user: user.nameUser,//user
   })

   useEffect(() => {
      getSales()
      // eslint-disable-next-line
   }, [])

   useEffect(() => {
      console.log(pdfInfo)
      // eslint-disable-next-line
   }, [pdfInfo])

   const setSalesTableData = (sales: any, tos: string) => {
      let newNum = 0
      let newTax = 0
      for (let i = 0; i < sales.length; i++) {
         newNum = newNum + sales[i].subtotalSale;
         newTax =+ sales[i].taxSale;
      }
      setRevenueSales(round2Decimals(newNum))
      setTaxSales(round2Decimals(newTax))
      setSalesDB(sales)

      if (tos === 'all') {
         setPdfInfo({ ...pdfInfo,
            revenue: newNum,
            tax: newTax,
            sales: sales,
            dateFrom: '-/-/-',
            dateTo: '-/-/-',
         })
      }else if (tos === 'date') {
         setPdfInfo({ ...pdfInfo,
            revenue: newNum,
            tax: newTax,
            sales: sales,
            dateFrom: convertDateString(dateFrom),
            dateTo: convertDateString(dateTo),
         })
      }
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
            setSalesTableData(sales, 'all')
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
      console.log(dateFrom)
      console.log(dateTo)
      const prepareData = {
         Datefrom: { value: dateFrom },
         Dateto: { value: dateTo },
         spName: 'spSearchSalesDates'
      }
      ipcRenderer.invoke('searchsales', prepareData)
         .then((sales: any) => {
            setSalesTableData(sales, 'date')
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
                           onChange={date => {
                              let ndate = date as Date
                              ndate.setHours(0,0,0,0)
                              setDateFrom(ndate as Date)
                           }}
                           format="dd/MM/yyyy"
                        />
                     </Grid>
                     <Grid item xs={3}>
                        <KeyboardDatePicker
                           margin="normal"
                           label="Hasta la fecha:"
                           value={dateTo}
                           onChange={date => {
                              let ndate = date as Date
                              ndate.setHours(0,0,0,0)
                              setDateTo(ndate as Date)
                           }}
                           format="dd/MM/yyyy"
                        />
                     </Grid>
                     <Grid item xs={3}>
                        <Button variant="contained" color="primary" onClick={searchSalesDate}>Buscar por fecha</Button>
                     </Grid>
                     <Grid item xs={3}>
                        <PDFDownloadLink 
                        document={<MyDocumentViewer info={pdfInfo} />} 
                        fileName="somename.pdf"
                        style={{color: 'white', textDecoration: 'none'}}>
                           {({ blob, url, loading, error }) => (loading ? 
                           <Button variant="contained" color="primary" >Cargando documento...</Button> 
                           : <Button variant="contained" color="primary" >Generar Reporte</Button>)}
                        </PDFDownloadLink>
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
               <Card className={classes.root} style={{ marginBottom: '8px' }}>
                  <CardContent>
                     <Typography variant="h6">Ingresos:</Typography>
                     <Typography variant="subtitle1" align="center">S/ {revenueSales} (+{taxSales} de impuestos)</Typography>
                  </CardContent>
               </Card>
               <Card className={classes.root}>
                  <CardContent>
                     <Typography variant="h6">Código de la Venta: {orderData.orderCode}</Typography>
                     <Typography variant="subtitle2">Vendedor: {orderData.orderUser}</Typography>
                     <Typography variant="subtitle2">Metodo de Pago: {orderData.orderWay}</Typography>
                     <Typography variant="subtitle2">Descuento: {orderData.orderDiscount}</Typography>
                     <Typography variant="subtitle2" style={{ marginBottom: '8px' }}>Estado: {orderData.orderState}</Typography>
                     <Divider />
                     <Typography variant="h6" style={{ marginTop: '8px' }}>Lista de Productos:</Typography>
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

//-----------------------------------------------------------------------------------------------------------------------------------------------
const styles = StyleSheet.create({
   page: {
      padding: 60,
      backgroundColor: '#E4E4E4'
   },
   pageSection: {
      flexDirection: "row"
   },
   section: {
      margin: 5,
      padding: 5,
   },
   tableStyle: {
      display: "table",
      width: "auto"
   },
   tableRowStyle: {
      flexDirection: "row"
   },
   firstTableColHeaderStyle: {
      width: "20%",
      borderStyle: "solid",
      borderColor: "#000",
      borderBottomColor: "#000",
      borderWidth: 1,
      backgroundColor: "#bdbdbd"
   },
   tableColHeaderStyle: {
      width: "20%",
      borderStyle: "solid",
      borderColor: "#000",
      borderBottomColor: "#000",
      borderWidth: 1,
      borderLeftWidth: 0,
      backgroundColor: "#bdbdbd"
   },
   firstTableColStyle: {
      width: "20%",
      borderStyle: "solid",
      borderColor: "#000",
      borderWidth: 1,
      borderTopWidth: 0
   },
   tableColStyle: {
      width: "20%",
      borderStyle: "solid",
      borderColor: "#000",
      borderWidth: 1,
      borderLeftWidth: 0,
      borderTopWidth: 0
   },
   tableCellHeaderStyle: {
      textAlign: "center",
      margin: 4,
      fontSize: 12,
      fontWeight: "bold"
   },
   tableCellStyle: {
      textAlign: "center",
      margin: 5,
      fontSize: 10
   }
});

const MyDocumentViewer = (props: { info: any }) => {
   return useMemo(() => (
      <Document >
         <Page size="A4" style={styles.page} orientation="portrait">
            <View style={styles.section}>
               <Text>Reporte de: Fecha a Fecha</Text>
            </View>
            <View style={styles.pageSection} >
               <View style={styles.section}>
                  <Text>Productos Vendidos: </Text>
               </View>
               <View style={styles.section}>
                  <Text>Ingresos Totales: {props.info.revenue}</Text>
               </View>
            </View>
            <View style={styles.tableStyle}>
               {createTableHeader()}
               {createTableRow()}
               {createTableRow()}
               {createTableRow()}
               {createTableRow()}
               {createTableRow()}
            </View>
         </Page>
      </Document>
   ), [props])
};
/*React.memo(function MyComponent (props) {
   return !LOADING
 })*/

const createTableHeader = () => {
   return (
      <View style={styles.tableRowStyle} fixed>

         <View style={styles.firstTableColHeaderStyle}>
            <Text style={styles.tableCellHeaderStyle}>Producto</Text>
         </View>

         <View style={styles.tableColHeaderStyle}>
            <Text style={styles.tableCellHeaderStyle}>Cantidad</Text>
         </View>

         <View style={styles.tableColHeaderStyle}>
            <Text style={styles.tableCellHeaderStyle}>Precio</Text>
         </View>

         <View style={styles.tableColHeaderStyle}>
            <Text style={styles.tableCellHeaderStyle}>Pago</Text>
         </View>

         <View style={styles.tableColHeaderStyle}>
            <Text style={styles.tableCellHeaderStyle}>Fecha</Text>
         </View>
      </View>
   );
};

const createTableRow = () => {
   return (
      <View style={styles.tableRowStyle}>

         <View style={styles.firstTableColStyle}>
            <Text style={styles.tableCellStyle}>Element</Text>
         </View>

         <View style={styles.tableColStyle}>
            <Text style={styles.tableCellStyle}>Element</Text>
         </View>

         <View style={styles.tableColStyle}>
            <Text style={styles.tableCellStyle}>Element</Text>
         </View>

         <View style={styles.tableColStyle}>
            <Text style={styles.tableCellStyle}>Element</Text>
         </View>

         <View style={styles.tableColStyle}>
            <Text style={styles.tableCellStyle}>Element</Text>
         </View>

      </View>
   );
};

export default SaleReports
