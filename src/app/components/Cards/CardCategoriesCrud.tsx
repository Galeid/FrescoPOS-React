import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom'
import AlertSmall from '../Alert/AlertSmall'
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Grid,
    TextField
} from '@material-ui/core';
const { ipcRenderer } = window.require('electron')

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
}));

const CategoriesCrud = (props: { idCategory: any; }) => {
    let id = props.idCategory;
    let history = useHistory();
    const classes = useStyles();
    const [categoryDB, setCategoryDB] = useState({
        idCategory: '',
        nameCategory: '',
        descriptionCategory: ''
    })

    const getCategoriesId = () => {
        const prepareData = {
            Entry: { value: props.idCategory },
            spName: 'spSearchIdCategory'
        }
        ipcRenderer.invoke('searchidcategory', prepareData)
            .then((category: any) => {
                setCategoryDB(category[0])
            })
    }

    const cleanInputs = () => {
        setCategoryDB({
            ...categoryDB,
            idCategory: '',
            nameCategory: '',
            descriptionCategory: ''
        })
        id = false
        history.replace(`/categories`)
    }

    const insertCategory = () => {
        const prepareData = {
            NameCategory: { value: categoryDB.nameCategory },
            DescriptionCategory: { value: categoryDB.descriptionCategory },
            spName: 'spInsertCategory'
        }
        if (categoryDB.nameCategory !== '') {
            ipcRenderer.invoke('insertcategory', prepareData)
                .then((category: any) => {
                    console.log(category)
                    cleanInputs()
                    AlertSmall('success', 'Se agrego la categoria con exito')
                }).catch((err: any) => AlertSmall('error', `Ha ocurrido un error, ${err}`))
        } else {
            AlertSmall('error', 'Debe llenar el campo de nombre primero')
        }
    }

    const updateCategoryId = () => {
        const prepareData = {
            NameCategory: { value: categoryDB.nameCategory },
            DescriptionCategory: { value: categoryDB.descriptionCategory },
            IdCategory: { value: categoryDB.idCategory },
            spName: 'spUpdateCategory'
        }
        ipcRenderer.invoke('updatecategoryid', prepareData)
            .then((category: any) => {
                console.log(category)
                cleanInputs()
                AlertSmall('success', 'Se han guardado los cambios con exito')
            }).catch((err: any) => console.log(err))
        //poenr alerta
    }

    const handleChange = (event: any) => {
        setCategoryDB({
            ...categoryDB,
            [event.target.name as string]: event.target.value as string
        });
    };

    useEffect(() => {
        if (id !== null) {
            getCategoriesId()
        }
        // eslint-disable-next-line
    }, [id])

    return (
        <form
            autoComplete="off"
            noValidate
            onSubmit={e => { e.preventDefault(); }}
        >
            <Card className={classes.root}>
                <CardHeader
                    title={id !== null ? 'Editar Categoria' : 'Insertar Categoria'}
                />
                <Divider />
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item md={12} xs={12}>
                            <TextField
                                fullWidth
                                label="Nombre"
                                onChange={handleChange}
                                value={categoryDB.nameCategory || ''}
                                name="nameCategory"
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="Descripcion"
                                onChange={handleChange}
                                value={categoryDB.descriptionCategory || ''}
                                placeholder={categoryDB.descriptionCategory || 'No hay descripcion'}
                                name="descriptionCategory"
                                variant="outlined"
                                multiline
                                rows={4}
                                rowsMax={4}
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
                                color="primary"
                                variant="contained"
                                onClick={() => {
                                    id !== null ? updateCategoryId() : insertCategory()
                                }}
                            >
                                {id !== null ? 'Editar' : 'Insertar'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Card>
        </form >)
}
export default CategoriesCrud
