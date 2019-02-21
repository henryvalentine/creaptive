/**
 * Created by Jack V on 9/4/2017.
 */
import express from 'express';
import bodyParser from 'body-parser';
import registerModels from './models';
import path from 'path';
import { graphqlExpress } from 'apollo-server-express'; 
import creaptiveGraphQLSchema from './graphql';
import connectMongo from 'connect-mongo';
import session from 'express-session';
import "babel-polyfill";
import serviceEndpoints from './routes';
import webpack from 'webpack';
import cookieParser from 'cookie-parser';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackHotServerMiddleware from 'webpack-hot-server-middleware';
import clientConfig from '../webpack/client.dev';
import serverConfig from '../webpack/server.dev';
import passport from 'passport';
import config from './common/config';
import Jwt from 'jsonWebToken'; 
const publicPath = clientConfig.output.publicPath;
const outputPath = clientConfig.output.path;
const DEV = process.env.NODE_ENV === 'development';
const MongoStore = connectMongo(session);
import bulkUpload from './routes/bulkUpload';
import io from './routes/io';

import mongoose from 'mongoose';
// import packageTypeService from "./routes/packageTypeService";
mongoose.Promise = Promise;
registerModels(mongoose);
// mongoose.connection.openUri('mongodb://localhost:27017/creaptive', { config: { autoIndex: false }});
mongoose.connect("mongodb://localhost:27017/creaptive", {config: { autoIndex: false }, useNewUrlParser: true });

//Instantiate connect-mongo for session storage to re-use db connection
// let sessionStore = new MongoStore({url: 'mongodb://localhost:27017/creaptive'}); //{mongooseConnection: dbConnection}

// Initialize http server
let app = express();
// Launch the server on available port
global.appPort = process.env.PORT || 80;

//(Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests
app.all('*', function(req, res, next)
{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header ('Access-Control-Allow-Headers', 'Origin, X-Requested-With, X-AUTHENTICATION, X-IP, Content-Type, Accept');
    res.header ('Access-Control-Allow-Credentials', true);
    res.header ('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(bodyParser.text({ type: 'application/graphql' }));

process.on('unhandledRejection', error => 
{
    console.log('unhandledRejection', error);
    console.log('Logged the error');
});

// JWTOKEN COOKIE
app.use(cookieParser());

//use connect-mongo client with the instantiated options for session management
// app.use(session({
//     secret: '3w0or3efgkh5a7rqd',
//     ttl: 14 * 24 * 60 * 60, // 14 days
//     // cookie: {maxAge: 3600000*24*14, secure : false},
//     resave: false,
//     saveUninitialized: false,
//     store: sessionStore
// }));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) =>
{
    if(!req.cookies || !req.cookies.jwToken)
    {
        let tokenData =
        {
          browser: 'jdbvgtfrre',
          id: 'rtgggbhjk'
        };
        const jwToken = Jwt.sign(tokenData, config.key.privateKey);
        res.cookie('jwToken', jwToken, { maxAge: 4800000 });
        req.cookies.jwToken = jwToken;
    }
    else
    {
        const cookie = req.cookies.jwToken;
        Jwt.verify(cookie, config.key.privateKey, (err, decoded) =>
        {
            if(err)
            {
                console.log('\nJWT.VERIFY\n');
                console.log(err);
                let tokenData =
                {
                    browser: 'jdbvgtfrre',
                    id: 'rtgggbhjk'
                };
                const jwToken = Jwt.sign(tokenData, config.key.privateKey);
                res.cookie('jwToken', jwToken, { maxAge: 4800000 });
                req.cookies.jwToken = jwToken;

            }
        });
    }
  next()
});

// bodyParser is needed just for POST.
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: creaptiveGraphQLSchema(mongoose)}));

//Service EndPoints
serviceEndpoints(app, mongoose);
//----------------------------  END POINTS -----------------------

//serve up static files
app.use(express.static(path.resolve('client')));
app.use(express.static(path.resolve('client/ui')));

app.use((err, req, res, next) =>
{
    console.error(err);
    console.error(err.stack);
    res.status(err.status || 500).send(err.message || 'Internal server error.');
});

//make files upload directories global
global.__filedir = path.join(__dirname, 'client/flt').replace('/server', '').replace('\\server', '');
global.__resourcedir = path.join(__dirname, 'client/resources').replace('/server', '').replace('\\server', '');

//File management
app.post('/uploadCountries', bulkUpload.uploadCountryBulk);


// UNIVERSAL HMR + STATS HANDLING GOODNESS:

if (DEV) 
{
    const multiCompiler = webpack([clientConfig, serverConfig]);
    const clientCompiler = multiCompiler.compilers[0];  
    app.use(webpackDevMiddleware(multiCompiler, { publicPath }));
    app.use(webpackHotMiddleware(clientCompiler));
    app.use(
      // keeps serverRender updated with arg: { clientStats, outputPath }
      webpackHotServerMiddleware(multiCompiler, {
        serverRendererOptions: { outputPath }
      })
    )
  }
  else {
    const clientStats = require('../client/ui/stats.json'); // eslint-disable-line import/no-unresolved
    const serverRender = require('../buildServer/main.js').default; // eslint-disable-line import/no-unresolved
  
    app.use(publicPath, express.static(outputPath));
    app.use(serverRender({ clientStats, outputPath }))
  }

const server = app.listen(global.appPort, () =>
{
    console.log(`Express is listening at ` + global.appPort);
});

io(app, mongoose, server);

module.exports = app;