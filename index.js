// import mongoose,app,config,logger
const  mongoose = require('mongoose');
const app = require('./app.js');
const config = require('./utils/config.js');
const {Info,Error} = require('./utils/logger.js');

// mongodb strictquery false
mongoose.set('strictQuery',false);

// connect to mongodb
Info('connecting to mongodb ...',config.MongoDb_Url);
mongoose.connect(config.MongoDb_Url).then(
    () => {
        Info("Mongo db connected successfully");

        // using listener 
        app.listen(config.Port,() => {
            Info( `Server is running at http://localhost:${config.Port}` );
        });

    }
).catch( (err) => {
    Error('Error while connecting Mongo Db...',err);
});