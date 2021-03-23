import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import CardCategoriesCrud from '../../components/Cards/CardCategoriesCrud'
import CardCategoriesList from '../../components/Cards/CardCategoriesList'
import { useParams } from 'react-router-dom'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
}));

const Categories = () => {
    const classes = useStyles();
    const { idCategory } = useParams<{ idCategory: string }>();
    const [id, setId] = useState(idCategory)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        setId(idCategory)
    })

    return (
        <div className={classes.root}>
            { id ?
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <CardCategoriesList list={1} />
                    </Grid>
                    <Grid item xs={6}>
                        <CardCategoriesCrud idCategory={id} />
                    </Grid>
                </Grid>
                :
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <CardCategoriesList list={0} />
                    </Grid>
                    <Grid item xs={6}>
                        <CardCategoriesCrud idCategory={null} />
                    </Grid>
                </Grid>
            }
        </div>)
}
export default Categories
