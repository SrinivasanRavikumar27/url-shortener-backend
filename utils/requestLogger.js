// import logger js
const {Info,Error} = require('./logger.js');

// request logger
const requestLogger = (request,response,next) => {
    Info('Method : ',request.method);
    Info('Path   : ',request.path);
    Info( 'Body   : ', JSON.stringify(request.body));
    Info('Requested Time   : ',new Date().toLocaleString());
    Info('........................')
    next();
};

module.exports=requestLogger;