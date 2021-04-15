import React, { useState } from 'react'
import { Button, TextField, Grid, Card, CardMedia, Typography, CardContent } from '@material-ui/core'
import { Theme, makeStyles } from '@material-ui/core/styles'
import url from '../../../assets/Dashboard/624.jpg'
import urlCard from '../../../assets/Dashboard/BackgroundCardWelcome.jpg'

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
        color: '#fff'
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
        margin: '10px 0',
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
        backgroundColor: '#fff'
    },
}));

function CardsHeader(props: { user: any, }) {

    const [userName, setUserName] = useState("asdf");

    const classes = useStyles();
    var days = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
    let d = new Date();
    let mo = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(d);
    let da = new Intl.DateTimeFormat('es-ES', { day: '2-digit' }).format(d);
    var dayName = days[new Date().getDay()];

    const updateUserName = (e: any) => {
        setUserName(e.target.value);
    };

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
                                <Typography className={classes.titulo}>
                                    Bienvenido {props.user.nameUser}
                                </Typography>
                                {props.user.idRole == 1 ?
                                    <>
                                        <Grid container item={true} className={classes.gridCenter} >
                                            <Grid item xs={9}>
                                                <TextField
                                                    variant="outlined"
                                                    value={userName}
                                                    size="small"
                                                    className={classes.textField}
                                                    onChange={updateUserName}
                                                />
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Button variant="contained" color="primary">Hola</Button>
                                            </Grid>
                                        </Grid>
                                        <Grid container item={true} className={classes.gridCenter} >
                                            <Grid item xs={9}>
                                                <TextField
                                                    variant="outlined"
                                                    value={userName}
                                                    size="small"
                                                    className={classes.textField}
                                                    onChange={updateUserName}
                                                />
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Button variant="contained" color="primary">Hola</Button>
                                            </Grid>
                                        </Grid>
                                    </>
                                    :
                                    <>
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