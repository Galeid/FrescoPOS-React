import React, { useState, useEffect } from 'react';
//import { ipcRenderer as ipc } from 'electron'

import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
//import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
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

const { ipcRenderer } = window.require('electron')
interface Product {
    idProduct: string,
    barcodeProduct: string,
    nameProduct: string,
    stockProduct: string,
    priceProduct: string,
    dateProduct: string,
    descriptionProduct: string,
    stateProduct: string
}

let productInterface: Product[] = []

const CardProductDetails = (props: { idProduct: any; }) => {
    let registro: Date = new Date();
    let id = props.idProduct;
    let history = useHistory()
    const [productDB, setProductDB] = useState({
        idProduct: '',
        barcodeProduct: '',
        nameProduct: '',
        stockProduct: '',
        priceProduct: '',
        dateProduct: '',
        descriptionProduct: '',
        stateProduct: ''
    })
    //const [stockInitial, setStockInitial] = useState(null)
    //const [productDB2, setProductDB2] = useState()

    //console.log("Recibiendo id: ", props.idProduct)
    const getProductsId = () => {
        const prepareData = {
            Entry: { value: props.idProduct },
            spName: 'spSearchIdProduct'
        }
        ipcRenderer.invoke('searchidproduct', prepareData)
            .then((product: any) => {
                productInterface = product
                setProductDB(productInterface[0])
            })
    }

    const insertProducts = () => {
        console.log('insertProducts')
        const prepareData = {
            Barcode: { value: productDB.barcodeProduct },
            NameProduct: { value: productDB.nameProduct },
            StockProduct: { value: productDB.stockProduct },
            PriceProduct: { value: productDB.priceProduct },
            DateProduct: { value: registro },
            DescriptionProduct: { value: productDB.descriptionProduct === '' ? 'No hay notas' : productDB.descriptionProduct },
            StateProduct: { value: productDB.stateProduct },
            spName: 'spInsertProduct'
        }

        if (productDB.nameProduct !== '' && productDB.priceProduct !== '' && productDB.stateProduct !== '') {
            console.log('Hola1')
            ipcRenderer.invoke('insertproduct', prepareData)
                .then(() => {
                    Alert('success', 'Se agrego el producto con exito')
                    history.push('/products')
                }).catch((err: any) => {
                    console.log(err)
                    Alert('error', 'Ha ocurrido un error')
                })
        } else {
            console.log('Hola2')
            Alert('error', 'Debe llenar los campos primero')
        }
    }
    //var registro = Date.now();
    const updateProductsId = () => {
        const prepareData = {
            Barcode: { value: productDB.barcodeProduct },
            NameProduct: { value: productDB.nameProduct },
            StockProduct: { value: productDB.stockProduct },
            PriceProduct: { value: productDB.priceProduct },
            //dateProduct: Intl.DateTimeFormat(['ban', 'id']).format(registro),
            DateProduct: { value: registro },
            //dateProduct: productDB.dateProduct,
            DescriptionProduct: { value: productDB.descriptionProduct },
            StateProduct: { value: productDB.stateProduct },
            IdProduct: { value: productDB.idProduct },
            spName: 'spUpdateProduct'
        }
        ipcRenderer.invoke('updateproductid', prepareData)
            .then((product: any) => {
                console.log(product)
                Alert('success', 'Se han guardado los cambios con exito')
            }).catch((err: any) => console.log(err))
        //poenr alerta
    }

    const Alert = (iconText: any, titleText: {} | null | undefined) => {
        const MySwal = withReactContent(Swal)
        MySwal.fire({
            toast: true,
            position: 'bottom-end',
            icon: iconText,
            title: <p>{titleText}</p>,
            timerProgressBar: true,
            timer: 5000
        })
    }

    useEffect(() => {
        if (id !== 'null') {
            console.log('con id: ', props)
            getProductsId()
        } else {
            console.log('sin id: ', props)
        }
        // eslint-disable-next-line
    }, [])

    const handleChange = (event: React.ChangeEvent<{ name?: string | undefined; value: unknown; }>) => {
        if (event.target.name === "barcodeProduct" || event.target.name === "stockProduct" || event.target.name === "priceProduct") {
            if (event.target.name === "priceProduct") {
                setProductDB({
                    ...productDB,
                    [event.target.name]: event.target.value as string
                });

            } else {
                const onlyNums = String(event.target.value).replace(/[^0-9]/g, "");
                setProductDB({
                    ...productDB,
                    [event.target.name]: onlyNums
                });
            }
        }
        else {
            setProductDB({
                ...productDB,
                [event.target.name as string]: event.target.value as string
            });
        }
    };

    const handleFocus = (event: { preventDefault?: any; target?: any; }) => {
        event.preventDefault();
        const { target } = event;
        const extensionStarts = target.value.lastIndexOf('.');
        target.focus();
        target.setSelectionRange(0, extensionStarts);
    }
    return (
        <form
            autoComplete="off"
            noValidate
        >
            <Card>
                <CardHeader
                    subheader="Nota: Debe llenar obligatoriamente los campos de nombre, precio y estado"
                    title="Editar producto"
                />
                <Divider />
                {/*<div>{Intl.DateTimeFormat(['ban', 'id']).format(registro)}</div>*/}
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item md={6} xs={12}>
                            <TextField
                                fullWidth
                                label="Codigo de barras"
                                onChange={handleChange}
                                value={productDB.barcodeProduct || ''}
                                name="barcodeProduct"
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <TextField
                                fullWidth
                                required
                                //error={productDB.nameProduct === ""}
                                //helperText={productDB.nameProduct === "" ? 'Este campo no puede estar vacio' : ' '}
                                label="Nombre del producto"
                                onChange={handleChange}
                                value={productDB.nameProduct || ''}
                                name="nameProduct"
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <TextField
                                fullWidth
                                label="Stock"
                                onChange={handleChange}
                                value={productDB.stockProduct || ''}
                                name="stockProduct"
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item md={6} xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="Precio"
                                onChange={handleChange}
                                value={productDB.priceProduct || ''}
                                name="priceProduct"
                                type={'number'}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="Notas"
                                onFocus={handleFocus}
                                onChange={handleChange}
                                value={productDB.descriptionProduct || 'No hay notas'}
                                placeholder={productDB.descriptionProduct || 'No hay notas'}
                                name="descriptionProduct"
                                variant="outlined"
                                multiline
                                rows={4}
                                rowsMax={4}
                            />
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <FormControl fullWidth>
                                <InputLabel
                                    disableAnimation={false}
                                >
                                    Estado
                                </InputLabel>
                                <Select 
                                    fullWidth
                                    required
                                    value={productDB.stateProduct}
                                    onChange={handleChange}
                                    input={<Input name="stateProduct" />}
                                >
                                    <MenuItem selected value={productDB.stateProduct}>
                                        <em>{productDB.stateProduct === '1' ? 'Activo' : 'Inactivo'}</em>
                                    </MenuItem>
                                    {
                                        productDB.stateProduct === '1' ?
                                            <MenuItem value='0'>Inactivo</MenuItem>
                                            :
                                            <MenuItem value='1'>Activo</MenuItem>
                                    }
                                </Select>
                                <FormHelperText>Selecciona al menos una opcion</FormHelperText>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
                <Divider />
                <Box
                    display="flex"
                    justifyContent="flex-end"
                    p={2}
                >
                    <Grid container justify="flex-end" spacing={3}>
                        <Grid
                            item
                            xs={3} //12
                        >
                            <Button
                                color="default"
                                variant="contained"
                                onClick={() => {
                                    history.push('/products')
                                }}
                            >
                                Regresar
                            </Button>
                        </Grid>
                        <Grid
                            item
                            xs={3} //12
                        >
                            <Button
                                color="primary"
                                variant="contained"
                                onClick={id !== 'null' ? updateProductsId : insertProducts}
                            >
                                {id !== 'null' ? 'Guardar' : 'Insertar Producto'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Card>
        </form >
    );
};

export default CardProductDetails;
