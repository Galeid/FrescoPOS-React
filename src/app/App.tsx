//React Libraries
import React, { useState, useMemo, useEffect } from 'react'
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
import SaleReports from './pages/SaleReports/SaleReports';
import UserCrud from './pages/UserCRUD/UserCrud';
import UserDetail from './pages/UserDetail/UserDetail';
import Categories from './pages/Categories/Categories';

//Context and Styles
import { AuthContext } from '../services/AuthContext';
import { makeStyles, createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import ShiftsList from './pages/ShiftsList/ShiftsList';
import RefundPage from './pages/RefundPage/RefundPage';
const { ipcRenderer } = window.require('electron')

const useStyles = makeStyles((theme) => ({
    app: {
        display: 'flex',
    },
    content: {
        flexGrow: 1,
        backgroundColor: 'white',
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

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#757ce8',
      main: '#3f50b5',
      dark: '#002884',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#E74C3C',
      dark: '#ba000d',
      contrastText: '#FDFEFE',
    },
  },
});

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

const App = () => {
    const [user, setUser] = useState(null);
    const [caja, setCaja] = useState(0);
    const [aux, setAux] = useState(true)

    useEffect(() => {
        console.log('c')
        getCash()
    }, [])

    useEffect(() => {
        if (!aux) {
            updateCash(caja)
        } else {
            setAux(false)
        }
    }, [caja])

    const updateCash = ( cajaVal: any) => {
        const prepareData = {
            Entry: { value: fillDecimals(cajaVal) },
            spName: 'spUpdateCash'
        }
        ipcRenderer.invoke('updatecash', prepareData)
            .then((message:any) => {
                console.log(message)
            })
    }

    const getCash = () => {
        console.log('a2')
        const prepareData = {
            spName: 'spGetCash'
        }
        ipcRenderer.invoke('getcash', prepareData)
            .then((cash:any) => {
                console.log(cash)
                setCaja(Number(cash[0].valueVariable))/////
            })
    }

    const authProviderValue = useMemo(() => ({ user, setUser, caja, setCaja }), [user, setUser, caja, setCaja])

    const classes = useStyles()

    return (
        <div className={classes.app}>
            <ThemeProvider theme={theme}>
                <AuthContext.Provider value={authProviderValue}>
                    <Router>
                        {user ?
                            <>
                                <Header />
                                <SideBar />
                            </>
                            : false
                        }
                        <div className={classes.content}>
                            <div className={classes.toolbar} />
                            <Switch>
                                <Route path="/categories" component={Categories} />
                                <Route path="/categoriesId/:idCategory" component={Categories} />
                                <Route path="/productsDetails/:idProduct" component={ProductCrud} />
                                <Route path="/products" component={ProductList} />
                                <Route path="/saleReports" component={SaleReports} />
                                <Route path="/sale" component={SalePage} />
                                <Route path="/usersDetails/:idUser" component={UserDetail} />
                                <Route path="/users" component={UserCrud}/>
                                <Route path="/shifts" component={ShiftsList}/>
                                <Route path="/refund/:idSale" component={RefundPage}/>
                                <Route path="/dashboard" component={MainPage} />
                                <Route path="/" exact={true} component={LoginPage} />
                            </Switch>
                        </div>
                    </Router>
                </AuthContext.Provider>
            </ThemeProvider>
        </div>
    )
}
//<Route path="/categoriesId/:idCategory" component={(props: {idCategory: any}) => <Categories {...props} />} />
export default App