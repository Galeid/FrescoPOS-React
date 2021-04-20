import React, { useState, useEffect, useContext, useMemo } from 'react'
import {
   Grid, Card, CardContent, Button, Table,
   TableBody, TableCell, TableContainer, TableHead, TableRow,
   Typography, Divider, TextField, TablePagination, Tooltip
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { PDFDownloadLink, Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { AuthContext } from '../../../services/AuthContext'
import Search from '@material-ui/icons/Search';
import AlertSmall from '../../components/Alert/AlertSmall'
import RedoIcon from '@material-ui/icons/Redo';

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
   orderTax: '-',
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

const getTodayDate = () => {
   let event = new Date()
   return event.toString().slice(4, 24)
}

const SaleReports = () => {
   let history = useHistory()

   const classes = useStyles()
   const { user } = useContext(AuthContext)
   const [page, setPage] = useState(0);
   const [rowsPerPage, setRowsPerPage] = React.useState(5);
   const [inputSaleId, setInputSaleId] = useState('')
   const [salesDB, setSalesDB] = useState(salesFromDB)
   const [orderDB, setOrderDB] = useState(orderFromDB)
   const [orderData, setOrderData] = useState(orderDataOrigin)
   const [dateFrom, setDateFrom] = useState(new Date(new Date().setHours(0,0,0,0)))
   const [dateTo, setDateTo] = useState(new Date(new Date().setHours(0,0,0,0)))
   const [revenueSales, setRevenueSales] = useState(0)
   const [taxSales, setTaxSales] = useState(0)
   const [isReadyPdf, setIsReadyPdf] = useState(false)
   const [pdfInfo, setPdfInfo] = useState({
      tax: taxSales,
      revenue: revenueSales,
      sales: salesDB,        
      dateFrom: convertDateString(dateFrom),
      dateTo: convertDateString(dateTo),
      user: user.nameUser,
      detailed: false,
      quantityProducts: 0
   })

   useEffect(() => {
      getSales()
      // eslint-disable-next-line
   }, [])

   useEffect(() => {
      //console.log(pdfInfo)
      let size = Object.keys(pdfInfo.sales).length
      if(size > 0 ) console.log('Informacion recibida')
      // eslint-disable-next-line
      else if( inputSaleId.length == 0) console.log('Esperando para busqueda')
      else AlertSmall('info', 'No se han encontrado resultados para tu búsqueda.')
      // eslint-disable-next-line
   }, [pdfInfo])
   
   const setSalesTableData = (salese: any, tos: string) => {
      let sales = []
      let salesSta = []
      for (let i = 0; i < salese.length; i++) {
         if (salese[i].stateSale) {
            salesSta.push(salese[i])
         }
      }
      if ( user.idRole === 1) {
         sales = salese.slice()
      } else {
         sales = salesSta.slice()
      }
      let newNum = 0
      let newTax = 0
      let qp = 0
      for (let i = 0; i < sales.length; i++) {
         if (sales[i].stateSale) {
            newNum = newNum + sales[i].subtotalSale;
            newTax = newTax + sales[i].taxSale;
            qp = qp + sales[i].qproductsSale;
         }
      }
      setRevenueSales(round2Decimals(newNum))
      setTaxSales(round2Decimals(newTax))
      setSalesDB(sales)
      // eslint-disable-next-line


      if (tos === 'all') {
         setPdfInfo({ ...pdfInfo,
            revenue: newNum,
            tax: newTax,
            sales: salesSta,
            dateFrom: 'el inicio',
            dateTo: 'el final',
            quantityProducts: qp,
         })
      // eslint-disable-next-line
      }else if (tos === 'date') {
         setPdfInfo({ ...pdfInfo,
            revenue: newNum,
            tax: newTax,
            sales: salesSta,
            dateFrom: convertDateString(dateFrom),
            dateTo: convertDateString(dateTo),
            quantityProducts: qp,
         })
      // eslint-disable-next-line
      }else if (tos == 'id') {
         setPdfInfo({ ...pdfInfo,
            revenue: newNum,
            tax: newTax,
            sales: salesSta,
            dateFrom: 'el inicio',
            dateTo: 'el final',
            quantityProducts: qp,
         })
      }
   }

   const inputChangeId = (e:any) => {
      setInputSaleId(e.target.value)
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
               orderTax: s.taxSale + ''
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
            setSalesTableData(sales, 'date')
            resetOrders()
         })
   }

   const searchSaleId = () => {
      if (inputSaleId === '') {
         getSales()
         AlertSmall('info','Ingrese por favor un id')
         return
      }
      const prepareData = {
         Entry: { value: inputSaleId },
         spName: 'spSearchSaleId'
      }
      ipcRenderer.invoke('searchsaleid', prepareData)
         .then((sales: any) => {
            setSalesTableData(sales, 'id')
            resetOrders()
         })
   }
   const handleChangePage = (e : any, newPage : number) => {
      setPage(newPage);
   };

   const handleChangeRowsPerPage = (e : any) => {
      setRowsPerPage(parseInt(e.target.value, 10));
      setPage(0);
   };

   const goRefund = ( id: any ) => {
      history.push(`/refund/${id}`)
   }

   return (
      <>
         <Card className={classes.root}>
            <CardContent>
               <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <Grid container spacing={4} alignContent="center" alignItems="center">
                     <Grid item xs={3}>
                        <Button fullWidth variant="contained" color="primary" onClick={getSales} style={{marginBottom:'8px'}}>Todas las Ventas</Button>
                        <Button fullWidth variant="contained" color="primary" onClick={searchSalesDate}>Buscar por fecha</Button>
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
                        {isReadyPdf ?
                           <PDFDownloadLink 
                           key={Math.random()}
                           document={<MyDocumentViewer info={pdfInfo} />} 
                           fileName={getTodayDate() + " reporte ventas.pdf"}
                           style={{color: 'white', textDecoration: 'none'}}>
                              {({ blob, url, loading, error }) => (loading ? 
                              <Button fullWidth variant="contained" color="secondary" style={{marginBottom:'8px'}}>Cargando documento...</Button> 
                              : <Button fullWidth variant="contained" color="secondary" onClick={() => setIsReadyPdf(!isReadyPdf)} style={{marginBottom:'8px'}}>Generar PDF</Button>)}
                           </PDFDownloadLink>
                           :
                           <Button fullWidth variant="contained" color="secondary" onClick={() => setIsReadyPdf(!isReadyPdf)} style={{marginBottom:'8px'}}>Preparar PDF</Button> 
                        }
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
                                 <TableCell align="center">Prod.</TableCell>
                                 <TableCell align="center">Voucher</TableCell>
                                 <TableCell align="center">Total</TableCell>
                                 <TableCell align="center">Fecha</TableCell>
                                 <TableCell align="center">Opc.</TableCell>
                              </TableRow>
                           </TableHead>
                           <TableBody>
                              {salesDB
                              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                              .map((s, index) => (
                                 <TableRow hover key={index} onClick={() => getOrder(s)}>
                                    <TableCell align="center">{s.idSale}</TableCell>
                                    <TableCell align="center">{s.nameclientSale}</TableCell>
                                    <TableCell align="center">{s.qproductsSale}</TableCell>
                                    <TableCell align="center">{s.voucherSale}</TableCell>
                                    <TableCell align="center">S/ {s.subtotalSale}</TableCell>
                                    <TableCell align="center">{convertDateString(s.dateSale)}</TableCell>
                                    <TableCell align="center">
                                       <Tooltip title="Devoluciones">
                                          <Button variant="contained" classes={{startIcon: classes.nomargin, root: classes.rootbutton}} color="primary" onClick={()=> goRefund(s.idSale)}><RedoIcon /></Button>
                                       </Tooltip>
                                    </TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     </TableContainer>
                     <TablePagination
                        rowsPerPageOptions={[5, 10, 25, salesDB.length]}
                        component="div"
                        count={salesDB.length}
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
            <Grid item xs={4}>
               <Card className={classes.root} style={{ marginBottom: '8px' }}>
                  <CardContent>
                     <Typography variant="h6">Ingresos:</Typography>
                     <Typography variant="subtitle1" align="center">S/ {revenueSales} (+{taxSales} de impuestos)</Typography>
                  </CardContent>
               </Card>
               <Card className={classes.root} style={{ marginBottom: '8px' }}>
                  <CardContent>
                  <Grid container spacing={1}>
                        <Grid item xs={10}>
                           <TextField 
                              fullWidth
                              InputProps={{ classes: { input: classes.tfInputmargin } }}
                              InputLabelProps={{ classes: { outlined: classes.tflabel } }}
                              type="number"
                              variant="outlined"
                              placeholder="Ingrese un ID"
                              value={inputSaleId}
                              onChange={inputChangeId}
                              style={{ marginRight: '4px'}}
                           />
                        </Grid>
                        <Grid item xs={2}>
                           <Button fullWidth variant="contained" classes={{startIcon: classes.nomargin, root: classes.rootbutton}} color="primary" onClick={searchSaleId}><Search /></Button>
                        </Grid>
                     </Grid>
                  </CardContent>
               </Card>
               <Card className={classes.root}>
                  <CardContent>
                     <Typography variant="h6">Código de la Venta: {orderData.orderCode}</Typography>
                     <Divider />
                     <Typography variant="subtitle2">Vendedor: {orderData.orderUser}</Typography>
                     <Typography variant="subtitle2">Metodo de Pago: {orderData.orderWay}</Typography>
                     <Typography variant="subtitle2">Impuestos: S/ {orderData.orderTax}</Typography>
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
      padding: 30,
      backgroundColor: '#E4E4E4'
   },
   pageSection: {
      flexDirection: "row"
   },
   tableSection: {
      width: "536px"
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
      width: "58.58px", //26.78px
      borderStyle: "solid",
      borderColor: "#000",
      borderBottomColor: "#000",
      borderWidth: 1,
      backgroundColor: "#bdbdbd"
   },
   tableColHeaderStyle: {
      width: "58.58px",
      borderStyle: "solid",
      borderColor: "#000",
      borderBottomColor: "#000",
      borderWidth: 1,
      borderLeftWidth: 0,
      backgroundColor: "#bdbdbd"
   },
   firstTableColStyle: {
      width: "58.58px", //26.78px
      borderStyle: "solid",
      borderColor: "#000",
      borderWidth: 1,
      borderTopWidth: 0
   },
   tableColStyle: {
      width: "58.58px",
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
   
   // const [arrSales, setArrSales] = useState(salesFromDB)
   // useEffect(() => {
   //    const newArrSales = props.info.sales.slice()
   //    console.log(newArrSales)
   //    setArrSales(newArrSales)
   // }, [])

   return useMemo(() => (
      <Document>
         <Page size="A4" style={styles.page} orientation="portrait">
         <View style={styles.section}>
               <Text>Generado por {props.info.user}</Text>
            </View>
            <View style={styles.section}>
               <Text>Reporte desde {props.info.dateFrom} hasta {props.info.dateTo} </Text>
            </View>
            <View style={styles.pageSection} >
               <View style={styles.section}>
                  <Text>Productos Vendidos: {props.info.quantityProducts}</Text>
               </View>
               <View style={styles.section}>
                  <Text>Ingresos Totales: {props.info.revenue} S/.</Text>
               </View>
            </View>
            <View style={styles.tableSection} >
               <View style={styles.tableStyle}>
                  {createTableHeader()}
                  {props.info.sales.map((s:any, index:any)=> createTableRow(s, index) )}
               </View>
            </View>
         </Page>
      </Document>
   ), [props])
};

const createTableHeader = () => {
   return (
      <View style={styles.tableRowStyle} fixed>

         <View style={styles.firstTableColHeaderStyle}>
            <Text style={styles.tableCellHeaderStyle}>Id</Text>
         </View>

         <View style={styles.tableColHeaderStyle}>
            <Text style={styles.tableCellHeaderStyle}>Cliente</Text>
         </View>

         <View style={styles.tableColHeaderStyle}>
            <Text style={styles.tableCellHeaderStyle}>Vendedor</Text>
         </View>

         <View style={styles.tableColHeaderStyle}>
            <Text style={styles.tableCellHeaderStyle}>N° Prod.</Text>
         </View>

         <View style={styles.tableColHeaderStyle}>
            <Text style={styles.tableCellHeaderStyle}>Tipo de Doc.</Text>
         </View>

         <View style={styles.tableColHeaderStyle}>
            <Text style={styles.tableCellHeaderStyle}>Total</Text>
         </View>

         <View style={styles.tableColHeaderStyle}>
            <Text style={styles.tableCellHeaderStyle}>I.G.V</Text>
         </View>

         <View style={styles.tableColHeaderStyle}>
            <Text style={styles.tableCellHeaderStyle}>Fecha</Text>
         </View>

         <View style={styles.tableColHeaderStyle}>
            <Text style={styles.tableCellHeaderStyle}>Pago</Text>
         </View>
      </View>
   );
};

const createTableRow = (s: any, index: number ) => {
   return (
      <View style={styles.tableRowStyle} key={index}>

         <View style={styles.firstTableColStyle}>
            <Text style={styles.tableCellStyle}>{s.idSale}</Text>
         </View>
         
         <View style={styles.tableColStyle}>
            <Text style={styles.tableCellStyle}>{s.nameclientSale}</Text>
         </View>

         <View style={styles.tableColStyle}>
            <Text style={styles.tableCellStyle}>{s.nameUser}</Text>
         </View>

         <View style={styles.tableColStyle}>
            <Text style={styles.tableCellStyle}>{s.qproductsSale}</Text>
         </View>

         <View style={styles.tableColStyle}>
            <Text style={styles.tableCellStyle}>{s.voucherSale}</Text>
         </View>

         <View style={styles.tableColStyle}>
            <Text style={styles.tableCellStyle}>{s.subtotalSale}</Text>
         </View>

         <View style={styles.tableColStyle}>
            <Text style={styles.tableCellStyle}>{s.taxSale}</Text>
         </View>

         <View style={styles.tableColStyle}>
            <Text style={styles.tableCellStyle}>{convertDateString(s.dateSale)}</Text>
         </View>

         <View style={styles.tableColStyle}>
            <Text style={styles.tableCellStyle}>{s.waytopaySale}</Text>
         </View>
      </View>
   );
};

export default SaleReports
