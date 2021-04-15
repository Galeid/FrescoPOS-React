import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Menu, MenuItem, Toolbar, IconButton, Typography } from '@material-ui/core';
import { AuthContext } from '../../../services/AuthContext';
import { useHistory } from 'react-router-dom'
import DateTime from '../DateTime/DateTime'
import Fade from '@material-ui/core/Fade';

const useStyles = makeStyles(() => ({
    title: {
        flexGrow: 1
    },
    imagen: {
        borderRadius: '50%'
    },
    name: {
        alignContent: 'right'
    },
    toolbar:{
        backgroundColor: '#3c3c3c',
    },
    caja: {
        marginRight: '48px',
    }
}));

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

const HeaderBody = () => {
    const { user, setUser, caja } = useContext(AuthContext)
    const classes = useStyles();
    let history = useHistory()
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    function handleClickLogout() {
        setUser('')
        history.push('/')
    }

    return (
        <Toolbar className={classes.toolbar}>
            <Typography variant="h6" className={classes.title}>
                <DateTime />
            </Typography>
            {
                user ?
                    <>
                        <Typography variant="h6" className={classes.caja}>S/ {fillDecimals(caja)}</Typography>
                        <Typography variant="h6" className={classes.name}>
                            {user.nameUser.charAt(0).toUpperCase() + user.nameUser.substring(1)}
                        </Typography>
                    </>
                    :
                    <Typography variant="h6" className={classes.name}>
                        No deberias estar
                    </Typography>
            }
            <IconButton color="inherit"
                aria-controls="fade-menu" aria-haspopup="true" onClick={handleClick} >
                <img src="https://img.icons8.com/bubbles/2x/login-rounded-right.png" width="40px" height="40px" className={classes.imagen} alt={''}/>
            </IconButton>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={open}
                onClose={handleClose}
                TransitionComponent={Fade}
            >
                <MenuItem onClick={handleClose}>Mi cuenta (No disponible)</MenuItem>
                <MenuItem onClick={handleClickLogout}>Cerrar Sesion</MenuItem>
            </Menu>
        </Toolbar>

    );
}

export default HeaderBody;