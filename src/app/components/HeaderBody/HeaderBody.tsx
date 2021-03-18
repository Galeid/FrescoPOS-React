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
    }
}));

const HeaderBody = () => {
    const { user, setUser } = useContext(AuthContext)
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
        <Toolbar>
            <Typography variant="h6" className={classes.title}>
                <DateTime />
            </Typography>
            {
                user ?
                    <>
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
                <img src="https://img.icons8.com/bubbles/2x/login-rounded-right.png" width="40px" height="40px" className={classes.imagen} />
            </IconButton>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={open}
                onClose={handleClose}
                TransitionComponent={Fade}

            >
                <MenuItem onClick={handleClose}>Mi perfil (No disponible)</MenuItem>
                <MenuItem onClick={handleClose}>Mi cuenta (No disponible)</MenuItem>
                <MenuItem onClick={handleClickLogout}>Cerrar Sesion</MenuItem>
            </Menu>
        </Toolbar>

    );
}

export default HeaderBody;