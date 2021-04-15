import React, { useState, useEffect, useContext } from 'react'
import { useParams, useHistory } from 'react-router-dom'

import {
   Box, Grid, Card, CardContent, Button,
   TextField, Table, TableBody, TableCell, TableContainer,
   TableHead, TableRow, Typography, Divider, FormControl,
   FormControlLabel, RadioGroup, Radio, FormLabel
} from '@material-ui/core'
import AlertSmall from '../../components/Alert/AlertSmall'
import AlertBig from '../../components/Alert/AlertBig'
import { Delete } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { AuthContext } from '../../../services/AuthContext'

const { ipcRenderer } = window.require('electron')

const fillDecimals = (number: number) => {
   function pad(input: any, length: any, padding: any): any {
      let str = input + '';
      return (length <= str.length) ? str : pad(str + padding, length, padding);
   }
   let str = number + '';
   let dot = str.lastIndexOf('.');
   let isDecimal = dot !== -1;
   let integer = isDecimal ? str.substr(0, dot) : str;
   let decimals = isDecimal ? str.substr(dot + 1) : '';
   decimals = pad(decimals, 2, 0);
   return integer + '.' + decimals;
}

const round2Decimals = (num: any) => {
   return Math.round((num + Number.EPSILON) * 100) / 100
}

interface OrdersData {
   idProduct: any,
   idSale: any,
   quantityOrder: any,
   nameProduct: any,
   priceSellProduct: any,
   lmquantityOrder: any,
}

let saleRefund: any = {}

let ordersFromDB: OrdersData[] = []

const useStyles = makeStyles({
   center: {
      textAlign: 'center'
   },
   autocominput: {
      paddingBottom: '0px',
      paddingTop: '0px',
      paddingLeft: '0px'
   },
   inputRoot: {
      '&[class*="MuiOutlinedInput-root"]': {
         padding: '0px'
      }
   },
   tfInputmargin: {
      padding: '9px 9px 9px 9px'
   },
   tflabel: {
      transform: 'translate(10px, 12px) scale(1)'
   },
   fclabel: {
      fontSize: '0.85rem'
   },
   nomargin: {
      margin: 0
   },
   rootbutton: {
      minWidth: 'auto',
      padding: '6px 8px 6px 8px'
   },
   paper: {
      maxWidth: 330,
      margin: 'auto',
      padding: 'auto',
   },
   input: {},
})

