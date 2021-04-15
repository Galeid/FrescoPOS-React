import React, { useState, useEffect, useContext } from 'react'
import { useReactToPrint } from 'react-to-print';
import {
   Box, Grid, Card, CardContent, Button,
   TextField, Table, TableBody, TableCell, TableContainer,
   TableHead, TableRow, Typography, Divider, FormControl,
   FormControlLabel, Container, RadioGroup, Radio, FormLabel
} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'

import { makeStyles } from '@material-ui/core/styles';
import { AuthContext } from '../../../services/AuthContext'
import { Delete } from '@material-ui/icons';
import AlertSmall from '../../components/Alert/AlertSmall'
import AlertBig from '../../components/Alert/AlertBig'

const { ipcRenderer } = window.require('electron')

interface Product {
   idProduct: any,
   barcodeProduct: any,
   nameProduct: any,
   stockProduct: any,
   priceSellProduct: any,
   priceBuyProduct: any,
   dateProduct: any,
   descriptionProduct: any,
   stateProduct: any
}

interface SaleData {
   stockProduct: any,
   quantityProduct: any,
   nameProduct: any,
   priceSellProduct: any,
   amountProduct: any
}
let productsFromDB: Product[] = []
let saledataFromDB: SaleData[] = []
let searchoptionsFromDB: any[] = []

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

const isNumeric = (str: any) => {
   if (typeof str != "string") return false
   return !isNaN(parseInt(str)) &&
      !isNaN(parseFloat(str))
}

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

