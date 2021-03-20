const Connection = require("tedious").Connection
const Request = require("tedious").Request

const { ipcMain } = require('electron')
const TYPES = require('tedious').TYPES;

const connectToServer = () => {
   return new Promise((resolve, reject) => {
       const config = {
           server: process.env.DB_SERVER,
           authentication: {
               type: process.env.DB_AUTHTYPE,
               options: {
                   userName: process.env.DB_USERNAME,
                   password: process.env.DB_PASSWORD
               }
           },
           options: {
               port: Number(process.env.DB_PORT),
               database: process.env.DB_DBNAME,
               encrypt: false,
               trustServerCertificate: false,
               rowCollectionOnDone: true
           }
       }
       let connection = new Connection(config)
       connection.connect()
       connection.on('connect', function (err) {
           if (err) {
               console.log('Error: ', err)
               reject(err)
           } else {
               console.log('Connection Successful!')
               resolve(connection)
           }
       })
       connection.on('end', () => { console.log("Connection Closed!") })
   })
}

const addParams = (request, args) => {
   for (const param in args) {
       if (param == 'spName') {
           return
       }
       request.addParameter(param, args[param].type, args[param].value)
   }
}

const readDB = (connection, args) => {
   return new Promise((resolve, reject) => {
      let objects = []
      console.log('Reading rows from the Table...')
      let request = new Request(args.spName, (err, rowCount, rows) => {
          console.log(args.spName)
          if (err) {
              reject(err)
          } else {
              resolve(objects)
              connection.close()
          }
      })
      request.on('doneInProc', (rowCount, more, rows) => {
          objects = []
          console.log('readDB(): ' + rows.length + ' rows readed from DB')
          rows.map(row => {
              let result = {}
              row.map(child => {
                  result[child.metadata.colName] = child.value
              })
              objects.push(result)
          })
      })
      addParams(request, args)
      connection.callProcedure(request)
  })
}

const updateDb = (connection, args) => {
   return new Promise((resolve, reject) => {
      let message = ''
      console.log('Updating rows from the Table...')
      let request = new Request(args.spName, (err, rowCount, rows) => {
          console.log(args.spName)
          if (err) {
              reject(err)
          } else {
              resolve(message)
              connection.close()
          }
      })
      request.on('doneInProc', (rowCount, more, rows) => {
          message = 'updateDB(): DB updated'
          console.log(rows.length + " done in proc rows")
      })
      addParams(request, args)
      connection.callProcedure(request)
  })
}

///////////////////////////////////////////////////////////

const getProducts = (event, args) => {
    return new Promise((resolve, reject) => {
        connectToServer()
            .then(connection => {
                return readDB(connection, args)
            })
            .then(products => resolve(products))
            .catch(err => reject(err))
    })
}

const validateUser = (event, args) => {
    return new Promise((resolve, reject) => {
        connectToServer()
            .then(connection => {
                args.Nameuser.type = TYPES.NVarChar
                args.Passworduser.type = TYPES.NVarChar
                return readDB(connection, args)
            })
            .then(user => resolve(user))
            .catch(err => reject(err))
    })
}

const searchProducts = (event, args) => {
    return new Promise((resolve, reject) => {
        connectToServer()
            .then(connection => {
                args.Entry.type = TYPES.NVarChar
                return readDB(connection, args)
            })
            .then(products => resolve(products))
            .catch(err => reject(err))
    })
}

const searchExactProduct = (event, args) => {
    return new Promise((resolve, reject) => {
        connectToServer()
            .then(connection => {
                args.Entry.type = TYPES.NVarChar
                return readDB(connection, args)
            })
            .then(product => resolve(product))
            .catch(err => reject(err))
    })
}

const createSale = (event, args) => {
    return new Promise((resolve, reject) => {
        connectToServer()
            .then(connection => {
                args.Iduser.type = TYPES.Int
                args.Nameclient.type = TYPES.NVarChar
                args.Voucher.type = TYPES.NVarChar
                args.Date.type = TYPES.Date
                args.Qproduct.type = TYPES.Int
                args.Discount.type = TYPES.Float
                args.Cash.type = TYPES.Float
                args.Tax.type = TYPES.Float
                args.Subtotal.type = TYPES.Float
                args.Change.type = TYPES.Float
                args.Waytopay.type = TYPES.NVarChar
                return readDB(connection, args)
            })
            .then(scope => resolve(scope))
            .catch(err => reject(err))
    })
}

const createOrder = (event, args) => {
    return new Promise((resolve, reject) => {
        connectToServer()
            .then(connection => {
                args.Idproduct.type = TYPES.Int
                args.Idsale.type = TYPES.Int
                args.Quantity.type = TYPES.Float
                return updateDb(connection, args)
            })
            .then(message => resolve(message))
            .catch(err => reject(err))
    })
}

const updateProductId = (event, args) => {
    return new Promise((resolve, reject) => {
        connectToServer()
        .then(connection => {
            args.Barcode.type = TYPES.NVarChar
            args.NameProduct.type = TYPES.NVarChar
            args.StockProduct.type = TYPES.NVarChar
            args.PriceProduct.type = TYPES.NVarChar
            args.DateProduct.type = TYPES.Date
            args.DescriptionProduct.type = TYPES.NVarChar
            args.StateProduct.type = TYPES.NVarChar
            args.IdProduct.type = TYPES.Int
            return updateDb(connection, args)
        })
        .then(message => resolve(message))
        .catch(err => reject(err))
    })
}

const searchIdProduct = (event, args) => {
    return new Promise((resolve, reject) => {
        connectToServer()
            .then(connection => {
                args.Entry.type = TYPES.NVarChar
                return readDB(connection, args)
            })
            .then(product => resolve(product))
            .catch(err => reject(err))
    })
}

const insertProduct = (event, args) => {
    return new Promise((resolve, reject) => {
        connectToServer()
        .then(connection => {
            console.log('insert')
            args.Barcode.type = TYPES.NVarChar
            args.NameProduct.type = TYPES.NVarChar
            args.StockProduct.type = TYPES.NVarChar
            args.PriceProduct.type = TYPES.NVarChar
            args.DateProduct.type = TYPES.Date
            args.DescriptionProduct.type = TYPES.NVarChar
            args.StateProduct.type = TYPES.NVarChar
            console.log('args: ', args)
            return updateDb(connection, args)
        })
        .then(message => resolve(message))
        .catch(err => reject(err))
    })
}

const deleteProduct = (event, args) => {
    return new Promise((resolve, reject) => {
        connectToServer()
            .then(connection => {
                args.Entry.type = TYPES.NVarChar
                return readDB(connection, args)
            })
            .then(product => resolve(product))
            .catch(err => reject(err))
    })
}

ipcMain.handle('getproducts', getProducts)
ipcMain.handle('validateuser', validateUser)
ipcMain.handle('searchproducts', searchProducts)
ipcMain.handle('searchexactproduct', searchExactProduct)
ipcMain.handle('searchidproduct', searchIdProduct)
ipcMain.handle('createsale', createSale)
ipcMain.handle('createorder', createOrder)
ipcMain.handle('updateproductid', updateProductId)
ipcMain.handle('insertproduct', insertProduct)
ipcMain.handle('deleteproduct', deleteProduct)