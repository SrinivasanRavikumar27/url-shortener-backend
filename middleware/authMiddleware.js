// import jwt and config js to authenicate with jwt token
const jwt = require('jsonwebtoken');
const config = require('../utils/config.js');
const { Info } = require('../utils/logger.js');

// getToken function 
const getToken = (request) => {
    const authorization = request.get('authorization');
     if(authorization && authorization.toLowerCase().startsWith('bearer')){
         return authorization.substring(7);
     }
     return null;
}

// create  middleware function to verify jwt token in the header of request
const authMiddleware = {

    // verify token
    verifyToken : (request,response,next) => {

        // define token
        const token = request.headers.authorization;

        // console.log(token);

        // token generated or not
        if(!token){
            response.status(401).json({message: 'No Token Provided !  Please Login Again.'});
        }else{
            try {
                
                Info('token valdation start here ..');

                //  verify token using json web token
                jwt.verify(getToken(request),config.Jwt,(error,decodedToken) => {

                    if(error){
                        if(error.name === 'TokenExpiredError'){
                            return response.status(401).json({message : 'token Expired !  Please Login Again.',error : error.message});
                        }else{
                            return response.status(401).json({message : 'invalid Token !  Please Login Again.', error : error.message});
                        }
                    }

                    // define  req object by adding user from decoded token
                    request.userId = decodedToken.id;

                    next();

                })

            } catch (error) {
                return response.status(401).json({ message:'Invalid Token' });
            }
        }

    }

}

module.exports = authMiddleware;