const SalePage = () => {
   let registro: Date = new Date();
   const classes = useStyles()
   const { user, caja, setCaja } = useContext(AuthContext)

   const [change, setChange] = useState(fillDecimals(0))
   const [cashPayment, setCashPayment] = useState(0)
   const [clientName, setClientName] = useState('')
   const [showTicket, setShowTicket] = useState(true)

   const [subTotal, setSubTotal] = useState(fillDecimals(0))
   const [total, setTotal] = useState(fillDecimals(0))
   const [igv, setIgv] = useState(fillDecimals(0))

   const [searchValue, setSearchValue] = useState('')
   const [searchOptions, setSearchOptions] = useState(searchoptionsFromDB)
   const [searchReason, setSearchReason] = useState('')

   const [saleProducts, setSaleProducts] = useState(productsFromDB)
   const [saleData, setSaleData] = useState(saledataFromDB)
   const [saleVoucher, setSaleVoucher] = useState('ticket')
   const [saleWayToPay, setSaleWayToPay] = useState('efectivo')

   useEffect(() => {
      if (searchValue.length >= 3) {
         searchProducts(searchValue)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [searchValue])

   useEffect(() => {
      if (saleProducts.length === saleData.length) {
         return
      }
      if (saleProducts.length > 0) {
         let newData = {
            stockProduct: saleProducts[saleProducts.length - 1].stockProduct,
            quantityProduct: 1,
            nameProduct: saleProducts[saleProducts.length - 1].nameProduct,
            priceSellProduct: round2Decimals(saleProducts[saleProducts.length - 1].priceSellProduct),
            amountProduct: round2Decimals(saleProducts[saleProducts.length - 1].priceSellProduct),
         }
         let aux = [...saleData, newData]
         setSaleData(aux)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [saleProducts])

   useEffect(() => {
      let sum = 0
      for (let i = 0; i < saleData.length; i++) {
         sum = sum + saleData[i].amountProduct
      }
      setSubTotal(fillDecimals(round2Decimals(sum)))
   }, [saleData])

   useEffect(() => {
      updateTotalIgv()
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [subTotal])

   useEffect(() => {
      updateChange()
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [total])

   useEffect(() => {
      updateTotalIgv()
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [saleVoucher])

   useEffect(() => {
      updateChange()
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [cashPayment])

   const inputChangeSearch = (event: any, value: any, reason: any) => {
      if (value === null) console.log('inputChangeSearch(): Value nulo')
      if (event === null) console.log('inputChangeSearch(): Event no encontrado')
      if (reason === null) console.log('inputChangeSearch(): Reason no encontrado')
      setSearchReason(reason)
      setSearchValue(value)
   }

   const handleQuantityProduct = (event: any, index: any) => {
      let newSaleData = saleData.slice()
      let data = newSaleData[index]

      if (event.target.value !== '') {
         if (event.target.value > data.stockProduct) {
            AlertSmall('info', 'No se puede agregar mas, ¡Limite de stock!')
            event.target.value = data.stockProduct
         } else if (event.target.value < 1) {
            event.target.value = 1
         } else {
            data.quantityProduct = Number(event.target.value)
            data.amountProduct = round2Decimals(data.priceSellProduct * Number(event.target.value))

            newSaleData[index] = data
            setSaleData(newSaleData)
         }
      }
   }

   const onKeyDSField = (event: any) => {
      if (event.keyCode === 13 && searchOptions.length === 0) {
         addSaleProduct()
      }
   }

   const radioVoucher = (event: any) => {
      setSaleVoucher(event.target.value)
   }

   const radioWayToPay = (event: any) => {
      setSaleWayToPay(event.target.value)
   }

   const inputChangeClient = (event: any) => {
      setClientName(event.target.value)
   }

   const inputChangeCash = (event: any) => {
      setCashPayment(event.target.value)
   }

   const clearSearchField = () => {
      let item: HTMLElement = document.getElementsByClassName('MuiAutocomplete-clearIndicator')[0] as HTMLElement
      item.click()
   }

   const updateTotalIgv = () => {
      let igvCalc = 0
      let subTotalNum = Number(subTotal)
      if (saleVoucher === 'factura') {
         igvCalc = round2Decimals(subTotalNum * 0.18)
         setIgv(fillDecimals(igvCalc))
      } else {
         setIgv(fillDecimals(igvCalc))
      }
      let totalFinal = round2Decimals(subTotalNum - igvCalc)
      //let totalFinal = round2Decimals(subTotalNum)
      setTotal(fillDecimals(totalFinal))
   }

   const updateChange = () => {
      if (isNumeric(cashPayment)) {
         let newChange = round2Decimals(cashPayment - Number(subTotal))
         setChange(fillDecimals(newChange))
      }
   }

   const deleteSaleProduct = (index: any) => {
      AlertBig('Estas seguro de eliminar el producto?', 'El producto sera eliminado de la lista!', 'warning', 'Si, deseo eliminarlo!').then((result: any) => {
         if (result.isConfirmed) {
            let newSaleData = saleData.slice()
            newSaleData.splice(index, 1)
            setSaleData(newSaleData)

            let newSaleProducts = saleProducts.slice()
            newSaleProducts.splice(index, 1)
            setSaleProducts(newSaleProducts)
         }
      })
   }

   const addOneQuantity = (exist: any) => {
      let newSaleData = saleData.slice()
      let data = newSaleData[exist]
      let newQuantity = data.quantityProduct + 1

      if (newQuantity <= data.stockProduct) {
         data.quantityProduct = newQuantity
         data.amountProduct = round2Decimals(data.priceSellProduct * newQuantity)
         newSaleData[exist] = data
         setSaleData(newSaleData)
      }
   }

   const clearAllInput = () => {
      setSaleData([])
      setSaleProducts([])
      setClientName('')
      setCashPayment(0)
      setChange(fillDecimals(0))
   }

   const searchProducts = (value: any) => {
      if (searchReason === 'reset') {
         setSearchOptions([])
         return
      }
      const prepareData = {
         Entry: {
            value: value
         },
         spName: 'spSearchProducts'
      }
      ipcRenderer.invoke('searchproducts', prepareData)
         .then((products: any) => {
            if (products.length > 0) {
               let options = []
               for (let i = 0; i < products.length; i++) {
                  options.push(products[i].nameProduct);
               }
               setSearchOptions(options)
            }
         })
   }

   const addSaleProduct = () => {
      const prepareData = {
         Entry: {
            value: searchValue
         },
         spName: 'spSearchExactProduct'
      }
      ipcRenderer.invoke('searchexactproduct', prepareData)
         .then((products: any) => {
            if (products.length > 0) {
               if (products[0].stateProduct) {
                  let exist = -1
                  for (let i = 0; i < saleProducts.length; i++) {
                     if (saleProducts[i].idProduct === products[0].idProduct) exist = i
                  }
                  if (exist === -1) {
                     let aux = [...saleProducts, products[0]]
                     setSaleProducts(aux)
                  } else {
                     addOneQuantity(exist)
                     AlertSmall('info', 'Producto ya agregado.')
                     //console.log('addSaleProduct(): Producto ya agregado')
                  }
               } else {
                  AlertSmall('info', 'Producto sin stock.')
                  //console.log('addSaleProduct(): Producto sin stock')
               }
               clearSearchField()
            } else {
               AlertSmall('error', 'Producto no encontrado.')
               //console.log('addSaleProduct(): Producto no encontrado')
            }
         })
   }

   const createSale = ( idshift: any) => {
      let qproductval = 0
      for (let i = 0; i < saleData.length; i++) {
         qproductval += saleData[i].quantityProduct
      }
      let changeval = Number(change)
      if (qproductval === 0) {
         AlertSmall('info', 'No hay productos para realizar la venta.')
         //console.log('createSale(): No hay productos para realizar la venta.')
         return
      }
      if (changeval < 0) {
         AlertSmall('info', 'El cambio es negativo.')
         //console.log('createSale(): El cambio es negativo, te están robando crack.')
         return
      }
      if (!isNumeric(cashPayment)) {
         AlertSmall('info', 'El monto de pago no es numérico o no es valido.')
         //console.log('createSale(): El monto de pago no es numérico.')
         return
      }
      let nameclientval = clientName
      if (nameclientval === '') {
         nameclientval = 'Varios'
      }

      let dateval: Date = new Date();
      dateval.setUTCHours(dateval.getUTCHours() - 5)

      const prepareData = {
         Iduser: { value: user.idUser },
         Nameclient: { value: nameclientval },
         Voucher: { value: saleVoucher },
         Date: { value: dateval },
         Qproduct: { value: qproductval },
         Cash: { value: cashPayment },
         Tax: { value: Number(igv) },
         Subtotal: { value: Number(total) },
         Change: { value: Number(change) },
         Waytopay: { value: saleWayToPay },
         spName: 'spCreateSale'
      }
      ipcRenderer.invoke('createsale', prepareData)
         .then((scope: any) => {
            for (let i = 0; i < saleProducts.length; i++) {
               const idproduct = saleProducts[i].idProduct
               const quantity = saleData[i].quantityProduct
               const product = saleProducts[i]
               createOrder(idproduct, scope[0].scopeIdentity, quantity)
               updateStock(product, quantity)
            }
            registerActivity(idshift, scope[0].scopeIdentity)
            clearAllInput()
            AlertSmall('success', 'Venta registrada correctamente.')
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
               createSale(shift[0].idShift)
            }
         })
   }

   const registerActivity = (idshift: any, idmov: any) => {
      let res = round2Decimals(caja + Number(subTotal))
      const prepareData = {
         Idshift: { value: idshift },
         Iduser: { value: user.idUser },
         Name: { value: 'Venta' },
         Amount: { value: subTotal },
         Operator: { value: '+' },
         Result: { value: res },
         Idmovement: { value: idmov },
         spName: 'spInsertActivity'
      }
      ipcRenderer.invoke('insertactivity', prepareData)
         .then((msg: any) => {
            console.log(msg + 'Actividad creada de Venta')
            setCaja(res)
         })
   }

   const updateStock = (product: any, quantity: any) => {
      let newStock = product.stockProduct - quantity
      if (newStock) {
         product.stateProduct = true
      } else {
         product.stateProduct = false
      }
      const prepareData = {
         IdCategory: { value: product.idCategory },
         Barcode: { value: product.barcodeProduct },
         NameProduct: { value: product.nameProduct },
         StockProduct: { value: newStock },
         PriceSellProduct: { value: product.priceSellProduct },
         PriceBuyProduct: { value: product.priceBuyProduct },
         DateProduct: { value: registro },
         DescriptionProduct: { value: product.descriptionProduct },
         StateProduct: { value: product.stateProduct },
         IdProduct: { value: product.idProduct },
         spName: 'spUpdateProduct'
      }
      ipcRenderer.invoke('updateproductid', prepareData)
         .then(() => {
         }).catch((err: any) => AlertSmall('error', `Ha ocurrido un error, ${err}`))
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

   class ComponentToPrint extends React.Component {
      _getTime = (time: any) => {
         var dateTime = new Date().toLocaleString();
         return dateTime
      }
      render() {
         return (
            <div>
               <header>
                  <h3 style={{ textAlign: "center" }}>FRESCO</h3>
               </header>
               <div style={{ width: '100%', textAlign: "center" }}>
                  Tienda de Abarrotes Fresco <br />
                  Av. Amauta 1020 Urb. Pedro P.Diaz<br />
                  Ca. Nicolas de Pierola <br />
                  Arequipa - Arequipa - Paucarpata<br />
                  TEL: 764 826 963 <br />
                  RUC: 10294496098 <br />
                  {saleVoucher.charAt(0).toUpperCase() + saleVoucher.slice(1)} de Venta Electronica
               </div>
               <br />
               <div style={{ width: '100%', alignItems: "center", justifyContent: "center" }}>
                  <table style={{ width: '100%', alignItems: "center", justifyContent: "center" }}>
                     <tbody>
                        <tr><td>DNI</td><td>{user.numdocUser}</td></tr>
                        <tr><td>NOMBRE</td><td>{clientName ? clientName : 'CLIENTE VARIOS'}</td></tr>
                        <tr><td>CAJERO</td><td>{user.nameUser.toUpperCase()}</td></tr>
                        <tr><td>FECHA DE EMISION</td><td>{this._getTime(registro)}</td></tr>
                     </tbody>
                  </table>
               </div>
               <br />

               <div>
                  <table style={{ width: '100%' }}>
                     <tbody>
                        <tr style={{textAlign: 'left'}}>
                           <th>DESCR.</th><th>CANT</th><th>P.UNIT</th><th>P.TOTAL</th>
                        </tr>
                        {
                           saleData.map((p, index) => (
                              <tr key={index}>
                                 <td>{p.nameProduct}</td><td>{p.quantityProduct}</td><td>S/.{p.priceSellProduct}</td><td>S/.{p.amountProduct}</td>
                              </tr>
                           ))
                        }
                     </tbody>
                  </table>
               </div>
               <br />
               <div>
                  <table style={{ width: '100%' }}>
                     <tbody>
                        <tr>
                           <td>TOTAL:</td><td>S/.{subTotal}</td>
                        </tr>
                        <tr>
                           <td>IGV:</td><td>S/.{igv}</td>
                        </tr>
                        <tr>
                           <td>EFECTIVO:</td><td>S/.{parseFloat(`${cashPayment}` ? `${cashPayment}` : '0.00').toFixed(2)}</td>
                        </tr>
                        <tr>
                           <td>CAMBIO:</td><td>S/.{change}</td>
                        </tr>
                     </tbody>
                  </table>
               </div>
               <br />
               <div style={{ textAlign: "center" }}>Gracias por comprar en Fresco</div>
            </div>
         )
      }
   }

   const changeShow = () => {
      if (showTicket) {
         setShowTicket(false)
      }
      else {
         setShowTicket(true)
      }
   }

   const componentRef = React.useRef(null);
   const handlePrint = useReactToPrint({
      content: () => componentRef.current,
   });

   return (
      <>
         <Grid container spacing={2}>
            <Grid item xs={8}>

               {showTicket ?
                  <>
                     <Card style={{ marginBottom: "8px" }}>
                        <CardContent>
                           <Grid container spacing={1}>
                              <Grid item xs={10}>
                                 <Autocomplete
                                    classes={{
                                       inputRoot: classes.inputRoot
                                    }}
                                    freeSolo
                                    autoComplete
                                    autoHighlight
                                    clearOnEscape
                                    getOptionSelected={(option, value) => option === value}
                                    getOptionLabel={(option) => option}
                                    options={searchOptions}
                                    onBlur={() => setSearchOptions([])}
                                    onInputChange={inputChangeSearch}
                                    renderInput={(params) => (
                                       <TextField {...params}
                                          variant="outlined"
                                          placeholder="Ingrese el nombre o código de barra del Producto"
                                          onKeyDown={onKeyDSField}
                                          value={searchValue}
                                       />
                                    )}
                                 />
                              </Grid>
                              <Grid item xs={2}>
                                 <Button variant="contained" color="primary" onClick={addSaleProduct}>Agregar</Button>
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
                                       <TableCell align="center">Acciones</TableCell>
                                    </TableRow>
                                 </TableHead>
                                 <TableBody>
                                    {saleData.map((p, index) => (
                                       <TableRow key={index}>
                                          <TableCell align="center">{index + 1}</TableCell>
                                          <TableCell align="center">
                                             <TextField
                                                value={p.quantityProduct}
                                                type="number"
                                                InputProps={{ inputProps: { min: 1, max: p.stockProduct } }}
                                                onChange={(e) => handleQuantityProduct(e, index)}
                                                onFocus={event => event.target.select()}
                                             />
                                          </TableCell>
                                          <TableCell align="center">{p.nameProduct}</TableCell>
                                          <TableCell align="center">{p.priceSellProduct}</TableCell>
                                          <TableCell align="center">{p.amountProduct}</TableCell>
                                          <TableCell align="center">
                                             <Button variant="contained" color="secondary" onClick={() => deleteSaleProduct(index)}
                                                classes={{
                                                   startIcon: classes.nomargin,
                                                   root: classes.rootbutton
                                                }}
                                                startIcon={<Delete />} />
                                          </TableCell>
                                       </TableRow>
                                    ))}
                                 </TableBody>
                              </Table>
                           </TableContainer>
                        </CardContent>
                     </Card>
                  </>
                  :
                  <>
                     <Grid container spacing={3}>
                        <Grid item xs={6}>
                           <Button fullWidth variant="contained" color="primary" onClick={changeShow} style={{ marginTop: '8px' }}>Volver a Compra</Button>
                        </Grid>
                        <Grid item xs={6}>
                           <Button fullWidth variant="contained" color="primary" onClick={handlePrint} style={{ marginTop: '8px' }}>Imprimir</Button>
                        </Grid>
                        <Grid className={classes.paper}>
                           <Container maxWidth="sm">
                              <ComponentToPrint ref={componentRef} />
                           </Container>
                        </Grid>
                     </Grid>
                  </>
               }
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
                     onChange={inputChangeClient}
                     style={{ marginBottom: '8px' }}
                  />

                  <FormControl>
                     <FormLabel style={{ color: 'black' }}>Tipo de Voucher</FormLabel>
                     <RadioGroup row aria-label="voucher" value={saleVoucher} onChange={radioVoucher}>
                        <FormControlLabel value="ticket" control={<Radio size="small" />} label="Ticket" classes={{ label: classes.fclabel }} />
                        <FormControlLabel value="boleta" control={<Radio size="small" />} label="Boleta" classes={{ label: classes.fclabel }} />
                        <FormControlLabel value="factura" control={<Radio size="small" />} label="Factura" classes={{ label: classes.fclabel }} />
                     </RadioGroup>
                  </FormControl>

                  <Divider style={{ marginBottom: '8px' }} />
                  <FormControl>
                     <FormLabel style={{ color: 'black' }}>Método de Pago</FormLabel>
                     <RadioGroup row aria-label="waytopay" value={saleWayToPay} onChange={radioWayToPay}>
                        <FormControlLabel value="efectivo" control={<Radio size="small" />} label="Efectivo" classes={{ label: classes.fclabel }} />
                        <FormControlLabel value="visa" control={<Radio size="small" />} label="Visa" classes={{ label: classes.fclabel }} />
                        <FormControlLabel value="mastercard" control={<Radio size="small" />} label="MasterCard" classes={{ label: classes.fclabel }} />
                        <FormControlLabel value="yape" control={<Radio size="small" />} label="Yape" classes={{ label: classes.fclabel }} />
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
                           value={cashPayment}
                           onChange={inputChangeCash}
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

                     <Button fullWidth variant="contained" color="primary" onClick={changeShow} style={{ marginTop: '8px' }}>Preparar comprobante de pago</Button>
                     <Button fullWidth variant="contained" color="primary" onClick={checkLastShift} style={{ marginTop: '8px' }}>Registrar Venta</Button>
                  </Grid>
               </Box>
            </Grid>
         </Grid>
      </>
   )
}

export default SalePage
