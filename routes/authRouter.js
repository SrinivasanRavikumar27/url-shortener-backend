// import router using express js 
const authRouter = require('express').Router();
// import auth controller for function to pass in router
const authController = require('../controllers/authController.js');

// define all api routes here 
authRouter.post('/signup',authController.signup);
authRouter.post('/activate',authController.activateAccount);
authRouter.post('/login',authController.login);
authRouter.post('/reset-password',authController.sendPasswordResetEmail);
authRouter.patch('/updatePassword',authController.updatePassword);
 
// export module 
module.exports = authRouter;