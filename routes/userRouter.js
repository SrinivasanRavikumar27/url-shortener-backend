// import router from express js
const userRouter = require('express').Router();
// import user controller
const userController = require('../controllers/userController.js');
// import  middleware for authentication and authorization
const authMiddleware = require('../middleware/authMiddleware.js');

// get all users route
userRouter.get('/getProfile',authMiddleware.verifyToken,userController.getUserProfile);
userRouter.put('/editProfile',authMiddleware.verifyToken,userController.editProfile);
userRouter.delete('deleteProfile',authMiddleware.verifyToken,userController.deleteProfile);

// export  the router
module.exports = userRouter;