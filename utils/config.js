// import dotenv and config the process
require('dotenv').config();

// define all env
const MongoDb_Url = process.env.MONGODB_URL;
const Port = process.env.PORT;
const UserName = process.env.USER_NAME;
const Password = process.env.PASSWORD;
const Jwt = process.env.JWT_TOKEN;
const FE_baseUrl = process.env.BASE_URL_FE;

// export modules
module.exports = {
    MongoDb_Url,Port,UserName,Password,Jwt,FE_baseUrl
};