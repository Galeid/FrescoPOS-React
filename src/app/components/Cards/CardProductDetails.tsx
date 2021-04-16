import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../services/AuthContext';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import AlertSmall from '../Alert/AlertSmall'
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
        priceSellProduct: '',
        priceBuyProduct: '',
        dateProduct: '',
        descriptionProduct: '',
        stateProduct: ''
    })
    const [categoryDB, setCategoryDB] = useState(categoriesFromDB)
    const { user } = useContext(AuthContext)
    const [edit, setEdit] = useState(false)


    //console.log('edit2: ', edit)


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
        let registrod = registro
        registrod.setUTCHours(registrod.getUTCHours() - 5)
        const prepareData = {
            IdCategory: { value: productDB.idCategory },
            Barcode: { value: productDB.barcodeProduct },
            NameProduct: { value: productDB.nameProduct },
            StockProduct: { value: productDB.stockProduct },
            PriceSellProduct: { value: productDB.priceSellProduct },
            PriceBuyProduct: { value: productDB.priceBuyProduct },
            DateProduct: { value: registrod },
            DescriptionProduct: { value: productDB.descriptionProduct === '' ? 'No hay notas' : productDB.descriptionProduct },
            StateProduct: { value: productDB.stateProduct },
            spName: 'spInsertProduct'
        }

        if (productDB.nameProduct !== '' && productDB.priceSellProduct !== '' && productDB.priceBuyProduct !== '' && productDB.stateProduct !== '') {
            ipcRenderer.invoke('insertproduct', prepareData)
                .then(() => {
                    AlertSmall('success', 'Se agrego el producto con exito')
                    history.push('/products')
                }).catch((err: any) => {
                    console.log(err)
                    AlertSmall('error', 'Ha ocurrido un error')
                })
        } else {
            AlertSmall('error', 'Debe llenar los campos primero')
        }
    }
    //var registro = Date.now();
    const updateProductsId = () => {
        let registrod = registro
        registrod.setUTCHours(registrod.getUTCHours() - 5)
        const prepareData = {
            IdCategory: { value: productDB.idCategory },
            Barcode: { value: productDB.barcodeProduct },
            NameProduct: { value: productDB.nameProduct },
            StockProduct: { value: productDB.stockProduct },
            PriceSellProduct: { value: productDB.priceSellProduct },
            PriceBuyProduct: { value: productDB.priceBuyProduct },
            DateProduct: { value: registrod },
            DescriptionProduct: { value: productDB.descriptionProduct },
            StateProduct: { value: productDB.stateProduct },
            IdProduct: { value: productDB.idProduct },
            spName: 'spUpdateProduct'
        }
        ipcRenderer.invoke('updateproductid', prepareData)
            .then((product: any) => {
                console.log(product)
                AlertSmall('success', 'Se han guardado los cambios con exito')
                history.push('/products')
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

    useEffect(() => {
        if (id !== 'null') {
            getProductsId()
            if (user.idRole === 3) {
                setEdit(true)
            }
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
                                disabled={edit}
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
                                disabled={edit}
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
                                disabled={edit}
                                label="Precio Venta"
                                className={classes.textField}
                                onChange={handleChange}
                                value={productDB.priceSellProduct || ''}
                                name="priceSellProduct"
                                type={'number'}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item md={6} xs={12}>
                            <div style={{ paddingBottom: 10 }}>
                                <TextField
                                    fullWidth
                                    required
                                    disabled={edit}
                                    label="Precio Compra"
                                    className={classes.textField}
                                    onChange={handleChange}
                                    value={productDB.priceBuyProduct || ''}
                                    name="priceBuyProduct"
                                    type={'number'}
                                    variant="outlined"
                                />
                            </div>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <InputLabel
                                            disableAnimation={false}
                                        >
                                            Estado
                                            </InputLabel>
                                        <Select
                                            fullWidth
                                            required
                                            disabled={edit}
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
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <InputLabel
                                            disableAnimation={false}
                                        >
                                            Categoria
                                            </InputLabel>
                                        <Select
                                            fullWidth
                                            required
                                            disabled={edit}
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
