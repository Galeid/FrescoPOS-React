//React Libraries
import React, { useState, useMemo } from 'react'
import { HashRouter as Router, Switch, Route } from 'react-router-dom';

//Components Used
import Header from './components/Header/Header';
import SideBar from './components/SideBar/SideBar';

//Page Components
import ProductList from './pages/ProductList/ProductList';
import ProductCrud from './pages/ProductCRUD/ProductCrud';
import LoginPage from './pages/LoginPage/LoginPage';
import MainPage from './pages/Dashboard/Dashboard';
import SalePage from './pages/SalePage/SalePage';
import Categories from './pages/Categories/Categories';
//import CategoriesId from './components/Cards/CardCategoriesCrud';

//Context and Styles
import { AuthContext } from '../services/AuthContext';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    app: {
        display: 'flex',
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(3),
    },
    '@global': {
        '*::-webkit-scrollbar': {
            width: '0.6em'
        },
        '*::-webkit-scrollbar-track': {
            '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)'
        },
        '*::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,.1)',
            outline: '1px solid slategrey'
        }
    },
    toolbar: theme.mixins.toolbar,
}));

const App = () => {
    const [user, setUser] = useState(null);
    const authProviderValue = useMemo(() => ({ user, setUser }), [user, setUser])

    const classes = useStyles()

    return (
        <div className={classes.app}>
            <AuthContext.Provider value={authProviderValue}>
                <Router>
                    {
                        user ?
                            <>
                                <Header />
                                <SideBar />
                            </>
                            :
                            false
                    }
                    <div className={classes.content}>
                        <div className={classes.toolbar} />
                        <Switch>
                            <Route path="/categories" component={Categories} />
                            <Route path="/categoriesId/:idCategory" component={Categories} />
                            <Route path="/productsDetails/:idProduct" component={ProductCrud} />
                            <Route path="/products" component={ProductList} />
                            <Route path="/sale" component={SalePage} />
                            <Route path="/dashboard" component={MainPage} />
                            <Route path="/" exact={true} component={LoginPage} />
                        </Switch>
                    </div>
                </Router>
            </AuthContext.Provider>
        </div>
    )
}
//<Route path="/categoriesId/:idCategory" component={(props: {idCategory: any}) => <Categories {...props} />} />
export default App