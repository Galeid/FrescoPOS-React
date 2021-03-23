import React, { useState, useEffect, useContext } from 'react'
import { Box, Grid, Card, CardContent, Button,
   TextField, Table, TableBody, TableCell, TableContainer,
   TableHead, TableRow, Typography, Divider, FormControl, 
   FormControlLabel, RadioGroup, Radio, FormLabel } from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'

import { makeStyles } from '@material-ui/core/styles';
import { AuthContext } from '../../../services/AuthContext'

const { ipcRenderer } = window.require('electron')


interface Product {
   idProduct: any,
   barcodeProduct: any,
   nameProduct: any,
   stockProduct: any,
   priceProduct: any,
   descriptionProduct: any,
   stateProduct: any
}

interface SaleData {
   stockProduct: any,
   quantityProduct: any,
   nameProduct: any,
   priceProduct: any,
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
   let str = number+'';
   let dot = str.lastIndexOf('.');
   let isDecimal = dot !== -1;
   let integer = isDecimal ? str.substr(0, dot) : str;
   let decimals = isDecimal ? str.substr(dot+1)  : '';
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
      '&&[class*="MuiOutlinedInput-root"] $input': {
         padding: '0'
      }
   },
   tfInputmargin: {
      padding: '9px 9px 9px 9px'
   },
   tflabel: {
      transform: 'translate(10px, 12px) scale(1)'
   },
   fclabel: {
      fontSize: '0.9rem'
   }
})

