import React from 'react';
import { Card, CardMedia, Typography, CardContent } from '@material-ui/core';
import { Theme, makeStyles } from '@material-ui/core/styles';

function CardsHeader(props: { titulo: any, texto: any, icono: any, url: any, color: any, onClick: any }){
    //var randomColor = Math.floor(Math.random() * 16777215).toString(16);
    const useStyles = makeStyles((theme: Theme) => ({
        root: {
            width: 300,
            height: 200,
            //backgroundColor: '#2A265F',
            backgroundColor: `#${props.color}`,
            borderRadius: 20,
            boxShadow: "3",
            display: 'flex',
            '&:hover': {
                opacity: 0.8,
            },
        },
        titulo: {
            opacity: 0.6,
            fontSize: 10,
            padding: 5,
            textAlign: 'center',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            color: '#fff'
        },
        texto1: {
            fontSize: 20,
            color: '#fff',
            margin: '10px 0',
            textDecoration: 'none'
        },
        texto2: {
            fontSize: 12,
            opacity: 0.6,
            color: '#fff',
            display: 'inline-block',
            margin: '10px 0',
            textDecoration: 'none',
            paddingLeft: theme.spacing(1),
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
            width: 151,
            backgroundColor: '#fff',
        },

    }));

    const classes = useStyles();
    return (
        <Card className={classes.root} onClick={props.onClick}>
            <div className={classes.details}>
                <CardContent className={classes.content}>
                    <div style={{ display: 'flex' }}>
                        {props.icono}
                        <Typography className={classes.titulo}>
                            Course
                        </Typography>
                    </div>
                    <Typography className={classes.texto1}>
                        {props.titulo}
                    </Typography>
                </CardContent>
                <div className={classes.controls}>
                    <Typography className={classes.texto2}>
                        {props.texto}
                    </Typography>
                </div>
            </div>
            <CardMedia
                component="img"
                title="Image"
                className={classes.cover}
                //image={props.url}
                image={props.url}
            />
        </Card>
    );
}

export default CardsHeader;