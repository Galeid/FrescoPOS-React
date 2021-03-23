import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
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

interface Category {
    idCategory: string,
    nameCategory: string,
    descriptionCategory: string
}
let categoriesFromDB: Category[] = []

const useStyles = makeStyles((theme) => ({
    textField: {
        width: '100%',
        "& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
            display: "none"
        }
    }
}));

const CardProductDetails = (props: { idProduct: any; }) => {
    let registro: Date = new Date();
    let id = props.idProduct;
    let history = useHistory()
    // eslint-disable-next-line
    const classes = useStyles()
    const [productDB, setProductDB] = useState({
        idProduct: '',
        idCategory: 0,
        barcodeProduct: '',
        nameProduct: '',
        stockProduct: '',
        priceProduct: '',
        dateProduct: '',
        descriptionProduct: '',
        stateProduct: ''
    })
    const [categoryDB, setCategoryDB] = useState(categoriesFromDB)

    //const [stockInitial, setStockInitial] = useState(null)
    //const [productDB2, setProductDB2] = useState()
    const getCategories = () => {
        const prepareData = {
            spName: 'spListCategories'
        }
        ipcRenderer.invoke('getcategories', prepareData)
            .then((categories: any) => {
                setCategoryDB(categories)
            })
    }

    const getProductsId = () => {
        const prepareData = {
            Entry: { value: props.idProduct },
            spName: 'spSearchIdProduct'
        }
        ipcRenderer.invoke('searchidproduct', prepareData)
            .then((product: any) => {
                setProductDB(product[0])
            })
    }

    const insertProducts = () => {
        console.log('insertProducts')
        const prepareData = {
            IdCategory: { value: productDB.idCategory },
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
            ipcRenderer.invoke('insertproduct', prepareData)
                .then(() => {
                    Alert('success', 'Se agrego el producto con exito')
                    history.push('/products')
                }).catch((err: any) => {
                    console.log(err)
                    Alert('error', 'Ha ocurrido un error')
                })
        } else {
            Alert('error', 'Debe llenar los campos primero')
        }
    }
    //var registro = Date.now();
    const updateProductsId = () => {
        const prepareData = {
            IdCategory: { value: productDB.idCategory },
            Barcode: { value: productDB.barcodeProduct },
            NameProduct: { value: productDB.nameProduct },
            StockProduct: { value: productDB.stockProduct },
            PriceProduct: { value: productDB.priceProduct },
            DateProduct: { value: registro },
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

    const handleChange = (event: React.ChangeEvent<{ name?: string | undefined; value: unknown; }>) => {
        if (event.target.name === "barcodeProduct" || event.target.name === "stockProduct") {
            const onlyNums = String(event.target.value).replace(/[^0-9]/g, "");
            setProductDB({
                ...productDB,
                [event.target.name]: onlyNums
            });
        }
        else {
            setProductDB({
                ...productDB,
                [event.target.name as string]: event.target.value as string
            });
        }
    };

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
            getProductsId()
        }
        getCategories()
        // eslint-disable-next-line
    }, [])

    return (
        <form
            autoComplete="off"
            noValidate
            onSubmit={e => { e.preventDefault(); }}
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
                                className={classes.textField}
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
                                onChange={handleChange}
                                value={productDB.descriptionProduct || ''}
                                placeholder={productDB.descriptionProduct || 'No hay notas'}
                                name="descriptionProduct"
                                variant="outlined"
                                multiline
                                rows={6}
                                rowsMax={6}
                            />
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <Grid container wrap="nowrap" spacing={2}>
                                <Grid item xs={12}>
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
                                                <em>{
                                                    Number(productDB.stateProduct) === 1 ? 'Activo' : 'Inactivo'
                                                }</em>
                                            </MenuItem>
                                            {
                                                Number(productDB.stateProduct) === 1 ?
                                                    <MenuItem value='0'>Inactivo</MenuItem>
                                                    :
                                                    <MenuItem value='1'>Activo</MenuItem>
                                            }
                                        </Select>
                                        <FormHelperText>Selecciona al menos una opcion</FormHelperText>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Grid container wrap="nowrap" spacing={2}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel
                                            disableAnimation={false}
                                        >
                                            Categoria
                                        </InputLabel>
                                        <Select
                                            fullWidth
                                            required
                                            value={productDB.idCategory || ''}
                                            onChange={handleChange}
                                            input={<Input name="idCategory" />}
                                        >
                                            {
                                                categoryDB.map((p, index) => (
                                                    <MenuItem key={index} value={p.idCategory}>{p.nameCategory}</MenuItem>
                                                ))
                                            }
                                        </Select>
                                        <FormHelperText>Selecciona al menos una opcion</FormHelperText>
                                    </FormControl>
                                </Grid>
                            </Grid>
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