const SalePage = () => {
   const classes = useStyles()
   const { user } = useContext(AuthContext)

   const [change, setChange] = useState(fillDecimals(0))
   const [cashPayment, setCashPayment] = useState(0)
   const [clientName, setClientName] = useState('')

   const [subTotal, setSubTotal] = useState(fillDecimals(0))
   const [total, setTotal] = useState(fillDecimals(0))
   const [igv, setIgv] = useState(fillDecimals(0))

   const [searchValue, setSearchValue] = useState('')
   const [searchOptions, setSearchOptions] = useState(searchoptionsFromDB)
   const [searchReason, setSearchReason] = useState('')

   const [saleProducts, setSaleProducts] = useState(productsFromDB)
   const [saleData, setSaleData] = useState(saledataFromDB)
   const [saleVoucher, setSaleVoucher] = useState('boleta')
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
            priceProduct: saleProducts[saleProducts.length - 1].priceProduct,
            amountProduct: round2Decimals(saleProducts[saleProducts.length - 1].priceProduct),
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
            event.target.value = data.stockProduct
         } else if (event.target.value < 1) {
            event.target.value = 1
         } else {
            data.quantityProduct = Number(event.target.value)
            data.amountProduct = round2Decimals(data.priceProduct * Number(event.target.value))
      
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
      let totalFinal = round2Decimals(subTotalNum + igvCalc)
      setTotal(fillDecimals(totalFinal))
   }

   const updateChange = () => {
      if (isNumeric(cashPayment)){
         let newChange = round2Decimals(cashPayment - Number(total))
         setChange(fillDecimals(newChange))
      }
   }

   const deleteSaleProduct = (index: any) => {
      let newSaleData = saleData.slice()
      newSaleData.splice(index, 1)
      setSaleData(newSaleData)

      let newSaleProducts = saleProducts.slice()
      newSaleProducts.splice(index, 1)
      setSaleProducts(newSaleProducts)
   }

   const addOneQuantity = (exist: any) => {
      let newSaleData = saleData.slice()
      let data = newSaleData[exist]
      let newQuantity = data.quantityProduct + 1

      if (newQuantity <= data.stockProduct){
         data.quantityProduct = newQuantity
         data.amountProduct = round2Decimals(data.priceProduct * newQuantity)
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
                     console.log('addSaleProduct(): Producto ya agregado')
                  }
               } else {
                  console.log('addSaleProduct(): Producto sin stock')
               }
               clearSearchField()
            } else {
               console.log('addSaleProduct(): Producto no encontrado')
            }
         })
   }

   const createSale = () => {
      let qproductval = 0
      for (let i = 0; i < saleData.length; i++) {
         qproductval += saleData[i].quantityProduct
      }
      let changeval = Number(change)
      if (qproductval === 0) {
         console.log('createSale(): No hay productos para realizar la venta.')
         return
      }
      if (changeval < 0) {
         console.log('createSale(): El cambio es negativo, te están robando crack.')
         return
      }
      if (!isNumeric(cashPayment)){
         console.log('createSale(): El monto de pago no es numérico.')
         return
      }
      let nameclientval = clientName
      if (nameclientval === '') {
         nameclientval = 'Varios'
      }
      let dateval: Date = new Date();
      
      const prepareData = {
         Iduser: { value: user.idUser },
         Nameclient: { value: nameclientval },
         Voucher: { value: saleVoucher },
         Date: { value: dateval },
         Qproduct: { value: qproductval },
         Discount: { value: 0 },
         Cash: { value: cashPayment },
         Tax: { value: Number(igv) },
         Subtotal: { value: Number(subTotal) },
         Change: { value: Number(change) },
         Waytopay: { value: saleWayToPay },
         spName: 'spCreateSale'
      }
      ipcRenderer.invoke('createsale', prepareData)
         .then((scope: any) => {
            for (let i = 0; i < saleProducts.length; i++) {
               const idproduct = saleProducts[i].idProduct
               const quantity = saleData[i].quantityProduct
               createOrder(idproduct, scope[0].scopeIdentity, quantity)
            }
            clearAllInput()
         })
   }

   const createOrder = (idPro: any, idSal: any, quantity: any) => {
      const prepareData = {
         Idproduct: { value: idPro},
         Idsale: { value: idSal},
         Quantity: { value: quantity},
         spName: 'spCreateOrder'
      }
      ipcRenderer.invoke('createorder', prepareData)
         .then((message: any) => {
            console.log(message + 'createOrder(): Producto de orden creada.')
         })
   }

   return (
      <>
         <Grid container spacing={2}>
            <Grid item xs={8}>
               <Card>
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
                                    <TableCell align="center">Precio</TableCell>
                                    <TableCell align="center">Importe</TableCell>
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
                                       <TableCell align="center">{p.priceProduct}</TableCell>
                                       <TableCell align="center">{p.amountProduct}</TableCell>
                                       <TableCell align="center">
                                          <Button variant="contained" color="primary" onClick={() => deleteSaleProduct(index)}>DEL</Button>
                                       </TableCell>
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

               <Box border={1}  py={3} px={3}>
                  <TextField
                     fullWidth
                     InputProps={{ classes: { input: classes.tfInputmargin } }}
                     InputLabelProps={{ classes: { outlined: classes.tflabel } }}
                     variant="outlined" 
                     label="Nombre del Cliente" 
                     value={clientName} 
                     onChange={inputChangeClient}
                     style={{ marginBottom: '8px'}}
                  />

                  <FormControl>
                     <FormLabel style={{ color: 'black' }}>Tipo de Voucher</FormLabel>
                     <RadioGroup row aria-label="voucher" value={saleVoucher} onChange={radioVoucher}>
                        <FormControlLabel value="boleta" control={<Radio />} label="Boleta" classes={{ label: classes.fclabel}}/>
                        <FormControlLabel value="factura" control={<Radio />} label="Factura" classes={{ label: classes.fclabel}}/>
                     </RadioGroup>
                  </FormControl>

                  <Divider style={{ marginBottom: '8px' }}/>
                  <FormControl>
                     <FormLabel style={{ color: 'black' }}>Método de Pago</FormLabel>
                     <RadioGroup row aria-label="waytopay" value={saleWayToPay} onChange={radioWayToPay}>
                        <FormControlLabel value="efectivo" control={<Radio />} label="Efectivo" classes={{ label: classes.fclabel}}/>
                        <FormControlLabel value="tarjeta" control={<Radio />} label="Tarjeta" classes={{ label: classes.fclabel}}/>
                     </RadioGroup>
                  </FormControl>

                  <Divider style={{ marginBottom: '8px' }}/>
                  

                  <Grid container spacing={0} style={{ marginBottom: '8px'}}>
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
                           style={{ marginRight: '4px'}}
                        />
                     </Grid>
                     <Grid container item xs={6}>
                        <Grid item xs={5} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <Typography variant="body2" style={{ fontSize: '0.8rem'}}> CAMBIO: </Typography>
                        </Grid>
                        <Grid item xs={7} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <Typography variant="body2" className={classes.center}> S/. {change} </Typography>
                        </Grid>
                     </Grid>
                  </Grid>

                  <Divider style={{ marginBottom: '8px' }}/>
                  <Grid container spacing={0}>
                     <Grid container item xs={12}>
                        <Grid item xs={6}>
                           <Typography variant="body2"> SUB TOTAL </Typography>
                        </Grid>
                        <Grid item xs={6}>
                           <Typography variant="body2" className={classes.center}>S/. {subTotal}</Typography>
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
                           <Typography variant="body2" className={classes.center}> S/. {total} </Typography>
                        </Grid>
                     </Grid>

                     <Button fullWidth variant="contained" color="primary" onClick={createSale} style={{ marginTop: '8px' }}>Registrar Venta</Button>
                  </Grid>
               </Box>
            </Grid>
         </Grid>
      </>
   )
}

export default SalePage
