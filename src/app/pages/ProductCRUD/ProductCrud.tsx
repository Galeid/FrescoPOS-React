import React from "react";
import {
    Container,
    Grid,
    makeStyles
} from '@material-ui/core';
//import CardProduct from '../../components/Cards/CardProduct'
import CardProductDetails from '../../components/Cards/CardProductDetails'
import { useParams } from 'react-router-dom'

const useStyles = makeStyles((theme) => ({
    root: {
        margin: '10px',
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    }
}));

const ProductCrud = () => {
    const classes = useStyles();
    const { idProduct } = useParams<{ idProduct: string }>();
    return (
        <Grid
            className={classes.root}
        >
            <Container maxWidth="lg">
                <Grid
                    container
                    spacing={3}
                >
                    <Grid
                        item
                        lg={12} //8
                        md={12} //6
                        xs={12}//12
                    >
                        {
                            idProduct ?
                                <CardProductDetails idProduct={idProduct} />
                                :
                                <CardProductDetails idProduct={null} />
                        }
                    </Grid>
                </Grid>
            </Container>
        </Grid>
    )
}

export default ProductCrud