const RefundPage = () => {
   let history = useHistory()
   const classes = useStyles()
   const { user, caja, setCaja } = useContext(AuthContext)

   const { idSale } = useParams<{ idSale: string }>();
   const [saleDB, setSaleDB] = useState(saleRefund)
   const [ordersDB, setOrdersDB] = useState(ordersFromDB)

   const [change, setChange] = useState(fillDecimals(0))
   //const [cashPayment, setCashPayment] = useState(0)
   const [clientName, setClientName] = useState('')

   const [subTotal, setSubTotal] = useState(fillDecimals(0))
   const [total, setTotal] = useState(fillDecimals(0))
   const [igv, setIgv] = useState(fillDecimals(0))

   const [saleVoucher, setSaleVoucher] = useState('ticket')
   const [saleWayToPay, setSaleWayToPay] = useState('efectivo')

   const [show, setShow] = useState(false)
   // eslint-disable-next-line react-hooks/exhaustive-deps
   useEffect(() => {
      searchSaleId()
   }, [])

   useEffect(() => {
      if (ordersDB.length > 0) {
         let sum = 0
         let aux = 0
         for (let i = 0; i < ordersDB.length; i++) {
            sum = sum + (ordersDB[i].quantityOrder * ordersDB[i].priceSellProduct)
            aux = aux + (ordersDB[i].lmquantityOrder * ordersDB[i].priceSellProduct)
         }
         updateTotalIgv(sum)
         setChange(fillDecimals(round2Decimals(aux - sum)))
      }
   }, [ordersDB])

   const updateTotalIgv = (sum: any) => {
      let igvCalc = 0
      let subTotalNum = Number(sum)
      setSubTotal(fillDecimals(round2Decimals(sum)))
      if (saleVoucher === 'factura') {
         igvCalc = round2Decimals(subTotalNum * 0.18)
         setIgv(fillDecimals(igvCalc))
      } else {
         setIgv(fillDecimals(igvCalc))
      }
      let totalFinal = round2Decimals(subTotalNum - igvCalc)
      setTotal(fillDecimals(totalFinal))
   }

   const handleQuantityProduct = (event: any, index: any) => {
      let newOrderData = ordersDB.slice()
      let data = newOrderData[index]

      if (event.target.value !== '') {
         if (event.target.value > data.lmquantityOrder) {
            AlertSmall('info', 'No se puede agregar mas, ¡Limite de stock!')
            event.target.value = data.lmquantityOrder
         } else if (event.target.value < 0) {
            event.target.value = 0
         } else {
            data.quantityOrder = Number(event.target.value)

            newOrderData[index] = data
            setOrdersDB(newOrderData)
         }
      }
   }

   const searchSaleId = () => {
      const prepareData = {
         Entry: { value: idSale },
         spName: 'spSearchSaleId'
      }
      ipcRenderer.invoke('searchsaleid', prepareData)
         .then((sales: any) => {
            if (sales[0]) {
               setSaleDB(sales[0])
               searchOrders(sales[0].idSale)
               setSubTotal(fillDecimals(sales[0].subtotalSale))
               setTotal(fillDecimals(sales[0].subtotalSale + sales[0].taxSale))
               setIgv(fillDecimals(sales[0].taxSale))
               setClientName(sales[0].nameclientSale)
               setSaleVoucher(sales[0].voucherSale)
               setSaleWayToPay(sales[0].waytopaySale)
               
               //setCashPayment(sales[0].cashSale)
               return
            }
            AlertSmall('error', 'No se encuentra la venta')
            history.push('/')
         })
   }

   const updateNewIdSale = (newId: any) => {
      const prepareData = {
         Idsale: { value: idSale },
         Idnewsale: { value: newId },
         spName: 'spUpdateNewIdSale'
      }
      ipcRenderer.invoke('updatenewidsale', prepareData)
         .then((message:any) => {
            console.log('se logró subir')
            console.log(message)
         })
   }

   const checkLastShift = () => {
      const prepareData = {
         spName: 'spCheckLastShift'
      }
      ipcRenderer.invoke('checklastshift', prepareData)
         .then((shift: any) => {
            if (shift[0].endShift) {
               AlertSmall('error', 'Inicie turno antes de realizar una venta')
            } else {
               createRefund(shift[0].idShift)
            }
         })
   }

   const createRefund = (idShift: any) => {
      let daten = new Date()
      daten.setUTCHours(daten.getUTCHours() - 5)
      let qproductval = 0
      for (let i = 0; i < ordersDB.length; i++) {
         qproductval = qproductval + ordersDB[i].quantityOrder
      }
      const prepareData = {
         Iduser: { value: user.idUser },
         Nameclient: { value: clientName },
         Voucher: { value: saleVoucher },
         Date: { value: daten },
         Qproduct: { value: qproductval },
         Cash: { value: 0 },
         Tax: { value: Number(igv) },
         Subtotal: { value: Number(total) },
         Change: { value: Number(change) },
         Waytopay: { value: saleWayToPay },
         spName: 'spCreateSale'
      }
      ipcRenderer.invoke('createsale', prepareData)
         .then((scope: any) => {
            for (let i = 0; i < ordersDB.length; i++) {
               const idproduct = ordersDB[i].idProduct
               const quantity = ordersDB[i].quantityOrder
               const sumStock = ordersDB[i].lmquantityOrder - quantity
               createOrder(idproduct, scope[0].scopeIdentity, quantity)
               searchProduct(ordersDB[i].nameProduct, sumStock, daten)
            }
            updateNewIdSale(scope[0].scopeIdentity)
            registerActivity(idShift, scope[0].scopeIdentity)
            AlertSmall('success', 'Devolucion registrada correctamente.')
            history.push('/dashboard')
         })
   }

   const registerActivity = (idshift: any, idmov: any) => {
      let res = round2Decimals(caja - Number(change))
      console.log(res)
      const prepareData = {
         Idshift: { value: idshift },
         Iduser: { value: user.idUser },
         Name: { value: 'Devolucion' },
         Amount: { value: Number(change) },
         Operator: { value: '-' },
         Result: { value: res },
         Idmovement: { value: idmov },
         spName: 'spInsertActivity'
      }
      ipcRenderer.invoke('insertactivity', prepareData)
         .then((msg: any) => {
            console.log(msg + 'Actividad creada de Devolucion')
            setCaja(res)
         })
   }

   const searchProduct = (name: any, quantity: any, daten: any) => {
      const prepareData = {
         Entry: {
            value: name
         },
         spName: 'spSearchExactProduct'
      }
      ipcRenderer.invoke('searchexactproduct', prepareData)
         .then((product: any) => {
            let newStock = product[0].stockProduct + quantity
            if (newStock) {
               product.stateProduct = true
            } else {
               product.stateProduct = false
            }
            const prepareData = {
               IdCategory: { value: product[0].idCategory },
               Barcode: { value: product[0].barcodeProduct },
               NameProduct: { value: product[0].nameProduct },
               StockProduct: { value: newStock },
               PriceSellProduct: { value: product[0].priceSellProduct },
               PriceBuyProduct: { value: product[0].priceBuyProduct },
               DateProduct: { value: daten },
               DescriptionProduct: { value: product[0].descriptionProduct },
               StateProduct: { value: product[0].stateProduct },
               IdProduct: { value: product[0].idProduct },
               spName: 'spUpdateProduct'
            }
            ipcRenderer.invoke('updateproductid', prepareData)
               .then(() => {
                  console.log('si se subio')
               }).catch((err: any) => AlertSmall('error', `Ha ocurrido un error, ${err}`))
         })
   }

   const createOrder = (idPro: any, idSal: any, quantity: any) => {
      const prepareData = {
         Idproduct: { value: idPro },
         Idsale: { value: idSal },
         Quantity: { value: quantity },
         spName: 'spCreateOrder'
      }
      ipcRenderer.invoke('createorder', prepareData)
         .then(() => {
            //console.log(message + 'createOrder(): Producto de orden creada.')
         })
   }

   const searchOrders = (idsale: any) => {
      const prepareData = {
         Entry: { value: idsale },
         spName: 'spListOrders'
      }
      ipcRenderer.invoke('getorders', prepareData)
         .then((orders: any) => {
            for (let i = 0; i < orders.length; i++) {
               orders[i].lmquantityOrder = orders[i].quantityOrder
            }
            setOrdersDB(orders)
            setShow(true)
            console.log(orders)
         })
   }

   return (
      <>{show ? 
         <Grid container spacing={2}>
            <Grid item xs={8}>
               <Card style={{ marginBottom: "8px" }}>
                  <CardContent>
                     <Grid container spacing={1}>
                        <Grid item xs={12}>
                           <TextField 
                              placeholder="Id de la venta de devolución"
                              value={saleDB.idSale}
                              variant="outlined"
                           />
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
                                 <TableCell align="center">Item</TableCell>
                                 <TableCell align="center">Cantidad</TableCell>
                                 <TableCell align="center">Producto</TableCell>
                                 <TableCell align="center">Precio Unidad</TableCell>
                                 <TableCell align="center">Precio Venta</TableCell>
                              </TableRow>
                           </TableHead>
                           <TableBody>
                              {ordersDB.map((p, index) => (
                                 <TableRow key={index}>
                                    <TableCell align="center">{index + 1}</TableCell>
                                    <TableCell align="center">
                                       <TextField
                                          value={p.quantityOrder}
                                          type="number"
                                          InputProps={{ inputProps: { min: 0, max: p.lmquantityOrder } }}
                                          onChange={(e) => handleQuantityProduct(e, index)}
                                          onFocus={event => event.target.select()}
                                       />
                                    </TableCell>
                                    <TableCell align="center">{p.nameProduct}</TableCell>
                                    <TableCell align="center">{p.priceSellProduct}</TableCell>
                                    <TableCell align="center">{round2Decimals(Number(p.quantityOrder) * Number(p.priceSellProduct))}</TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     </TableContainer>
                  </CardContent>
               </Card>
            </Grid>

            <Grid item xs={4}>
               <Box bgcolor="#EF4D4E" color="white" py={4} px={3} textAlign="center">
                  <Typography variant="h4">
                     S/. {subTotal}
                  </Typography>
               </Box>

               <Box border={1} py={3} px={3}>
                  <TextField
                     fullWidth
                     InputProps={{ classes: { input: classes.tfInputmargin } }}
                     InputLabelProps={{ classes: { outlined: classes.tflabel } }}
                     variant="outlined"
                     label="Nombre del Cliente"
                     value={clientName}
                     disabled
                     style={{ marginBottom: '8px' }}
                  />

                  <FormControl>
                     <FormLabel style={{ color: 'black' }}>Tipo de Voucher</FormLabel>
                     <RadioGroup row aria-label="voucher" value={saleVoucher}>
                        <FormControlLabel value="ticket" control={<Radio size="small" disabled/>} label="Ticket" classes={{ label: classes.fclabel }} />
                        <FormControlLabel value="boleta" control={<Radio size="small" disabled/>} label="Boleta" classes={{ label: classes.fclabel }} />
                        <FormControlLabel value="factura" control={<Radio size="small" disabled/>} label="Factura" classes={{ label: classes.fclabel }} />
                     </RadioGroup>
                  </FormControl>

                  <Divider style={{ marginBottom: '8px' }} />
                  <FormControl>
                     <FormLabel style={{ color: 'black' }}>Método de Pago</FormLabel>
                     <RadioGroup row aria-label="waytopay" value={saleWayToPay}>
                        <FormControlLabel value="efectivo" control={<Radio size="small" disabled />} label="Efectivo" classes={{ label: classes.fclabel }} />
                        <FormControlLabel value="visa" control={<Radio size="small" disabled />} label="Visa" classes={{ label: classes.fclabel }} />
                        <FormControlLabel value="mastercard" control={<Radio size="small" disabled />} label="MasterCard" classes={{ label: classes.fclabel }} />
                        <FormControlLabel value="yape" control={<Radio size="small" disabled />} label="Yape" classes={{ label: classes.fclabel }} />
                     </RadioGroup>
                  </FormControl>

                  <Divider style={{ marginBottom: '8px' }} />

                  <Grid container spacing={0} style={{ marginBottom: '8px' }}>
                     <Grid item xs={6}>
                        <TextField
                           fullWidth
                           InputProps={{ classes: { input: classes.tfInputmargin } }}
                           InputLabelProps={{ classes: { outlined: classes.tflabel } }}
                           variant="outlined"
                           label="Monto del Pago"
                           type="number"
                           value={0}
                           disabled
                           style={{ marginRight: '4px' }}
                        />
                     </Grid>
                     <Grid container item xs={6}>
                        <Grid item xs={5} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <Typography variant="body2" style={{ fontSize: '0.8rem' }}> CAMBIO: </Typography>
                        </Grid>
                        <Grid item xs={7} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <Typography variant="body2" className={classes.center}> S/. {change} </Typography>
                        </Grid>
                     </Grid>
                  </Grid>

                  <Divider style={{ marginBottom: '8px' }} />
                  <Grid container spacing={0}>
                     <Grid container item xs={12}>
                        <Grid item xs={6}>
                           <Typography variant="body2"> SUB TOTAL </Typography>
                        </Grid>
                        <Grid item xs={6}>
                           <Typography variant="body2" className={classes.center}>S/. {total}</Typography>
                        </Grid>
                     </Grid>

                     <Grid container item xs={12}>
                        <Grid item xs={6}>
                           <Typography variant="body2"> I.G.V (18%) </Typography>
                        </Grid>
                        <Grid item xs={6}>
                           <Typography variant="body2" className={classes.center}> S/. {igv} </Typography>
                        </Grid>
                     </Grid>

                     <Grid container item xs={12}>
                        <Grid item xs={6}>
                           <Typography variant="body2"> TOTAL </Typography>
                        </Grid>
                        <Grid item xs={6}>
                           <Typography variant="body2" className={classes.center}> S/. {subTotal} </Typography>
                        </Grid>
                     </Grid>
                     <Button fullWidth variant="contained" color="primary" onClick={checkLastShift} style={{ marginTop: '8px' }}>Registrar Devolución</Button>
                  </Grid>
               </Box>
            </Grid>
            </Grid>
      : ''}

         {/* <Button fullWidth variant="contained" color="primary" onClick={changeShow} style={{ marginTop: '8px' }}>Preparar comprobante de pago</Button>
            <Button fullWidth variant="contained" color="primary" onClick={createSale} style={{ marginTop: '8px' }}>Registrar Venta</Button> */}
      </>
   )
}

export default RefundPage
