import React, { useState, useContext } from 'react'
import { Button, TextField, Grid, Card, CardMedia, Typography, CardContent } from '@material-ui/core'
import { Theme, makeStyles } from '@material-ui/core/styles'
import url from '../../../assets/Dashboard/624.jpg'
import urlCard from '../../../assets/Dashboard/BackgroundCardWelcome.jpg'

import AlertSmall from '../../../components/Alert/AlertSmall'

import { AuthContext } from '../../../../services/AuthContext';

const { ipcRenderer } = window.require('electron')

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        width: 'auto',
        height: 200,
        //background: 'linear-gradient(45deg, #ffcc5c 20%, #3c3c3c 20% 50%, #ff6f69 50% 80%, #96ceb4 80%)',
        backgroundImage: `url(${urlCard})` ,
        borderRadius: 20,
        boxShadow: "3",
        display: 'flex',
        padding: 'auto',
    },
    titulo: {
        fontSize: 20,
        textAlign: 'left',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: '8px'
    },
    texto1: {
        opacity: 0.9,
        fontSize: 20,
        color: '#fff',
        margin: '10px 0',
        textDecoration: 'none'
    },
    texto2: {
        fontSize: 12,
        color: '#fff',
        display: 'inline-block',
        margin: '2px 0',
        textDecoration: 'none',
        paddingLeft: theme.spacing(1),
    },
    texto3: {
        opacity: 0.9,
        fontSize: 16,
        color: '#fff',
        textDecoration: 'none'
    },
    content: {
        flex: '1 0 auto',
    },
    details: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    controls: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
    cover: {
        width: 250,
    },
    gridCenter: {
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        justifyItems: 'center',
        padding: 3
    },
    textField: {
        borderRadius: 5,
        backgroundColor: '#fff',
        marginRight:'8px'
    },
}));

const round2Decimals = (num: any) => {
    return Math.round((num + Number.EPSILON) * 100) / 100
 }

function CardsHeader(props: { user: any, }) {
    const { user, caja, setCaja } = useContext(AuthContext)
    const [cajaRet, setCajaRet] = useState(0)
    const [cajaRec, setCajaRec] = useState(0)

    const classes = useStyles();
    var days = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
    let d = new Date();
    let mo = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(d);
    let da = new Intl.DateTimeFormat('es-ES', { day: '2-digit' }).format(d);
    var dayName = days[new Date().getDay()];

    const updateRetirar = (e: any) => {
        setCajaRet(e.target.value);
    };

    const updateRecargar = (e: any) => {
        setCajaRec(e.target.value);
    };

    const recargarCaja = () => {
        checkLastShift('recargar')
    }

    const retirarCaja = () => {
        checkLastShift('retirar')
    }

    const checkLastShift = (val: string) => {
        const prepareData = {
           spName: 'spCheckLastShift'
        }
        ipcRenderer.invoke('checklastshift', prepareData)
           .then((shift: any) => {
              if (shift[0].endShift) {
                 AlertSmall('error', 'Se tiene que iniciar turno para poder recargar/retirar la caja.')
              } else {
                registerActivity(shift[0].idShift, val) 
              }
           })
    }

    const registerActivity = (idshift: any, val: string) => {
        let dateval: Date = new Date();
        dateval.setUTCHours(dateval.getUTCHours() - 5)
        let res = 0
        let isRet = false
        if (val === 'retirar') {
            isRet = true
            res = round2Decimals(caja - Number(cajaRet))
        } else if (val === 'recargar') {
            res = round2Decimals(caja + Number(cajaRec))
        }
        const prepareData = {
           Idshift: { value: idshift },
           Iduser: { value: user.idUser },
           Name: { value: isRet ? 'Retiro': 'Recarga' },
           Amount: { value: isRet ? cajaRet : cajaRec },
           Operator: { value: isRet ? '-' : '+' },
           Result: { value: res },
           Idmovement: { value: null },
           Date: { value: dateval },
           spName: 'spInsertActivity'
        }
        ipcRenderer.invoke('insertactivity', prepareData)
           .then((msg: any) => {
              console.log(msg + 'Actividad creada de Recarga/Retiro')
              setCaja(res)
              if (val === 'retirar') {
                setCajaRet(0)
              } else if (val === 'recargar') {
                setCajaRec(0)
              }
           })
    }
    
    return (
        <>
            <Grid container item={true} xs={12} spacing={1} justify="center" direction="row" alignItems="center">
                <Grid item xs={8}>
                    <Card className={classes.root} >
                        <div className={classes.details}>
                            <CardContent className={classes.content}>
                                <Typography className={classes.titulo}>
                                    Bienvenido al Dashboard
                                </Typography>
                                <Typography className={classes.texto1}>
                                    {`${dayName}, ${mo.charAt(0).toUpperCase() + mo.slice(1)} ${da}`}
                                </Typography>
                            </CardContent>
                            <div className={classes.controls}>
                                <Typography className={classes.texto2}>
                                    Fase Beta del Programa
                                </Typography>
                            </div>
                        </div>
                        <CardMedia
                            component="img"
                            title="Image"
                            className={classes.cover}
                            src={url}
                        />
                    </Card>
                </Grid>
                <Grid item xs={4}>
                    <Card className={classes.root} >
                        <div className={classes.details}>
                            <CardContent className={classes.content}>
                                {props.user.idRole === 1 ?
                                    <>
                                        <Typography className={classes.titulo}>
                                            Acciones de Caja
                                        </Typography>
                                        <Grid container item={true} className={classes.gridCenter} >
                                            <Grid item xs={7}>
                                                <TextField
                                                    variant="outlined"
                                                    value={cajaRec}
                                                    size="small"
                                                    className={classes.textField}
                                                    onChange={updateRecargar}
                                                    type="number"
                                                    InputProps={{ inputProps: { min: 0 } }}
                                                    onFocus={event => event.target.select()}
                                                    fullWidth
                                                />
                                            </Grid>
                                            <Grid item xs={5}>
                                                <Button variant="contained" color="primary" fullWidth onClick={recargarCaja}>Recargar</Button>
                                            </Grid>
                                        </Grid>
                                        <Grid container item={true} className={classes.gridCenter} >
                                            <Grid item xs={7}>
                                                <TextField
                                                    variant="outlined"
                                                    value={cajaRet}
                                                    size="small"
                                                    className={classes.textField}
                                                    onChange={updateRetirar}
                                                    type="number"
                                                    onFocus={event => event.target.select()}
                                                    InputProps={{ inputProps: { min: 0, max: parseInt(caja) } }}
                                                    fullWidth
                                                />
                                            </Grid>
                                            <Grid item xs={5}>
                                                <Button variant="contained" color="primary" fullWidth onClick={retirarCaja}>Retirar</Button>
                                            </Grid>
                                        </Grid>
                                    </>
                                    :
                                    <>
                                        <Typography className={classes.titulo}>
                                            Datos del usuario:
                                        </Typography>
                                        <Typography className={classes.texto3}>
                                            Correo: {props.user.emailUser}
                                        </Typography>
                                        <Typography className={classes.texto3}>
                                            {props.user.typedocUser}: {props.user.numdocUser}
                                        </Typography>
                                        <Typography className={classes.texto3}>
                                            Cel: {props.user.phoneUser}
                                        </Typography>
                                    </>}
                            </CardContent>
                            <div className={classes.controls}>
                                <Typography className={classes.texto2}>
                                    Estado de la cuenta: {props.user.stateUser ? 'Activo' : 'Inactivo'}
                                </Typography>
                            </div>
                        </div>
                    </Card>
                </Grid>
            </Grid>
        </>
    );
}

export default CardsHeader;