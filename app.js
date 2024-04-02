// import express to create app,cors and requestloggeerjs
const express  = require('express');
const cors = require('cors');
const requestLogger = require('./utils/requestLogger.js');

// import routers
const authRouter = require('./routes/authRouter.js');
const userRouter = require('./routes/userRouter.js') ;
const urlRouter = require('./routes/urlRouter.js');

// create app using express
const app = express();

// import middlewares cors,logger and jsonparser
app.use(express.json());
app.use(cors());
app.use(requestLogger);

// import root routes and main routes
app.use('/api',authRouter);
app.use('/user',userRouter);
app.use('/url',urlRouter);

// export app
module.exports = app;