import React, { useState, useEffect } from 'react'
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom'
//import Icon from '@material-ui/core/Icon';
import { Delete, Edit } from '@material-ui/icons';
import AlertSmall from '../Alert/AlertSmall'
import AlertBig from '../Alert/AlertBig'
import {
    Button,
    Box,
    Card,
    CardContent,
    TextField,
    InputAdornment,
    SvgIcon,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow
} from '@material-ui/core';
import Search from '@material-ui/icons/Search';
const { ipcRenderer } = window.require('electron')

interface Category {
    idCategory: string,
    nameCategory: string,
    descriptionCategory: string
}
let categoriesFromDB: Category[] = []

const useStyles = makeStyles(() => ({
    root: {
        flexGrow: 1,
        margin: '10px',
    },
    container: {
        paddingTop: '40px',
        alignItems: 'center'
    },
    containerTabla: {
        margin: '10px',
        alignItems: 'center'
    },
    nomargin: {
        margin: 0
    },
    rootbutton: {
        minWidth: 'auto',
        padding: '6px 8px 6px 8px'
    }
}));

const CategoriesList = (props: { list: any; }) => {
    const classes = useStyles();
    let history = useHistory();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [show, showCategories] = useState(false)
    const [input, setInput] = useState('')  
    const [categoryDB, setCategoryDB] = useState(categoriesFromDB)
    const [alert, setAlert] = useState(0);

    const getCategories = () => {
        const prepareData = {
            spName: 'spListCategories'
        }
        ipcRenderer.invoke('getcategories', prepareData)
            .then((categories: any) => {
                setCategoryDB(categories)
                showCategories(true)
            })
    }

    const deleteCategory = (id: string) => {
        AlertBig('Estas seguro de eliminar la categoria?', 'La categoria sera eliminada de la lista!', 'warning', 'Si, deseo eliminarlo!').then((result: any) => {
            if (result.isConfirmed) {
                const prepareData = {
                    Entry: {
                        value: id
                    },
                    spName: 'spDeleteCategory'
                }
                ipcRenderer.invoke('deletecategory', prepareData)
                    .then(() => {
                        AlertSmall('info', 'Se elimino correctamente')
                        getCategories()
                        setPage(0)
                    })
            }
        })
    }

    const handleChange = (e: any) => {
        setInput(e.target.value)
    }

    const handleChangePage = (e: any, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (e: any) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    useEffect(() => {
        const getSearchCategory = () => {
            const prepareData = {
                Entry: {
                    value: input
                },
                spName: 'spSearchCategories'
            }
            ipcRenderer.invoke('searchcategories', prepareData)
                .then((products: any) => {
                    setCategoryDB(products)
                    if (categoriesFromDB.length > 0) {
                        console.log("1. categoriesFromDB: ", categoriesFromDB)
                        showCategories(true)
                    }
                })
        }
        if (input.length > 2) {
            getSearchCategory()
            setPage(0);
            setAlert(1)
        } else {
            getCategories()
            setAlert(0)
        }
    }, [input])

    useEffect(() =>{
        getCategories()
    }, [props])

    return show ? (
        <>
            <Card className={classes.root}>
                <Box flexDirection="row-reverse">
                    <Card>
                        <CardContent>
                            <Typography variant="h5" component="h2" style={{ marginBottom: '8px' }}>Lista de Categorias:</Typography >
                            <TextField
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" style={{ padding: '0px 0px' }}>
                                            <SvgIcon
                                                fontSize="small"
                                                color="action"
                                            >
                                                <Search />
                                            </SvgIcon>
                                        </InputAdornment>
                                    )
                                }}
                                inputProps={{
                                    style: { padding: '12px 0px' }
                                }}
                                placeholder="Buscar categorias"
                                variant="outlined"
                                helperText={alert ? "" : "Ingresa un minimo de 3 letras para comenzar la busqueda"}
                                onChange={handleChange}
                                value={input}
                            />
                        </CardContent>
                    </Card>
                </Box>
            </Card>
            <Card className={classes.root}>
                <Grid item xs={12} className={classes.containerTabla}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">Nombre</TableCell>
                                    <TableCell align="center">Descripcion</TableCell>
                                    <TableCell align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {categoryDB
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((p, index) => (
                                        <TableRow key={index}>
                                            <TableCell align="center">{p.nameCategory}</TableCell>
                                            <TableCell align="center">{p.descriptionCategory ?
                                                p.descriptionCategory
                                                :
                                                'No hay notas'
                                            }
                                            </TableCell>
                                            <TableCell align="center">
                                                <Grid container spacing={3}>
                                                    <Grid
                                                        item
                                                        xs={6} //12
                                                    >
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            startIcon={<Edit />}
                                                            classes={{
                                                                startIcon: classes.nomargin,
                                                                root: classes.rootbutton
                                                            }}
                                                            onClick={() => {
                                                                //console.log('idCategory: ', p.idCategory)
                                                                history.push(`/categoriesId/${p.idCategory}`)
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid
                                                        item
                                                        xs={6} //12
                                                    >
                                                        <Button
                                                            variant="contained"
                                                            color="secondary"
                                                            onClick={() =>
                                                                deleteCategory(p.idCategory)
                                                            }
                                                            classes={{
                                                                startIcon: classes.nomargin,
                                                                root: classes.rootbutton
                                                            }}
                                                            startIcon={<Delete />}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={categoryDB.length}
                        //count={productDB.length === -1 ? 1 * 10 + 1 : productDB.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        //page={( page > 0 && productDB.length === rowsPerPage ) ? 0 : page}
                        onChangePage={handleChangePage}
                        onChangeRowsPerPage={handleChangeRowsPerPage}
                    />
                </Grid>
            </Card>
        </>
    ) : (<></>)
}
export default CategoriesList